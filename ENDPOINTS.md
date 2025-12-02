# 🚀 FRIDAYS PERÚ - ENDPOINTS DEPLOYADOS

## ✅ Estado del Deployment
**Fecha**: 2 de Diciembre, 2025  
**Región**: us-east-1 (Virginia)  
**Cuenta AWS**: 439535099835  
**Stage**: dev

---

## 📡 API REST Endpoints

### 🛒 **E-Commerce Service**
```
https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev
```
- **Funciones**: Gestión de productos, carrito, checkout, órdenes
- **Stack**: `fridays-ecommerce-service-dev`

### 👨‍🍳 **Kitchen Service**
```
https://6nry2wpzl1.execute-api.us-east-1.amazonaws.com/dev
```
- **Funciones**: Gestión de cocina, preparación de órdenes
- **Stack**: `fridays-kitchen-service-dev`

### 🚚 **Delivery Service**
```
https://8ghxkz67bd.execute-api.us-east-1.amazonaws.com/dev
```
- **Funciones**: Asignación de repartidores, tracking de entregas
- **Stack**: `fridays-delivery-service-dev`

### 👤 **Admin Service**
```
https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev
```
- **Funciones**: Dashboard administrativo, reportes, gestión de usuarios
- **Stack**: `fridays-admin-service-dev`

---

## 🔌 WebSocket API

### **WebSocket Service**
```
wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev
```
- **Funciones**: Notificaciones en tiempo real, actualizaciones de órdenes
- **Stack**: `fridays-websocket-service-dev`

---

## ⚙️ Step Functions

### **Order Workflow State Machine**
```
arn:aws:states:us-east-1:439535099835:stateMachine:FridaysOrderWorkflow-dev
```
- **Funciones**: Orquestación del flujo de órdenes
- **Stack**: `fridays-stepfunctions-service-dev`

**Lambda Functions asociadas:**
- `prepareOrderData`: Preparar datos de la orden
- `persistBuildOrder`: Persistir orden en DynamoDB
- `publishOrderCreated`: Publicar evento de orden creada

---

## 📬 Workers Service (Mensajería)

### **SQS Queue (FIFO)**
```
URL: https://sqs.us-east-1.amazonaws.com/439535099835/fridays-order-queue-dev.fifo
ARN: arn:aws:sqs:us-east-1:439535099835:fridays-order-queue-dev.fifo
```
- **Función**: Cola de procesamiento de órdenes (orden garantizado)

### **SNS Topic**
```
ARN: arn:aws:sns:us-east-1:439535099835:fridays-notifications-dev
```
- **Función**: Sistema de notificaciones pub/sub

### **Lambda Worker**
```
processOrderWorker: arn:aws:lambda:us-east-1:439535099835:function:fridays-workers-service-dev-processOrderWorker:1
```
- **Stack**: `fridays-workers-service-dev`

---

## 🔐 Parameter Store

Los siguientes parámetros están configurados en AWS Systems Manager Parameter Store:

- `/fridays/jwt-secret`: Secret para JWT tokens
- `/fridays/sendgrid-api-key`: API Key de SendGrid para emails
- `/fridays/sendgrid-from-email`: Email de origen (noreply@fridays.pe)

---

## 📊 Resumen de Recursos Deployados

| Servicio | Stack Status | API Gateway | Lambdas | Último Update |
|----------|-------------|-------------|---------|---------------|
| ✅ E-Commerce | UPDATE_COMPLETE | lwihntphpl | ~15 | 21:49 UTC |
| ✅ Kitchen | UPDATE_COMPLETE | 6nry2wpzl1 | ~8 | 21:51 UTC |
| ✅ Delivery | UPDATE_COMPLETE | 8ghxkz67bd | ~6 | 21:52 UTC |
| ✅ Admin | UPDATE_COMPLETE | kdf5akbdk9 | ~10 | 21:54 UTC |
| ✅ WebSocket | UPDATE_COMPLETE | meb0i6igh8 | ~3 | 21:56 UTC |
| ✅ StepFunctions | UPDATE_COMPLETE | N/A | 3 | 21:38 UTC |
| ✅ Workers | UPDATE_COMPLETE | N/A | 1 | 21:40 UTC |

**Total**: 7 servicios, ~46 Lambda Functions, 5 API Gateways, 1 Step Function, 1 SQS Queue, 1 SNS Topic

---

## 🧪 Testing

Para testear los endpoints, puedes usar las colecciones de Postman que están en:
```
backend/postman/
```

O usar curl:
```bash
# Health check de ecommerce service
curl https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev/health

# Listar productos
curl https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev/products
```

---

## 📝 Próximos Pasos

1. ✅ Crear tablas DynamoDB (ejecutar `scripts/create-tables-aws.js`)
2. ✅ Sembrar datos iniciales (ejecutar `scripts/seed-data-aws.js`)
3. ✅ Crear usuario administrador inicial
4. ✅ Configurar frontend con estos endpoints
5. ✅ Testear flujo completo de órdenes

---

## ⚠️ Importante

- **Las credenciales de AWS Academy expiran cada 3-4 horas**
- Para re-deployar, usa: `npx serverless@3 deploy --stage dev`
- Los endpoints permanecen estables mientras el lab esté activo
- Guarda este archivo para referencia futura

---

**Deployment realizado con éxito** ✨
