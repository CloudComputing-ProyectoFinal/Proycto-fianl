# Corrección de CORS - Backend

## 📋 Resumen de Cambios

Se han aplicado correcciones completas de CORS en todo el backend para permitir el acceso desde cualquier origen (`*`), manteniendo la autenticación y autorización por roles.

## ✅ Cambios Realizados

### 1. Configuración de API Gateway (serverless.yml)

Se actualizó la configuración de CORS en **5 servicios** y **67 endpoints**:

- ✅ **ecommerce-service**: 29 endpoints actualizados
- ✅ **admin-service**: 17 endpoints actualizados  
- ✅ **delivery-service**: 10 endpoints actualizados
- ✅ **kitchen-service**: 7 endpoints actualizados
- ✅ **websocket-service**: 4 endpoints actualizados

**Cambio aplicado:**
```yaml
# ANTES
cors: true

# DESPUÉS
cors:
  origin: '*'
  headers:
    - Content-Type
    - X-Amz-Date
    - Authorization
    - X-Api-Key
    - X-Amz-Security-Token
    - X-Amz-User-Agent
  allowCredentials: true
```

### 2. Headers HTTP en Respuestas Lambda

✅ Archivo `shared/utils/response.js` ya incluía correctamente:

```javascript
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
}
```

Aplicado a todas las funciones de respuesta:
- ✅ `success()` - 200
- ✅ `created()` - 201
- ✅ `noContent()` - 204
- ✅ `badRequest()` - 400
- ✅ `unauthorized()` - 401
- ✅ `forbidden()` - 403
- ✅ `notFound()` - 404
- ✅ `serverError()` - 500

### 3. Middlewares

✅ Actualizado `shared/middlewares/mock-auth.js` para incluir headers de CORS en respuestas 401 y 403.

## 🔐 Seguridad Mantenida

**IMPORTANTE:** Los siguientes filtros de seguridad se mantienen intactos:

- ✅ **Autenticación JWT**: Los endpoints protegidos siguen requiriendo token válido
- ✅ **Autorización por Roles**: Los middlewares validan roles (Cliente, Cocinero, Repartidor, Admin)
- ✅ **Authorizer**: Lambda authorizer sigue validando tokens y generando políticas IAM
- ✅ **Tenant Isolation**: Validación de `tenant_id` para usuarios staff

**Lo único que cambió es que ahora CORS permite llamadas desde cualquier origen.**

## 🚀 Próximos Pasos

Para aplicar los cambios en AWS, debes redesplegar los servicios:

```bash
cd backend

# Opción 1: Redesplegar todos los servicios
./deploy-all.sh

# Opción 2: Redesplegar solo los servicios modificados
cd services/ecommerce-service && npx serverless deploy && cd ../..
cd services/admin-service && npx serverless deploy && cd ../..
cd services/delivery-service && npx serverless deploy && cd ../..
cd services/kitchen-service && npx serverless deploy && cd ../..
cd services/websocket-service && npx serverless deploy && cd ../..
```

## 🧪 Verificación

Después del despliegue, verifica que:

1. ✅ Las respuestas OPTIONS (preflight) devuelven 200 con headers CORS
2. ✅ Las respuestas GET/POST/PUT/DELETE incluyen headers CORS
3. ✅ Los endpoints protegidos siguen requiriendo autenticación
4. ✅ Los roles se siguen validando correctamente

### Prueba desde el navegador:

```javascript
// Debe funcionar sin errores de CORS
fetch('https://tu-api-url.com/menu', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error('Error:', err));

// Con autenticación
fetch('https://tu-api-url.com/orders', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error('Error:', err));
```

## 📝 Archivos Modificados

```
backend/
├── services/
│   ├── ecommerce-service/serverless.yml    ✓ Actualizado
│   ├── admin-service/serverless.yml        ✓ Actualizado
│   ├── delivery-service/serverless.yml     ✓ Actualizado
│   ├── kitchen-service/serverless.yml      ✓ Actualizado
│   └── websocket-service/serverless.yml    ✓ Actualizado
├── shared/
│   ├── utils/response.js                   ✓ Ya tenía CORS (sin cambios)
│   └── middlewares/mock-auth.js            ✓ Actualizado
└── scripts/
    ├── fix-cors-v2.py                      ✓ Script de actualización
    └── CORS-FIX-SUMMARY.md                 ✓ Este documento
```

## ⚠️ Notas Importantes

1. **AWS Academy**: Asegúrate de que tu sesión de AWS Academy esté activa antes de desplegar
2. **Credenciales**: Verifica que las credenciales de AWS estén configuradas
3. **Región**: Los servicios están configurados para `us-east-1`
4. **Tiempo**: El despliegue completo puede tomar 10-15 minutos

## 🐛 Solución de Problemas

Si sigues teniendo errores de CORS después del despliegue:

1. Verifica que el despliegue fue exitoso: `npx serverless info`
2. Limpia la caché del navegador (Ctrl+Shift+Delete)
3. Verifica la red en DevTools (F12) → Network
4. Busca la respuesta OPTIONS (preflight) → debe devolver headers CORS
5. Verifica que estás usando las URLs correctas de los endpoints desplegados

---

**Fecha**: 2025-12-02
**Autor**: GitHub Copilot
**Estado**: ✅ Completado - Listo para desplegar
