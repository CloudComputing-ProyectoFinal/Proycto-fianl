# 📚 Documentación del Backend - Fridays Perú
## Índice Maestro de Documentación

---

## 🎯 Para el Equipo de Frontend

### 🚀 **Empezar Aquí** (Nuevo en el proyecto)
📄 **[FRONTEND-QUICKSTART.md](./FRONTEND-QUICKSTART.md)**
- ⏱️ Tiempo de lectura: 5 minutos
- 🎯 Propósito: Configuración rápida y primer ejemplo funcional
- ✅ Contenido:
  - Setup en 3 pasos
  - Ejemplo mínimo de login y productos
  - URLs principales
  - Checklist básico

### 📘 **Guía Completa de Integración**
📄 **[FRONTEND-INTEGRATION-GUIDE.md](./FRONTEND-INTEGRATION-GUIDE.md)**
- ⏱️ Tiempo de lectura: 30-45 minutos
- 🎯 Propósito: Referencia completa de todos los servicios y endpoints
- ✅ Contenido:
  - Arquitectura general
  - URLs de todos los servicios
  - Autenticación y autorización (JWT)
  - Documentación de todos los endpoints:
    - E-Commerce Service (productos, carrito, órdenes)
    - Kitchen Service (gestión de cocina)
    - Delivery Service (entregas y tracking)
    - Admin Service (dashboard y reportes)
  - WebSocket para notificaciones en tiempo real
  - Manejo de errores
  - Variables de entorno
  - Colecciones Postman

### 💻 **Código Listo para Usar**
📄 **[FRONTEND-CODE-EXAMPLES.md](./FRONTEND-CODE-EXAMPLES.md)**
- ⏱️ Tiempo de lectura: 20-30 minutos
- 🎯 Propósito: Implementaciones TypeScript/React listas para copiar y pegar
- ✅ Contenido:
  - Estructura de archivos recomendada
  - Configuración de Axios con interceptores
  - Tipos TypeScript completos
  - Servicios completos (auth, products, cart, orders)
  - Hooks personalizados de React:
    - `useAuth` - Manejo de autenticación
    - `useCart` - Manejo del carrito
    - `useWebSocket` - Notificaciones en tiempo real
  - Componentes de ejemplo (Login, ProductCard, Cart)
  - Sistema de notificaciones
  - Checklist de implementación

### 📡 **Referencia Técnica**
📄 **[ENDPOINTS.md](./ENDPOINTS.md)**
- ⏱️ Tiempo de lectura: 10 minutos
- 🎯 Propósito: Lista rápida de todos los recursos deployados
- ✅ Contenido:
  - URLs de API Gateways
  - WebSocket URL
  - ARNs de Step Functions
  - SQS Queues y SNS Topics
  - Parámetros del Parameter Store
  - Resumen de recursos deployados

---

## 🔧 Para el Equipo de Backend

### 📐 **Arquitectura del Sistema**
📄 **[ARCHITECTURE-AUDIT.md](./ARCHITECTURE-AUDIT.md)**
- Arquitectura de microservicios
- Flujos de datos
- Decisiones técnicas

### 🚀 **Guía de Deployment**
📄 **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)**
- Prerequisitos
- Proceso de deployment
- Troubleshooting

### ✅ **Estado del Deployment**
📄 **[DEPLOYMENT-READY.md](./DEPLOYMENT-READY.md)**
- Checklist de deployment
- Validaciones realizadas
- Configuraciones aplicadas

### 📧 **Integración de Emails**
📄 **[SES-EMAIL-INTEGRATION.md](./SES-EMAIL-INTEGRATION.md)**
- Configuración de SendGrid/SES
- Templates de emails

### 🔄 **Flujo de Órdenes**
📄 **[FLUJO-COMPLETO-ORDENES.md](./FLUJO-COMPLETO-ORDENES.md)**
- Flujo completo de una orden
- Estados y transiciones
- Integración entre servicios

### 📊 **Flujo de Endpoints**
📄 **[ENDPOINT-FLOW-GUIDE.md](./ENDPOINT-FLOW-GUIDE.md)**
- Mapeo de endpoints
- Flujos de usuario

---

## 📦 Colecciones Postman

Ubicación: `backend/postman/`

1. **Fridays Perú - E-Commerce Service.postman_collection.json**
   - Autenticación (register, login)
   - Productos (list, search, get by id)
   - Carrito (add, update, remove, clear)
   - Órdenes (checkout, list, get by id, cancel)

2. **Fridays Perú - Kitchen Service.postman_collection.json**
   - Ver órdenes de cocina
   - Asignar órdenes a cocineros
   - Actualizar estados de preparación

3. **Fridays Perú - Delivery Service.postman_collection.json**
   - Ver entregas disponibles
   - Asignar entregas a drivers
   - Actualizar ubicación y estado

4. **Fridays Perú - Admin Service.postman_collection.json**
   - Dashboard y métricas
   - Reportes de ventas
   - Gestión de usuarios
   - Gestión de productos

5. **Fridays Perú - WebSocket Service.postman_collection.json**
   - Conexión y autenticación
   - Eventos de notificaciones

### Importar en Postman
```bash
1. Abrir Postman
2. Click en "Import"
3. Seleccionar los archivos JSON de backend/postman/
4. Configurar variables de entorno:
   - {{baseUrl}}: https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev
   - {{token}}: (obtenido después del login)
```

---

## 🗂️ Scripts Útiles

### Backend (Node.js)

