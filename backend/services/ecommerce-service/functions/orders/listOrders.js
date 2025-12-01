/**
 * Lambda: GET /orders
 * Roles: ADMIN_SEDE, Cocinero, Cheff Ejecutivo, Empacador
 * 
 * - Admin Sede: ve todas las órdenes de su tenant
 * - Staff (Cocinero, Cheff, Empacador): solo ven órdenes de su tenant con validación adicional
 */

const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { query, scan } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, forbidden, serverError } = require('../../shared/utils/response');

const ORDERS_TABLE = process.env.ORDERS_TABLE;

// Roles permitidos para ver órdenes
const ALLOWED_ROLES = [
  USER_ROLES.ADMIN_SEDE,
  'Cocinero',
  'Cheff Ejecutivo',
  'Empacador'
];

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    console.log('👤 Usuario solicitando órdenes:', user.email, '- Rol:', user.role);
    
    validateAccess(user, ALLOWED_ROLES);
    
    if (!user.tenant_id) {
      return forbidden('tenant_id requerido para listar órdenes');
    }
    
    console.log('🏢 Tenant del usuario:', user.tenant_id);
    
    // Intentar usar índice si existe, sino usar scan
    let orders;
    try {
      orders = await query(
        ORDERS_TABLE,
        'tenant_id = :tenant_id',
        { ':tenant_id': user.tenant_id },
        'tenant-index'
      );
      console.log('✅ Órdenes obtenidas con query (tenant-index)');
    } catch (queryError) {
      console.log('⚠️ Índice tenant-index no disponible, usando scan');
      orders = await scan(
        ORDERS_TABLE,
        'tenant_id = :tenant_id',
        { ':tenant_id': user.tenant_id }
      );
    }
    
    console.log(`📦 Total de órdenes encontradas: ${orders.length}`);
    
    // Si es staff (no admin), validar que los productos de cada orden sean del mismo tenant
    const isStaff = ['Cocinero', 'Cheff Ejecutivo', 'Empacador'].includes(user.role);
    
    if (isStaff) {
      console.log('👨‍🍳 Usuario es staff, validando tenant de productos...');
      
      // Filtrar órdenes donde TODOS los productos pertenecen al tenant del usuario
      const validOrders = orders.filter(order => {
        // Si la orden no tiene items, no es válida para el staff
        if (!order.items || order.items.length === 0) {
          return false;
        }
        
        // Verificar que TODOS los productos tengan el mismo tenant que el usuario
        const allProductsMatchTenant = order.items.every(item => {
          // Si el producto tiene tenant_id, verificarlo
          if (item.tenant_id) {
            return item.tenant_id === user.tenant_id;
          }
          // Si no tiene tenant_id explícito, asumir que es del tenant de la orden
          return order.tenant_id === user.tenant_id;
        });
        
        return allProductsMatchTenant;
      });
      
      console.log(`✅ Órdenes validadas para staff: ${validOrders.length} de ${orders.length}`);
      
      return success({ 
        orders: validOrders,
        count: validOrders.length,
        role: user.role,
        tenant_id: user.tenant_id
      });
    }
    
    // Si es Admin Sede, retornar todas las órdenes del tenant sin filtro adicional
    console.log('👔 Usuario es Admin Sede, mostrando todas las órdenes del tenant');
    
    return success({ 
      orders,
      count: orders.length,
      role: user.role,
      tenant_id: user.tenant_id
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al listar órdenes', error);
  }
};
