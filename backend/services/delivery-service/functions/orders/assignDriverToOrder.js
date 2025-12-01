/**
 * Lambda: Asignar driver a una orden
 * Usada por Step Function cuando el estado cambia a READY
 * 
 * Implementa asignación bidireccional:
 * - Actualiza Orders con driver_id (historial permanente)
 * - Actualiza Drivers con current_order_id (estado temporal)
 */

const { getItem, updateItem, scan } = require('../../shared/database/dynamodb-client');

const ORDERS_TABLE = process.env.ORDERS_TABLE || 'Orders-dev';
const DRIVERS_TABLE = process.env.DRIVERS_TABLE || 'Drivers-dev';

exports.handler = async (event) => {
  console.log('📦 Asignando driver a orden:', JSON.stringify(event, null, 2));

  try {
    // Extraer datos del evento (viene del Step Function)
    const { orderId, order_id, tenant_id, driverInfo, driver: driverFromEvent } = event;
    
    // Normalizar: puede venir como orderId u order_id
    const finalOrderId = orderId || order_id;
    
    if (!finalOrderId) {
      throw new Error('orderId es requerido');
    }

    const timestamp = new Date().toISOString();

    // 0. Si no se pasó driver, buscar uno disponible automáticamente
    let driverId;
    let driverName;
    
    if (driverInfo && driverInfo.driver_id) {
      driverId = driverInfo.driver_id;
      driverName = driverInfo.name;
    } else if (driverFromEvent && driverFromEvent.driver_id) {
      driverId = driverFromEvent.driver_id;
      driverName = driverFromEvent.name;
    } else {
      // Buscar driver disponible automáticamente
      console.log('🔍 Buscando driver disponible para tenant:', tenant_id);
      
      const drivers = await scan(
        DRIVERS_TABLE,
        'isAvailable = :available AND tenant_id = :tenant',
        { ':available': true, ':tenant': tenant_id }
      );
      
      if (!drivers || drivers.length === 0) {
        throw new Error(`No hay drivers disponibles en el tenant ${tenant_id}`);
      }
      
      // Seleccionar el primer driver disponible
      const availableDriver = drivers[0];
      driverId = availableDriver.driverId;
      driverName = availableDriver.name || 'Driver';
      
      console.log(`✅ Driver disponible encontrado: ${driverId} (${driverName})`);
    }

    // 1. Verificar que la orden existe (CLAVE: orderId no order_id)
    const order = await getItem(ORDERS_TABLE, { orderId: finalOrderId });
    if (!order) {
      throw new Error(`Orden ${finalOrderId} no encontrada`);
    }

    // 2. Verificar que el driver existe (CLAVE: driverId no driver_id)
    const driver = await getItem(DRIVERS_TABLE, { driverId: driverId });
    if (!driver) {
      throw new Error(`Driver ${driverId} no encontrado`);
    }

    console.log(`✅ Orden encontrada: ${finalOrderId}, Driver encontrado: ${driverId}`);
    console.log(`👤 userId del driver: ${driver.userId}`);

    // IMPORTANTE: Guardar el userId (no el driverId) para que coincida con el token JWT
    const userIdToSave = driver.userId || driverId;

    // 3. Actualizar la ORDEN (agregar driver_id y cambiar estado a ASSIGNED)
    // CLAVE: orderId no order_id
    // driver_id debe ser el userId para coincidir con el JWT
    const updatedOrder = await updateItem(
      ORDERS_TABLE,
      { orderId: finalOrderId },
      'SET driver_id = :driver_id, driver_name = :driver_name, assigned_at = :timestamp, #status = :status, updated_at = :updated_at',
      {
        ':driver_id': userIdToSave, // Usar userId, no driverId
        ':driver_name': driverName || driver.name || 'Driver',
        ':timestamp': timestamp,
        ':status': 'ASSIGNED', // Estado tras asignación
        ':updated_at': timestamp
      },
      { '#status': 'status' } // ExpressionAttributeNames
    );

    console.log('✅ Orden actualizada con driver_id:', driverId);

    // 4. Actualizar el DRIVER (marcar como ocupado con current_order_id)
    // IMPORTANTE: La clave primaria es driverId (no driver_id)
    const updatedDriver = await updateItem(
      DRIVERS_TABLE,
      { driverId: driverId },
      'SET current_order_id = :order_id, isAvailable = :available, assigned_at = :timestamp, updated_at = :updated_at, currentDeliveries = if_not_exists(currentDeliveries, :zero) + :inc',
      {
        ':order_id': finalOrderId,
        ':available': false, // Ahora está ocupado
        ':timestamp': timestamp,
        ':updated_at': timestamp,
        ':zero': 0,
        ':inc': 1 // Incrementar contador de entregas
      }
    );

    console.log('✅ Driver actualizado con current_order_id:', finalOrderId);

    // 5. Retornar resultado para el Step Function
    return {
      statusCode: 200,
      orderId: finalOrderId,
      order_id: finalOrderId, // Ambos formatos para compatibilidad
      driverId: driverId, // ID de la tabla Drivers
      driver_id: userIdToSave, // userId para validación JWT
      userId: userIdToSave, // userId del repartidor
      driverName: driverName || driver.name,
      status: 'ASSIGNED',
      assigned_at: timestamp,
      message: `Orden ${finalOrderId} asignada al driver ${driverName} (userId: ${userIdToSave})`
    };

  } catch (error) {
    console.error('❌ Error asignando driver a orden:', error);
    
    // Retornar error para que el Step Function pueda manejarlo
    return {
      statusCode: 500,
      error: error.message,
      orderId: event.orderId || event.order_id,
      message: 'Error al asignar driver a orden'
    };
  }
};
