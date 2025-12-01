/**
 * Lambda: POST /auth/register
 * Roles: PUBLIC (Cliente)
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales hardcodeadas
 * - Usa módulos compartidos (sin credenciales)
 * - Valida datos de entrada
 * - Hash de contraseñas con bcrypt
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { putItem, query } = require('../../shared/database/dynamodb-client');
const { generateToken } = require('../../shared/auth/jwt-utils');
const { USER_ROLES } = require('../../shared/constants/user-roles');
const { success, badRequest, serverError } = require('../../shared/utils/response');
const { validateEmail, validateRequiredFields } = require('../../shared/utils/validation');

const USERS_TABLE = process.env.USERS_TABLE;

module.exports.handler = async (event) => {
  console.log('📝 Register request');

  try {
    // Manejar tanto event.body (API Gateway) como event directo (testing)
    const body = event.body ? JSON.parse(event.body) : event;

    // Validar campos requeridos
    validateRequiredFields(body, ['email', 'password', 'firstName', 'lastName']);

    let { email, password, firstName, lastName, phoneNumber, address, tenant_id } = body;

    // Si no se envía tenant_id y el usuario es cliente, asignar 'PUBLIC'
    if (!tenant_id) {
      tenant_id = 'PUBLIC';
    }

    // Validar email
    if (!validateEmail(email)) {
      return badRequest('Email inválido');
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return badRequest('La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar si el email ya existe
    const existingUsers = await query(
      USERS_TABLE,
      'email = :email',
      { ':email': email },
      'email-index'
    );

    if (existingUsers && existingUsers.length > 0) {
      return badRequest('El email ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario cliente
    const userId = uuidv4();
    const timestamp = new Date().toISOString();

    const newUser = {
      userId,
      email,
      passwordHash,
      firstName,
      lastName,
      phoneNumber: phoneNumber || null,
      address: address || null,
      role: USER_ROLES.CLIENTE,
      tenant_id: tenant_id || null,
      status: 'ACTIVE',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await putItem(USERS_TABLE, newUser);

    console.log(`✅ Cliente registrado: ${userId}`);

    // Generar token JWT
    const token = await generateToken({
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
      tenant_id: newUser.tenant_id
    });

    // Respuesta sin la contraseña
    const { passwordHash: omit, ...userWithoutPassword } = newUser;

    return success({
      user: userWithoutPassword,
      token
    }, 'Cliente registrado exitosamente');

  } catch (error) {
    console.error('❌ Register error:', error);
    return serverError('Error al registrar usuario', error);
  }
};
