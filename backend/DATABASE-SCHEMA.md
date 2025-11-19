# 🗄️ Definición de Tablas DynamoDB

## 📋 Tablas del Sistema

### 1. **Users Table**

**Nombre:** `Users-{stage}`

**Esquema:**

```json
{
  "userId": "UUID",                        // PK (Partition Key)
  "tenantId": "TENANT#001",                // GSI: Buscar usuarios por sede
  "role": "CLIENTE",                       // CLIENTE | DIGITADOR | CHEF_EJECUTIVO | COCINERO | EMPACADOR | REPARTIDOR | ADMIN_SEDE
  "firstName": "Leonardo",
  "lastName": "Sanchez",
  "email": "leonardo@gmail.com",           // GSI: Login por email
  "passwordHash": "$2b$10$...",            // Hash bcrypt
  "phoneNumber": "+51912345678",
  "status": "ACTIVE",                      // ACTIVE | INACTIVE | BANNED
  "locationLat": -12.046374,               // Opcional: ubicación cliente
  "locationLng": -77.042793,
  "createdAt": "2025-11-17T15:32:00Z",
  "updatedAt": "2025-11-17T15:32:00Z"
}
```

**Índices:**
- **PK:** `userId`
- **GSI1:** `tenantId` (buscar usuarios de una sede)
- **GSI2:** `email` (login)

---

### 2. **Tenants Table (Sedes)**

**Nombre:** `Tenants-{stage}`

**Esquema:**

```json
{
  "tenantId": "TENANT#001",                // PK
  "name": "Sede San Isidro",
  "code": "SAN-ISIDRO",                    // Para URLs amigables
  "address": "Av. X 123, San Isidro",
  "lat": -12.09483,
  "lng": -77.03302,
  "status": "ACTIVE",                      // ACTIVE | INACTIVE
  "phone": "+5112345678",
  "email": "sanisidro@fridays.pe",
  "createdAt": "2025-11-17T15:32:00Z",
  "updatedAt": "2025-11-17T15:32:00Z"
}
```

**Índices:**
- **PK:** `tenantId`
- **GSI1:** `code` (buscar por código)

---

### 3. **Products Table (Menú)**

**Nombre:** `Products-{stage}`

**Esquema:**

```json
{
  "productId": "PRODUCT#001",              // PK
  "tenantId": "TENANT#001",                // SK: Multi-tenant
  "name": "Hamburguesa Clásica",
  "description": "Hamburguesa con queso, lechuga y tomate",
  "category": "FOOD",                      // FOOD | DRINK | DESSERT | COMBO
  "price": 18.5,
  "currency": "PEN",
  "isAvailable": true,
  "preparationTimeMinutes": 15,
  "imageKey": "images/tenant-001/burger-001.jpg",
  "imageUrl": "https://bucket.s3.amazonaws.com/images/tenant-001/burger-001.jpg",
  "tags": ["burger", "carne", "combo1"],
  "nutritionalInfo": {
    "calories": 650,
    "protein": 30,
    "carbs": 45,
    "fat": 35
  },
  "createdAt": "2025-11-17T15:32:00Z",
  "updatedAt": "2025-11-17T15:32:00Z",
  "createdBy": "USER#ADMIN1",
  "updatedBy": "USER#ADMIN1"
}
```

**Índices:**
- **PK:** `productId`
- **SK:** `tenantId`
- **GSI1:** `tenantId` (listar productos por sede)
- **GSI2:** `category` (filtrar por categoría)

---

### 4. **Orders Table**

**Nombre:** `Orders-{stage}`

**Esquema:**

```json
{
  "orderId": "UUID",                       // PK
  "tenantId": "TENANT#001",                // GSI: Órdenes por sede
  "userId": "UUID-USER",                   // GSI: Órdenes por cliente
  "cookId": "UUID-COOK",                   // Cocinero asignado (nullable)
  "dispatcherId": "UUID-DISPATCHER",       // Despachador asignado (nullable)
  
  "status": "CREATED",                     // CREATED | COOKING | READY | DELIVERING | DELIVERED | CANCELLED
  
  "orderType": "DELIVERY",                 // DELIVERY | PICKUP | DINE_IN
  
  "customerInfo": {
    "name": "Leonardo Sanchez",
    "phone": "+51912345678",
    "address": "Av. Principal 123",
    "lat": -12.046374,
    "lng": -77.042793,
    "deliveryInstructions": "Tocar timbre 2 veces"
  },
  
  "items": [
    {
      "productId": "PRODUCT#001",
      "name": "Hamburguesa Clásica",        // Snapshot del nombre
      "quantity": 2,
      "unitPrice": 18.5,
      "subtotal": 37.0,
      "station": "PARRILLA",               // PARRILLA | FREIDORA | BEBIDAS | ENSALADAS
      "itemStatus": "PENDING"              // PENDING | COOKING | READY
    },
    {
      "productId": "PRODUCT#003",
      "name": "Coca Cola 500ml",
      "quantity": 1,
      "unitPrice": 5.0,
      "subtotal": 5.0,
      "station": "BEBIDAS",
      "itemStatus": "READY"
    }
  ],
  
  "subtotal": 42.0,
  "deliveryFee": 5.0,
  "tax": 7.56,                             // 18% IGV
  "total": 54.56,
  "currency": "PEN",
  
  "paymentMethod": "CARD",                 // CARD | CASH | YAPE | PLIN
  "paymentStatus": "PENDING",              // PENDING | PAID | FAILED
  
  "timeline": {
    "CREATED": "2025-11-17T15:32:00Z",
    "COOKING": "2025-11-17T15:35:00Z",
    "READY": "2025-11-17T15:40:00Z",
    "DELIVERING": "2025-11-17T15:45:00Z",
    "DELIVERED": null
  },
  
  "estimatedDeliveryTime": "2025-11-17T16:00:00Z",
  
  "createdAt": "2025-11-17T15:32:00Z",
  "updatedAt": "2025-11-17T15:40:00Z",
  "resolvedAt": null,                      // Cuando se completa o cancela
  
  "notes": "Sin cebolla en la hamburguesa",
  "rating": null,                          // 1-5 estrellas (después de entregar)
  "feedback": null
}
```

