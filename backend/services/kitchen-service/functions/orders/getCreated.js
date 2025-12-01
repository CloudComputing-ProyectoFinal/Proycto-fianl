/**
 * Lambda: GET /kitchen/orders/created
 * Roles: Chef Ejecutivo, Cocinero
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');
const { ORDER_STATUS } = require('../../shared/constants/order-status');

const ORDERS_TABLE = process.env.ORDERS_TABLE;

module.exports.handler = async (event) => {
  try {
    // Solo aceptar formato Bearer <token>
    let user;
    let token = null;
    if (event.headers && event.headers.Authorization) {
      const authHeader = event.headers.Authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      } else {
        return forbidden('Formato de Authorization inválido. Debe ser Bearer <token>');
      }
    } else {
      return forbidden('Header Authorization requerido');
    }
    // Decodificar el JWT manualmente (sin verificar la firma)
    const payload = token.split('.')[1];
    if (payload) {
      try {
        user = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
      } catch (err) {
        user = null;
      }
    }
    if (!user) return forbidden('Token inválido o no proporcionado');
    validateAccess(user, [USER_ROLES.CHEF_EJECUTIVO, USER_ROLES.COCINERO]);
    
    if (!user.tenant_id) {
      return forbidden('tenant_id requerido');
    }
    
    // Listar órdenes en estado CREATED
    const orders = await query(
      ORDERS_TABLE,
      'tenant_id = :tenant_id AND #status = :status',
      { ':tenant_id': user.tenant_id, ':status': 'CREATED' },
      'tenant-status-index',
      null,
      { '#status': 'status' }
    );
    
    return success({ orders });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al obtener órdenes', error);
  }
};
