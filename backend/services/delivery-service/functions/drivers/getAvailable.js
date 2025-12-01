/**
 * Lambda: GET /delivery/drivers/available
 * Roles: Empacador, Admin Sede
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');

const DRIVERS_TABLE = process.env.DRIVERS_TABLE;

module.exports.handler = async (event) => {
  // Permitir obtener tenant_id desde Step Function (event.tenant_id) o desde usuario autenticado (API Gateway)
  try {
    let tenant_id = event.tenant_id;
    if (!tenant_id) {
      // Intentar obtenerlo del usuario autenticado (API Gateway)
      const user = getUserFromEvent(event);
      tenant_id = user && user.tenant_id;
    }
    if (!tenant_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'tenant_id requerido' })
      };
    }
    const allDrivers = await query(
      DRIVERS_TABLE,
      'tenant_id = :tenant_id',
      { ':tenant_id': tenant_id },
      'tenant_id-index'
    );
    // Filtrar y ordenar por menor cantidad de entregas activas
    const drivers = allDrivers
      .filter(d => d.isAvailable === true)
      .sort((a, b) => (a.currentDeliveries || 0) - (b.currentDeliveries || 0));
    if (drivers.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No hay drivers disponibles' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(drivers[0]),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('❌ Error getAvailable:', error);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: error.message || 'Error interno' })
    };
  }
};