```bash
# Crear tablas DynamoDB en AWS
node scripts/create-tables-aws.js

# Sembrar datos iniciales
node scripts/seed-data-aws.js

# Crear usuario administrador
node scripts/create-admin-user.sh

# Deploy de todos los servicios
./deploy-all.sh

# Obtener endpoints
./get-endpoints.sh
```

### Deployment

```bash
# Deploy individual de un servicio
cd services/ecommerce-service
npx serverless@3 deploy --stage dev --verbose

# Ver logs de una función
serverless logs -f functionName --stage dev --tail

# Remover un servicio
serverless remove --stage dev
```

---

## 🌐 URLs de Producción

### API REST Endpoints

| Servicio | URL Base |
|----------|----------|
| 🛒 E-Commerce | `https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev` |
| 👨‍🍳 Kitchen | `https://6nry2wpzl1.execute-api.us-east-1.amazonaws.com/dev` |
| 🚚 Delivery | `https://8ghxkz67bd.execute-api.us-east-1.amazonaws.com/dev` |
| 👤 Admin | `https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev` |

### WebSocket

```
wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev
```

---

## 📊 Recursos AWS Deployados

### Servicios Principales
- **7 CloudFormation Stacks** (1 por cada servicio)
- **79 Lambda Functions** en total
- **5 API Gateways REST**
- **1 WebSocket API**
- **1 Step Functions State Machine**
- **1 SQS FIFO Queue**
- **1 SNS Topic**
- **3 Parameter Store Parameters**

### Región y Cuenta
- **Región**: us-east-1 (Virginia)
- **Cuenta AWS**: 439535099835
- **Stage**: dev

---

## 🔐 Credenciales y Seguridad

### JWT Tokens
- Los tokens JWT expiran después de **24 horas**
- Se guardan en `localStorage` en el cliente
- Se envían en el header: `Authorization: Bearer {token}`

### Parameter Store
Los siguientes parámetros están en AWS Systems Manager Parameter Store:

```
/fridays/jwt-secret           - Secret para firmar JWT tokens
/fridays/sendgrid-api-key     - API Key de SendGrid
/fridays/sendgrid-from-email  - Email de origen (noreply@fridays.pe)
```

### Roles de Usuario

| Role | Permisos |
|------|----------|
| `customer` | Ver productos, crear órdenes, ver sus propias órdenes |
| `cook` | Ver órdenes de cocina, actualizar estados de preparación |
| `driver` | Ver entregas, actualizar ubicación y estado de entrega |
| `admin` | Acceso completo, dashboard, reportes, gestión de usuarios |

---

## 🐛 Debugging y Troubleshooting

### Logs de Lambda
```bash
# Ver logs de una función específica
aws logs tail /aws/lambda/fridays-ecommerce-service-dev-getProducts --follow

# Ver logs de un grupo específico
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/fridays"
```

### Problemas Comunes

1. **401 Unauthorized**
   - Verificar que el token esté en el header correcto
   - Verificar que el token no haya expirado

2. **CORS Errors**
   - El backend ya tiene CORS configurado para desarrollo
   - En producción, contactar al equipo backend

3. **WebSocket no conecta**
   - Verificar que el token sea válido
   - Usar `wss://` (no `ws://`)

4. **Timeout Errors**
   - El timeout de Lambda es de 30 segundos
   - El timeout de API Gateway es de 29 segundos

---

## 📞 Soporte y Contacto

### Documentación
- Ver documentos en `backend/` para detalles específicos
- Revisar colecciones Postman para ejemplos

### Testing
- Usar Postman para probar endpoints individuales
- Usar `curl` para pruebas rápidas desde terminal

### Issues
- Reportar bugs con logs completos
- Incluir request/response cuando sea posible
- Especificar navegador y versión

---

## ✅ Checklist de Integración

### Frontend Developer Checklist

- [ ] Leer **FRONTEND-QUICKSTART.md**
- [ ] Configurar variables de entorno
- [ ] Importar colecciones Postman
- [ ] Probar login con Postman
- [ ] Implementar configuración de Axios
- [ ] Copiar tipos TypeScript
- [ ] Implementar servicios de API
- [ ] Probar flujo completo:
  - [ ] Login
  - [ ] Listar productos
  - [ ] Agregar al carrito
  - [ ] Crear orden
  - [ ] Ver estado de orden
- [ ] Implementar WebSocket (opcional para MVP)
- [ ] Probar manejo de errores
- [ ] Probar con token expirado
- [ ] Testing en diferentes navegadores

---

## 📅 Información de Versión

- **Fecha de Deployment**: 2 de Diciembre, 2025
- **Versión**: 1.0
- **Última actualización de docs**: 2 de Diciembre, 2025
- **Serverless Framework**: v3.40.0
- **Node.js**: v20.x
- **Estado**: ✅ Todos los servicios operacionales

---

## ⚠️ Notas Importantes

1. **AWS Academy Lab**: Las credenciales expiran cada 3-4 horas
2. **Endpoints estables**: Mientras el lab esté activo, los endpoints permanecen estables
3. **Base de datos**: DynamoDB se crea automáticamente con el deployment
4. **Testing**: Todos los servicios han sido testeados y están funcionales
5. **Monitoreo**: CloudWatch logs están disponibles para todas las funciones

---

**Última actualización**: 2 de Diciembre, 2025  
**Mantenido por**: Equipo Backend Fridays Perú  
**Estado del sistema**: ✅ Operacional
