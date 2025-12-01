/**
 * Lambda: POST /admin/users
 * Roles: Admin Sede
 */

const bcrypt = require('bcryptjs');
const { getUserFromEvent, validateAccess } = require('../../shared/auth/jwt-utils');
const { putItem } = require('../../shared/database/dynamodb-client');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, forbidden, serverError } = require('../../shared/utils/response');
const { v4: uuidv4 } = require('uuid');

const USERS_TABLE = process.env.USERS_TABLE;

module.exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    validateAccess(user, [USER_ROLES.ADMIN_SEDE]);
    
    const body = JSON.parse(event.body);
    
    // Validar campos requeridos
    if (!body.email || !body.password || !body.role) {
      return badRequest('email, password y role son requeridos');
    }
    // Normalizar el rol a los valores exactos permitidos
    const allowedRoles = ['Cocinero', 'Cheff Ejecutivo', 'Empacador', 'Admin Sede', 'Repartidor'];
    if (body.role) {
      // Eliminar espacios extras y capitalizar correctamente
      let normalizedRole = body.role.trim().toLowerCase();
      if (normalizedRole === 'cocinero') body.role = 'Cocinero';
      else if (normalizedRole === 'cheff ejecutivo' || normalizedRole === 'chef ejecutivo') body.role = 'Cheff Ejecutivo';
      else if (normalizedRole === 'empacador') body.role = 'Empacador';
      else if (normalizedRole === 'admin sede' || normalizedRole === 'adminsede') body.role = 'Admin Sede';
      else if (normalizedRole === 'repartidor') body.role = 'Repartidor';
    }
    if (!allowedRoles.includes(body.role)) {
      return badRequest('Solo se pueden crear usuarios con roles de staff: Cocinero, Cheff Ejecutivo, Empacador, Admin Sede, Repartidor');
    }

    if (!body.name && (!body.firstName || !body.lastName)) {
      return badRequest('Debe proporcionar name o firstName/lastName');
    }
    if (!body.address || !body.phoneNumber) {
      return badRequest('address y phoneNumber son requeridos');
    }

    if (!user.tenant_id) {
      return forbidden('tenant_id requerido');
    }
    
    // Soportar tanto "name" como "firstName/lastName"
    let firstName, lastName;
    if (body.name) {
      const parts = body.name.trim().split(' ');
      firstName = parts[0]; 
      lastName = parts.slice(1).join(' ') || parts[0];
    } else {
      firstName = body.firstName;
      lastName = body.lastName;
    }
    
    const passwordHash = await bcrypt.hash(body.password, 10);
    
    // Permitir especificar tenant_id en el body, por defecto usar el del admin
    const targetTenantId = body.tenant_id || user.tenant_id;
    
    const timestamp = new Date().toISOString();
    const newUser = {
      userId: uuidv4(),
      email: body.email,
      passwordHash,
      firstName,
      lastName,
      role: body.role,
      tenant_id: targetTenantId,
      address: body.address,
      phoneNumber: body.phoneNumber,
      status: 'ACTIVE',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await putItem(USERS_TABLE, newUser);

    // Si el rol es REPARTIDOR, crear también en la tabla de drivers
    if (body.role === USER_ROLES.REPARTIDOR) {
      const DRIVERS_TABLE = process.env.DRIVERS_TABLE;
      const driver = {
        driverId: uuidv4(),
        userId: newUser.userId,
        name: `${firstName} ${lastName}`,
        vehicleType: body.vehicleType || 'moto',
        tenant_id: targetTenantId,
        isAvailable: true,
        currentDeliveries: 0,
        createdAt: timestamp
      };
      await putItem(DRIVERS_TABLE, driver);
    }

    // Si el rol es CHEF_EJECUTIVO o COCINERO, crear también en la tabla de cocineros (Cooks)
    if (body.role === USER_ROLES.CHEF_EJECUTIVO || body.role === USER_ROLES.COCINERO) {
      const COOKS_TABLE = process.env.COOKS_TABLE || process.env.CHEFS_TABLE;
      const cook = {
        cook_id: uuidv4(),
        userId: newUser.userId,
        name: `${firstName} ${lastName}`,
        tenant_id: targetTenantId,
        role: body.role,
        isAvailable: true,
        currentOrders: 0,
        createdAt: timestamp
      };
      await putItem(COOKS_TABLE, cook);
    }

    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return success({ user: userWithoutPassword });
  } catch (error) {
    console.error('❌ Error:', error);
    return serverError('Error al crear usuario', error);
  }
};
