# 🍔 Fridays Perú - Backend Serverless

> **Sistema de Gestión de Pedidos** | AWS Lambda + DynamoDB + API Gateway  
> **Equipo:** Leonardo, Luis, Nayeli | **Noviembre 2024**

---

## 🚨 CONVENCIONES OBLIGATORIAS

**TODOS deben usar EXACTAMENTE estos valores:**

| Concepto | Valor |
|----------|-------|
| Stage | `dev` |
| Profile | `fridays-dev` |
| Region | `us-east-1` |
| JWT Secret | `fridays-secret-key-2025-proyectofinal` |
| API Prefix | `/api` |
| Tablas | `{NombreTabla}-dev` |

**Nombres de tablas:** `Users-dev`, `Tenants-dev`, `Products-dev`, `Orders-dev`, `WSConnections-dev`, `Carts-dev`, `Notifications-dev`

---

## 🚀 Quick Start

### 1. Instalación
```bash
git clone <repo-url>
cd backend
npm install
npm run install:all
```

### 2. Configurar AWS Academy
```bash
# Iniciar Learner Lab → AWS Details → Show
nano ~/.aws/credentials

# Pegar bajo [fridays-dev]:
[fridays-dev]
aws_access_key_id=ASIAXXX...
aws_secret_access_key=abc123...
aws_session_token=IQoJb3JpZ2luX2VjE...

# Verificar
aws sts get-caller-identity --profile fridays-dev
```

⚠️ **Credenciales expiran cada 4h** → Usa `scripts/update-credentials.sh`

### 3. DynamoDB Local
```bash
npm run local:dynamodb          # Terminal 1
npm run setup:dynamodb          # Terminal 2
```

### 4. Desarrollo Local
```bash
npm run dev:ecommerce    # http://localhost:3001 (Leonardo)
npm run dev:kitchen      # http://localhost:3002 (Luis)
npm run dev:delivery     # http://localhost:3003 (Nayeli)
npm run dev:admin        # http://localhost:3004 (Nayeli)
```

---

## 👥 División de Responsabilidades

| Persona | Servicios | Endpoints | Tablas |
|---------|-----------|-----------|--------|
| Leonardo (P1) | ecommerce | `/api/menu`, `/api/cart`, `/api/orders` | Products, Orders, Carts |
| Luis (P2) | kitchen | `/api/kitchen/*`, `/api/auth/login` | Orders, Products |
| Nayeli (P3) | delivery, admin | `/api/delivery/*`, `/api/admin/*` | Orders, Users, Tenants |

---

## 🔐 Autenticación

### Desarrollo Local (Mock)
```javascript
const { mockAuth } = require('../../../shared/middlewares/mock-auth');

module.exports.handler = mockAuth(async (event) => {
  const user = event.requestContext.authorizer;
  // user.userId, user.role, user.tenantId
  
  return {
    statusCode: 200,
    body: JSON.stringify({ data: { user } })
  };
});
```

### AWS (JWT Real)
```yaml
functions:
  authorizer:
    handler: ../../shared/auth/authorizer.handler
  
  listDrivers:
    handler: functions/drivers/listDrivers.handler
    events:
      - http:
          path: /api/delivery/drivers
          method: GET
          authorizer: authorizer
```

---

## 👤 Roles de Usuario

```javascript
const { USER_ROLES } = require('../../shared/constants/user-roles');

USER_ROLES.CLIENTE         // Cliente final
USER_ROLES.DIGITADOR       // Digitador de pedidos
USER_ROLES.CHEF_EJECUTIVO  // Chef Ejecutivo
USER_ROLES.COCINERO        // Cocinero
USER_ROLES.EMPACADOR       // Empacador
USER_ROLES.REPARTIDOR      // Repartidor
USER_ROLES.ADMIN_SEDE      // Admin de Sede
```

**Usuarios de prueba:** `leonardo@gmail.com`, `ana.digitador@fridays.pe`, `carlos.chef@fridays.pe`, `luis.cocinero@fridays.pe`, `jose.empacador@fridays.pe`, `maria.repartidor@fridays.pe`, `admin@fridays.pe` | Password: `password123`

---

## 📦 Estados de Órdenes

```
CREATED → COOKING → READY → DELIVERING → DELIVERED
   ↓         ↓        ↓          ↓
CANCELLED (cualquier momento)
```

---

## 🛠️ Scripts

