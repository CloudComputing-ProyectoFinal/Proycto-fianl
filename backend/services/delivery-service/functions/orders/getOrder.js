const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, notFound, serverError } = require('../../shared/utils/response');
const ORDERS_TABLE = process.env.ORDERS_TABLE;

/**
 * GET /delivery/orders/current - Obtener la orden actual del repartidor
 * Si se pasa {orderId} en el path, busca esa orden específica
 * Si el path es "current", busca la orden actual del driver en la tabla Drivers
 * Roles: Repartidor
 */
exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    console.log('👤 Usuario:', JSON.stringify(user, null, 2));
    
    if (!user || user.role !== USER_ROLES.REPARTIDOR) {
      return forbidden('Solo repartidores pueden ver sus órdenes');
    }
    
    const { orderId } = event.pathParameters || {};
    
    // Si pide "current", buscar la orden actual del driver
    if (!orderId || orderId === 'current') {
      console.log('� Buscando orden actual del driver:', user.userId);
      
      // Buscar en tabla Drivers el current_order_id
      const DRIVERS_TABLE = process.env.DRIVERS_TABLE || 'Drivers-dev';
      const drivers = await require('../../shared/database/dynamodb-client').scan(
        DRIVERS_TABLE,
        'userId = :userId',
        { ':userId': user.userId }
      );
      
      if (!drivers || drivers.length === 0) {
        return notFound('Driver no encontrado en el sistema');
      }
      
      const driver = drivers[0];
      const currentOrderId = driver.current_order_id;
      
      if (!currentOrderId) {
        return success({ 
          message: 'No tienes órdenes asignadas actualmente',
          order: null,
          driver: {
            driverId: driver.driverId,
            name: driver.name,
            isAvailable: driver.isAvailable
          }
        });
      }
      
      console.log('📦 Orden actual encontrada:', currentOrderId);
      
      // Buscar la orden
      const order = await getItem(ORDERS_TABLE, { orderId: currentOrderId });
      
      if (!order) {
        return notFound('Orden no encontrada');
      }
      
      return success({ order });
    }
    
    // Si se pasa un orderId específico, buscarlo y validar
    console.log('�📦 Buscando orden específica:', orderId);
    
    const order = await getItem(ORDERS_TABLE, { orderId: decodeURIComponent(orderId) });
    
    if (!order) {
      return notFound('Orden no encontrada');
    }
    
    console.log('✅ Orden encontrada:', order.orderId);
    console.log('🚚 Driver asignado:', order.driver_id);
    console.log('👤 Driver actual:', user.userId);
    
    // Verificar que la orden esté asignada a este driver
    const assignedDriver = order.driver_id || order.assignedDriverId;
    
    if (!assignedDriver) {
      return forbidden('Esta orden no tiene un repartidor asignado');
    }
    
    if (assignedDriver !== user.userId) {
      return forbidden('No tienes acceso a esta orden. Solo puedes ver órdenes asignadas a ti.');
    }
    
    return success({ order });
  } catch (err) {
    console.error('❌ Error:', err);
    return serverError('Error al obtener la orden', err);
  }
};
