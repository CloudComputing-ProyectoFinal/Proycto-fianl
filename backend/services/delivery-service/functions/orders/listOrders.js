const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { scan } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');
const ORDERS_TABLE = process.env.ORDERS_TABLE;

/**
 * GET /delivery/orders - Listar órdenes de delivery para el driver
 * Roles: Repartidor
 * 
 * Query params opcionales:
 * - status: filtrar por estado (ASSIGNED, IN_TRANSIT, DELIVERED, etc.)
 */
exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    console.log('👤 Usuario:', JSON.stringify(user, null, 2));
    
    if (!user || user.role !== USER_ROLES.REPARTIDOR) {
      return forbidden('Solo repartidores pueden ver sus órdenes');
    }
    
    // Obtener parámetros opcionales
    const status = event.queryStringParameters?.status;
    
    console.log('🔍 Buscando órdenes del driver:', user.userId);
    if (status) {
      console.log('📊 Filtrado por estado:', status);
    }
    
    // Construir expresión de filtro
    let filterExpression = 'driver_id = :driverId';
    let expressionValues = { ':driverId': user.userId };
    let expressionNames = null;
    
    // Si se especifica estado, agregar al filtro
    if (status) {
      filterExpression += ' AND #status = :status';
      expressionValues[':status'] = status;
      expressionNames = { '#status': 'status' };
    }
    
    // Buscar órdenes asignadas al driver
    // scan(tableName, filterExpression, expressionValues, limit, expressionNames)
    const allOrders = await scan(
      ORDERS_TABLE,
      filterExpression,
      expressionValues,
      null, // limit
      expressionNames || {}
    );
    
    console.log(`✅ Encontradas ${allOrders.length} órdenes`);
    
    // Ordenar por fecha de asignación (más recientes primero)
    const orders = allOrders.sort((a, b) => {
      const dateA = new Date(a.assigned_at || a.createdAt);
      const dateB = new Date(b.assigned_at || b.createdAt);
      return dateB - dateA;
    });
    
    return success({ 
      orders,
      count: orders.length,
      driverId: user.userId,
      filter: status ? { status } : null
    });
  } catch (err) {
    console.error('❌ Error:', err);
    return serverError('Error al listar órdenes', err);
  }
};