**Índices:**
- **PK:** `orderId`
- **GSI1:** `tenantId` + `status` (órdenes activas por sede)
- **GSI2:** `userId` (historial de cliente)
- **GSI3:** `cookId` (órdenes asignadas a cocinero)
- **GSI4:** `dispatcherId` (órdenes asignadas a repartidor)
- **GSI5:** `createdAt` (órdenes por fecha)

---

### 5. **WebSocketConnections Table**

**Nombre:** `WSConnections-{stage}`

**Esquema:**

```json
{
  "connectionId": "abc123==",              // PK (del API Gateway WebSocket)
  "userId": "USER#123",                    // GSI: Buscar conexión de un usuario
  "tenantId": "TENANT#001",                // Multi-tenant
  "role": "REPARTIDOR",                    // CLIENTE | DIGITADOR | CHEF_EJECUTIVO | COCINERO | EMPACADOR | REPARTIDOR | ADMIN_SEDE
  "orderId": "ORDER#456",                  // Opcional: si está viendo un pedido específico
  "connectedAt": "2025-11-17T15:32:00Z",
  "ttl": 1700235600                        // TTL para auto-eliminar conexiones viejas
}
```

**Índices:**
- **PK:** `connectionId`
- **GSI1:** `userId` (encontrar conexión activa de usuario)
- **GSI2:** `tenantId` + `role` (broadcast a roles específicos)
- **GSI3:** `orderId` (notificar sobre un pedido específico)

---

### 6. **Cart Table** (Opcional - para persistir carritos)

**Nombre:** `Carts-{stage}`

**Esquema:**

```json
{
  "cartId": "USER#123",                    // PK (mismo que userId)
  "tenantId": "TENANT#001",
  "items": [
    {
      "productId": "PRODUCT#001",
      "quantity": 2,
      "addedAt": "2025-11-17T15:30:00Z"
    }
  ],
  "createdAt": "2025-11-17T15:30:00Z",
  "updatedAt": "2025-11-17T15:32:00Z",
  "ttl": 1700235600                        // Auto-eliminar carritos viejos (24h)
}
```

**Índices:**
- **PK:** `cartId` (userId)

---

### 7. **Notifications Table** (Historial de notificaciones)

**Nombre:** `Notifications-{stage}`

**Esquema:**

```json
{
  "notificationId": "UUID",                // PK
  "userId": "USER#123",                    // GSI: Notificaciones de un usuario
  "tenantId": "TENANT#001",
  "orderId": "ORDER#456",                  // Relacionada a qué pedido
  "type": "ORDER_STATUS_CHANGED",          // ORDER_STATUS_CHANGED | ORDER_ASSIGNED | etc.
  "title": "Tu pedido está en camino",
  "message": "El repartidor está en camino. Llega en ~15 min",
  "data": {                                // Data adicional para deep linking
    "orderId": "ORDER#456",
    "status": "DELIVERING"
  },
  "read": false,
  "createdAt": "2025-11-17T15:45:00Z",
  "ttl": 1702827600                        // Auto-eliminar después de 30 días
}
```

**Índices:**
- **PK:** `notificationId`
- **GSI1:** `userId` + `createdAt` (historial de notificaciones)

---

## 🔧 Scripts de Creación de Tablas

### Para DynamoDB Local:

```bash
# Ejecutar
node scripts/create-tables-local.js
```

### Para AWS Real:

Las tablas se crean automáticamente con Serverless Framework:

```yaml
# En cada serverless.yml
resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: Users-${self:provider.stage}
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
          - AttributeName: email
            AttributeType: S
          - AttributeName: tenantId
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
        GlobalSecondaryIndexes:
          - IndexName: EmailIndex
            KeySchema:
              - AttributeName: email
                KeyType: HASH
            Projection:
              ProjectionType: ALL
          - IndexName: TenantIndex
            KeySchema:
              - AttributeName: tenantId
                KeyType: HASH
            Projection:
              ProjectionType: ALL
```

---

## 📊 Estimación de Costos (AWS)

| Tabla | Lectura/mes | Escritura/mes | Almacenamiento | Costo estimado |
|-------|------------|---------------|----------------|----------------|
| Users | 10,000 | 1,000 | 1 GB | $0.50 |
| Tenants | 1,000 | 100 | 0.1 GB | $0.05 |
| Products | 50,000 | 500 | 2 GB | $1.00 |
| Orders | 100,000 | 10,000 | 10 GB | $5.00 |
| WSConnections | 20,000 | 5,000 | 0.5 GB | $1.00 |
| **TOTAL** | | | | **~$7.55/mes** |

**Nota:** Con Free Tier de AWS, los primeros 25 GB de almacenamiento y 25 RCU/WCU son gratis.

---

## 🔐 Políticas de Acceso IAM

### Para Lambda Functions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/Users-*",
        "arn:aws:dynamodb:us-east-1:*:table/Orders-*",
        "arn:aws:dynamodb:us-east-1:*:table/Products-*",
        "arn:aws:dynamodb:us-east-1:*:table/Tenants-*",
        "arn:aws:dynamodb:us-east-1:*:table/WSConnections-*",
        "arn:aws:dynamodb:us-east-1:*:table/*/index/*"
      ]
    }
  ]
}
```
