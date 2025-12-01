/**
 * Lambda: GET /kitchen/chefs
 * Roles: Chef Ejecutivo, Admin Sede
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');

const USERS_TABLE = process.env.USERS_TABLE || 'Users-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.CHEF_EJECUTIVO, USER_ROLES.ADMIN_SEDE]);
    
    if (!user.tenant_id) {
      return forbidden('tenant_id requerido');
    }
    
    const COOKS_TABLE = process.env.COOKS_TABLE || 'Cooks-dev';
    
    // Permitir filtrar por rol desde query params (opcional)
    const queryParams = event.queryStringParameters || {};
    let roleFilter = queryParams.role;
    
    if (roleFilter) {
      // Normalizar el valor del filtro
      if (roleFilter.toLowerCase() === 'cocinero') roleFilter = 'Cocinero';
      if (roleFilter.toLowerCase() === 'chef_ejecutivo' || roleFilter.toLowerCase() === 'chefejecutivo' || roleFilter.toLowerCase() === 'cheff ejecutivo') roleFilter = 'Cheff Ejecutivo';
    }

    // Buscar por tenant_id en la tabla Cooks
    const cooksRaw = await query(
      COOKS_TABLE,
      'tenant_id = :tenant_id',
      { ':tenant_id': user.tenant_id },
      'tenant-index',
      null
    );

    let cooks;
    if (!roleFilter || roleFilter === 'ALL') {
      // Sin filtro: mostrar AMBOS roles (Cocinero y Cheff Ejecutivo)
      cooks = cooksRaw.filter(c => c.role === 'Cocinero' || c.role === 'Cheff Ejecutivo');
    } else {
      // Con filtro: mostrar solo el rol especificado
      cooks = cooksRaw.filter(c => c.role === roleFilter);
    }

    return success({ cooks });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al listar chefs', error);
  }
};