```bash
npm run install:all              # Instalar todo
npm run local:dynamodb           # DynamoDB Docker
npm run setup:dynamodb           # Crear tablas + seed
npm run dev:{servicio}          # Desarrollo local
npm run deploy:{servicio}       # Deploy AWS
npm run logs:{servicio}         # Ver logs
npm run remove:{servicio}       # Limpiar AWS
```

---

## 📡 API Endpoints

### E-commerce (3001)
```
GET  /api/menu
POST /api/cart/add
POST /api/orders
GET  /api/orders/{orderId}
```

### Kitchen (3002)
```
POST /api/kitchen/orders/{orderId}/assign
GET  /api/kitchen/orders/pending
POST /api/kitchen/orders/{orderId}/ready
POST /api/menu/items
```

### Delivery (3003)
```
POST /api/delivery/orders/{orderId}/assign
PUT  /api/delivery/orders/{orderId}/status
GET  /api/delivery/drivers/available
POST /api/delivery/drivers
```

### Admin (3004)
```
GET  /api/admin/dashboard
GET  /api/admin/orders/today
GET  /api/admin/sedes
POST /api/admin/users
PUT  /api/admin/users/{userId}
```

---

## 🔄 Flujo de Trabajo

1. **Desarrollo Local (90%)** - DynamoDB Docker, mock auth, $0 costo
2. **Testing AWS (10%)** - Deploy individual, JWT real, renovar creds cada 4h
3. **Integración (Viernes 8pm)** - Deploy compartido, pruebas, demo

---

## 📝 Formato de Respuestas

### ✅ Success
```javascript
{
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    success: true,
    data: { /* tus datos */ }
  })
}
```

### ❌ Error
```javascript
{
  statusCode: 400, // 401, 403, 404, 500
  headers: { /* mismos */ },
  body: JSON.stringify({
    success: false,
    error: "Mensaje descriptivo"
  })
}
```

---

## 🗄️ Base de Datos

Ver **[DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md)** para esquemas completos.

**Tablas:** Users, Tenants, Products, Orders, WSConnections, Carts, Notifications (todas con sufijo `-dev`)

---

## ⚙️ serverless.yml Estándar

```yaml
service: fridays-delivery-service

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}
  profile: ${opt:profile, 'fridays-dev'}
  
  environment:
    STAGE: ${self:provider.stage}
    USERS_TABLE: Users-${self:provider.stage}
    ORDERS_TABLE: Orders-${self:provider.stage}
    JWT_SECRET: fridays-secret-key-2025-proyectofinal

functions:
  authorizer:
    handler: ../../shared/auth/authorizer.handler
  
  listDrivers:
    handler: functions/drivers/listDrivers.handler
    events:
      - http:
          path: /api/delivery/drivers
          method: GET
          cors: true
          authorizer: authorizer
```

---

## 🚨 Troubleshooting

### Credenciales expiradas
```bash
bash scripts/update-credentials.sh
```

### DynamoDB no responde
```bash
docker ps
npm run local:dynamodb:stop
npm run local:dynamodb
npm run setup:dynamodb
```

### Puerto en uso
```bash
lsof -ti:3003 | xargs kill -9
```

### Cannot find module
```bash
cd services/delivery-service
rm -rf node_modules
npm install
```

---

## ✅ Checklist Pre-Push

- [ ] Stage = `dev`
- [ ] Profile = `fridays-dev`
- [ ] Tablas = `{Nombre}-${self:provider.stage}`
- [ ] Paths con `/api`
- [ ] JWT secret compartido
- [ ] Formato respuestas estándar
- [ ] Roles de `user-roles.js`
- [ ] Probado localmente

---

## 📚 Documentación

- **[DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md)** - Esquemas DynamoDB
- **[AWS-SETUP.md](./AWS-SETUP.md)** - Config AWS Academy

---

## 💡 Tips

- Desarrolla 90% en local, 10% en AWS
- Renueva creds cada 4h con `update-credentials.sh`
- Usa mock auth en local
- Mismo JWT secret para todos
- Reunión Viernes 8pm

---

## 📞 Equipo

| Nombre | Servicios | Rol |
|--------|-----------|-----|
| Leonardo | E-commerce | Persona 1 |
| Luis | Kitchen + Auth | Persona 2 |
| Nayeli | Delivery + Admin | Persona 3 |

---

## 🎯 Regla de Oro

> **Si TODOS usan las MISMAS convenciones, la integración será fácil.**

---

**Stack:** AWS Lambda, API Gateway, DynamoDB, Node.js 18.x, Serverless Framework  
**v2.0.0** | 19 Nov 2024
