// Shared Auth Authorizer para API Gateway
// Este archivo será usado por TODOS los microservicios

const jwt = require('jsonwebtoken');

// En producción, usar AWS Secrets Manager
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-fridays-2025';

/**
 * Lambda Authorizer para API Gateway
 * Valida JWT tokens en el header Authorization
 */
module.exports.handler = async (event) => {
  console.log('🔐 Auth Request:', JSON.stringify(event, null, 2));

  try {
    // Extraer token del header
    const token = extractToken(event.authorizationToken);
    
    if (!token) {
      throw new Error('No token provided');
    }

    // Verificar y decodificar JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ Token válido:', decoded);

    // Generar policy de acceso
    return generatePolicy(decoded.userId, 'Allow', event.methodArn, {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId || 'null'
    });

  } catch (error) {
    console.error('❌ Auth Error:', error.message);
    
    // Retornar Deny si el token es inválido
    throw new Error('Unauthorized');
  }
};

/**
 * Extraer token del header Authorization
 */
function extractToken(authHeader) {
  if (!authHeader) {
    return null;
  }

  // Formato: "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  // Si no tiene "Bearer", asumir que es solo el token
  return parts[0];
}

/**
 * Generar IAM Policy para API Gateway
 */
function generatePolicy(principalId, effect, resource, context) {
  const authResponse = {
    principalId
  };

  if (effect && resource) {
    authResponse.policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    };
  }

  // Context se pasa a la función Lambda en event.requestContext.authorizer
  if (context) {
    authResponse.context = context;
  }

  return authResponse;
}
