/**
 * Lambda: DELETE /admin/products/{productId}
 * Roles: Admin Sede
 * 
 * Elimina (soft delete) un producto del tenant del usuario
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, notFound, forbidden, serverError } = require('../../shared/utils/response');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'Products-dev';

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    console.log('🔑 Usuario:', JSON.stringify(user));
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);

    const productIdRaw = event.pathParameters.productId;
    const productId = decodeURIComponent(productIdRaw);
    console.log('🆔 productId recibido:', productIdRaw);
    console.log('🆔 productId decodificado:', productId);

    // Verificar que el producto existe
    const product = await getItem(PRODUCTS_TABLE, { productId });
    console.log('📦 Producto encontrado:', JSON.stringify(product));
    if (!product) {
      console.log('❌ Producto no encontrado en la base de datos');
      return notFound('Producto no encontrado');
    }

    // Verificar que pertenece al tenant del usuario
    console.log('🔗 tenant_id producto:', product.tenant_id, '| tenant_id usuario:', user.tenant_id);
    if (product.tenant_id !== user.tenant_id) {
      console.log('⛔ Acceso denegado: tenant_id no coincide');
      return forbidden('No tienes acceso a este producto');
    }

    // Hard delete: eliminar el producto de la tabla
    const { deleteItem } = require('../../shared/database/dynamodb-client');
    await deleteItem(PRODUCTS_TABLE, { productId });
    console.log('🗑️ Producto eliminado de la base de datos:', productId);

    return success({ 
      productId,
      message: 'Producto eliminado permanentemente'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al eliminar producto', error);
  }
};
