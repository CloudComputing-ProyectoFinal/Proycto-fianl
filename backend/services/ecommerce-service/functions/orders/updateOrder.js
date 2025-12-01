const { success, badRequest, unauthorized, serverError } = require('../../shared/utils/response');
const { getItem, putItem, query, scan, updateItem, deleteItem } = require('../../shared/database/dynamodb-client');
const { validateOwnership, validateTenantAccess } = require('../../shared/utils/validation');
const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const SNS_TOPIC_ARN = process.env.SNS_NOTIFICATIONS_TOPIC_ARN;

/**
 * PUT /orders/{{orderId}} - Admin update order
 */
exports.handler = async (event) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    const { orderId } = event.pathParameters;
    const { status, ...updateFields } = JSON.parse(event.body);
    if (!orderId || !status) {
      return badRequest('orderId y status son requeridos');
    }

    // Obtener orden actual
  const ORDERS_TABLE = process.env.ORDERS_TABLE || 'Orders-dev';
  console.log('Consultando orderId:', orderId);
  const decodedOrderId = decodeURIComponent(orderId);
  console.log('OrderId decodificado:', decodedOrderId);
  const orderResult = await getItem(ORDERS_TABLE, { orderId: decodedOrderId });
      if (!orderResult) {
        return badRequest('Orden no encontrada');
      }

      // Bloquear cambios si la orden ya está en DELIVERED
      if (orderResult.status === 'DELIVERED') {
        return badRequest('No se puede modificar una orden entregada');
      }

    // Obtener usuario que hace el cambio
    const user = event.requestContext?.authorizer || {};
    
    // Validación: solo el cocinero asignado puede cambiar de CREATED a COOKING
    if (
      orderResult.status === 'CREATED' &&
      status === 'COOKING'
    ) {
      // El cocinero asignado puede estar en cookId o userId de la orden
      const assignedCookId = orderResult.cookId || orderResult.cook_id || orderResult.userId;
      const requesterId = user.userId || user.cookId || user.cook_id;
      if (!assignedCookId || assignedCookId !== requesterId) {
        return unauthorized('Solo el cocinero asignado puede iniciar la preparación de la orden');
      }
    }

    // Validación: solo el driver asignado puede cambiar el estado de su orden asignada
    if (orderResult.driver_id && user.role === 'Repartidor') {
      const assignedDriverId = orderResult.driver_id || orderResult.driverId;
      const requesterId = user.userId || user.driver_id || user.driverId;
      
      if (!assignedDriverId || assignedDriverId !== requesterId) {
        return unauthorized('Solo el repartidor asignado puede actualizar esta orden');
      }
    }

    // Construir nombre usando name, o firstName + lastName si están disponibles
    let fullName = user.name || '';
    if (!fullName && user.firstName) {
      fullName = user.firstName;
      if (user.lastName) {
        fullName += ' ' + user.lastName;
      }
    }
    const updatedBy = {
      email: user.email || '',
      name: fullName,
      role: user.role || '',
      timestamp: new Date().toISOString()
    };

    // Actualizar estado y otros campos
    const updatedOrder = {
      ...orderResult,
      status,
      ...updateFields,
      updatedAt: new Date().toISOString(),
      updatedBy,
      // handler: responsable de la etapa actual
      handler: updateFields.handler || updatedBy,
      // historial de cambios
      history: [
        ...(orderResult.history || []),
        {
          status,
          updatedBy,
          handler: updateFields.handler || updatedBy,
          timestamp: new Date().toISOString()
        }
      ]
    };

    await putItem(ORDERS_TABLE, updatedOrder);

    // Publicar evento en EventBridge para notificación WebSocket
    const eventBridge = new AWS.EventBridge();
    try {
      await eventBridge.putEvents({
        Entries: [
          {
            Source: 'ecommerce-service.orders',
            DetailType: 'OrderStatusChanged',
            EventBusName: process.env.EVENT_BUS_NAME,
            Detail: JSON.stringify({
              orderId,
              previousStatus: orderResult.status,
              newStatus: status,
              tenant_id: updatedOrder.tenant_id || null,
              userId: updatedOrder.userId || null,
              customerInfo: updatedOrder.customerInfo || null,
              updatedBy,
              driverInfo: updatedOrder.driverInfo || null,
              location: updatedOrder.location || null,
              timestamp: updatedOrder.updatedAt
            })
          }
        ]
      }).promise();
      console.log('📡 Evento OrderStatusChanged publicado en EventBridge');
    } catch (ebError) {
      console.error('❌ Error al publicar evento en EventBridge:', ebError);
    }

    // Publicar en SNS
    if (SNS_TOPIC_ARN) {
      try {
        await sns.publish({
          TopicArn: SNS_TOPIC_ARN,
          Subject: `Estado de orden actualizado: ${orderId}`,
          Message: `La orden ${orderId} cambió a estado: ${status}\n\n${JSON.stringify(updatedOrder, null, 2)}`
        }).promise();
        console.log('📧 Notificación SNS enviada');
      } catch (snsError) {
        console.error('❌ Error al publicar en SNS:', snsError);
      }
    }

    // Si el estado es READY, iniciar Step Function de asignación automática de driver
    if (status === 'READY') {
      const stepfunctions = new AWS.StepFunctions();
      const input = {
        orderId: decodedOrderId,
        tenant_id: updatedOrder.tenant_id
      };
      const params = {
        stateMachineArn: process.env.ASSIGN_DRIVER_STEPFUNCTION_ARN,
        input: JSON.stringify(input)
      };
      await stepfunctions.startExecution(params).promise();
      console.log('🚚 Step Function de asignación de driver iniciada');
    }

    // Si el estado es PACKED, puedes agregar lógica adicional aquí (notificación, integración, etc.)
    if (status === 'PACKED') {
      // Ejemplo: notificar al delivery que la orden está lista para recoger
      // await sns.publish({ ... })
      console.log('📦 Orden empaquetada, lista para el delivery');
    }

    // Si el estado es DELIVERED, liberar al driver (actualización bidireccional)
    if (status === 'DELIVERED' && updatedOrder.driver_id) {
      console.log('🎯 Orden entregada, liberando driver:', updatedOrder.driver_id);
      
      try {
        const DRIVERS_TABLE = process.env.DRIVERS_TABLE || 'Drivers-dev';
        
        // Liberar al driver: limpiar current_order_id y marcarlo como disponible
        // IMPORTANTE: La clave primaria de Drivers es driverId (no driver_id)
        await updateItem(
          DRIVERS_TABLE,
          { driverId: updatedOrder.driver_id },
          'SET current_order_id = :null, isAvailable = :available, updated_at = :timestamp',
          {
            ':null': null, // Limpiar orden actual
            ':available': true, // Ahora está disponible
            ':timestamp': new Date().toISOString()
          }
        );
        
        console.log('✅ Driver liberado exitosamente');
      } catch (driverError) {
        console.error('❌ Error al liberar driver:', driverError);
        // No fallar la actualización de la orden si falla la liberación del driver
        // El sistema puede reconciliar esto después
      }
    }

    return success({ message: 'Orden actualizada', order: updatedOrder });
  } catch (err) {
    console.error('Error:', err);
    return serverError(err.message || 'Error interno del servidor', err);
  }
};
