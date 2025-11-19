// JWT Utilities - Compartido entre servicios
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-fridays-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generar JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Verificar JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Decodificar token sin verificar (útil para debugging)
 */
function decodeToken(token) {
  return jwt.decode(token);
}

/**
 * Extraer datos del usuario del event de API Gateway
 * (después de pasar por el authorizer)
 */
function getUserFromEvent(event) {
  const authorizer = event.requestContext?.authorizer;
  
  if (!authorizer) {
    return null;
  }

  return {
    userId: authorizer.userId,
    email: authorizer.email,
    role: authorizer.role,
    tenantId: authorizer.tenantId === 'null' ? null : authorizer.tenantId
  };
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  getUserFromEvent
};
