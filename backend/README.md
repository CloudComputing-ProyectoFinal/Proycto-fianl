# 🍔 Fridays Perú - Backend Serverless

> **Sistema de Gestión de Pedidos** | AWS Lambda + DynamoDB + API Gateway  
> **Equipo:** Leonardo, Luis, Nayeli | **Noviembre 2024**

---

## 🚨 CONVENCIONES OBLIGATORIAS

**TODOS deben usar EXACTAMENTE estos valores:**

```yaml
Stage:       dev
Profile:     fridays-dev
Region:      us-east-1
JWT Secret:  fridays-secret-key-2025-proyectofinal
API Prefix:  /api
Tablas:      {NombreTabla}-dev
```

**Nombres de tablas:**
- `Users-dev`, `Tenants-dev`, `Products-dev`, `Orders-dev`
- `WSConnections-dev`, `Carts-dev`, `Notifications-dev`

---

## 📁 Estructura del Proyecto

```
backend/
├── services/
│   ├── ecommerce-service/      # Leonardo (Persona 1)
│   ├── kitchen-service/        # Luis (Persona 2)
│   ├── delivery-service/       # Nayeli (Persona 3)
│   ├── admin-service/          # Nayeli (Persona 3)
│   └── websocket-service/      # Compartido
├── shared/
│   ├── auth/                   # JWT + Authorizer
│   ├── middlewares/            # Mock auth, validaciones
│   ├── constants/              # Roles, estados, etc.
│   └── utils/
├── scripts/
│   ├── create-tables-local.js
│   ├── seed-data-local.js
│   └── update-credentials.sh
└── docs/
    ├── DATABASE-SCHEMA.md      # Esquemas de BD
    └── AWS-SETUP.md            # Config AWS Academy
```

---

## 🚀 Quick Start

### 1. Instalación Inicial

```bash
# Clonar repositorio
git clone <repo-url>
cd backend

# Instalar dependencias
npm install
npm run install:all
```

### 2. Configurar AWS Academy

```bash
# 1. Iniciar AWS Learner Lab (círculo verde 🟢)
# 2. AWS Details → Show → Copiar credenciales

# 3. AWS Academy te da las credenciales como [default]
# 4. Crear/editar ~/.aws/credentials
nano ~/.aws/credentials

# 5. IMPORTANTE: Cambiar [default] por [fridays-dev] al pegar:
[fridays-dev]                    # ← Cambiar esto (viene como [default])
aws_access_key_id=ASIAXXX...
aws_secret_access_key=abc123...
aws_session_token=IQoJb3JpZ2luX2VjE...

# 6. Verificar
aws sts get-caller-identity --profile fridays-dev
```

**💡 ¿Por qué `[fridays-dev]` y no `[default]`?**
- Para separar este proyecto de tus otras cuentas AWS
- Si usas `[default]`, también funciona pero debes cambiar los comandos

**⚠️ Las credenciales expiran cada 4 horas.** Usa `scripts/update-credentials.sh` para renovar.

### 3. DynamoDB Local

```bash
# Terminal 1: Iniciar Docker
npm run local:dynamodb

# Terminal 2: Crear tablas y datos
npm run setup:dynamodb
```

### 4. Desarrollo Local

```bash
# Leonardo (Persona 1)
npm run dev:ecommerce    # http://localhost:3001

# Luis (Persona 2)
npm run dev:kitchen      # http://localhost:3002

# Nayeli (Persona 3)
npm run dev:delivery     # http://localhost:3003
npm run dev:admin        # http://localhost:3004
```

---

## 👥 División de Responsabilidades

| Persona | Servicios | Endpoints | Tablas |
|---------|-----------|-----------|--------|
| **Leonardo (P1)** | ecommerce | `/api/menu`, `/api/cart`, `/api/orders` | Products, Orders, Carts |
| **Luis (P2)** | kitchen | `/api/kitchen/*`, `/api/auth/login` | Orders, Products |
| **Nayeli (P3)** | delivery, admin | `/api/delivery/*`, `/api/admin/*` | Orders, Users, Tenants |

---

## 🔐 Autenticación

### Desarrollo Local (Mock Auth)
```javascript
const { mockAuth } = require('../../../shared/middlewares/mock-auth');

module.exports.handler = mockAuth(async (event) => {
  const user = event.requestContext.authorizer;
  // user.userId, user.role, user.tenantId disponibles
  
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
          authorizer:
            name: authorizer
```

---

## 👤 Roles de Usuario

```javascript
const { USER_ROLES } = require('../../shared/constants/user-roles');

// Roles disponibles:
USER_ROLES.CLIENTE         // Cliente final
USER_ROLES.DIGITADOR       // Digitador de pedidos
USER_ROLES.CHEF_EJECUTIVO  // Chef Ejecutivo
USER_ROLES.COCINERO        // Cocinero
USER_ROLES.EMPACADOR       // Empacador
USER_ROLES.REPARTIDOR      // Repartidor
USER_ROLES.ADMIN_SEDE      // Admin de Sede
```

**Usuarios de prueba (seed data):**
- `leonardo@gmail.com` → CLIENTE
- `ana.digitador@fridays.pe` → DIGITADOR
- `carlos.chef@fridays.pe` → CHEF_EJECUTIVO
- `luis.cocinero@fridays.pe` → COCINERO
- `jose.empacador@fridays.pe` → EMPACADOR
- `maria.repartidor@fridays.pe` → REPARTIDOR
- `admin@fridays.pe` → ADMIN_SEDE

**Password:** `password123` (en desarrollo)

---

## 📦 Estados de Órdenes

```javascript
const { ORDER_STATUS } = require('../../shared/constants/order-status');

// Flujo:
CREATED → COOKING → READY → DELIVERING → DELIVERED
   ↓         ↓        ↓          ↓
CANCELLED (en cualquier momento)
```

---

## 🛠️ Scripts Disponibles

```bash
# Instalación
npm run install:all

# DynamoDB Local
npm run local:dynamodb       # Iniciar Docker (puerto 8000)
npm run setup:dynamodb       # Crear tablas y seed data
npm run local:dynamodb:stop  # Detener Docker

# Desarrollo Local
npm run dev:ecommerce
npm run dev:kitchen
npm run dev:delivery
npm run dev:admin

# Deploy a AWS
npm run deploy:ecommerce
npm run deploy:kitchen
npm run deploy:delivery
npm run deploy:admin
npm run deploy:all

# Logs AWS
npm run logs:delivery
npm run logs:admin

# Limpiar recursos AWS
npm run remove:delivery
npm run remove:admin
```

---

## 📡 API Endpoints

### E-commerce Service (Puerto 3001)
```
GET    /api/menu
GET    /api/menu/{category}
POST   /api/cart/add
GET    /api/cart
POST   /api/orders
GET    /api/orders/{orderId}
```

### Kitchen Service (Puerto 3002)
```
POST   /api/kitchen/orders/{orderId}/assign
GET    /api/kitchen/orders/pending
POST   /api/kitchen/orders/{orderId}/ready
POST   /api/menu/items
PUT    /api/menu/items/{itemId}/availability
```

### Delivery Service (Puerto 3003)
```
POST   /api/delivery/orders/{orderId}/assign
PUT    /api/delivery/orders/{orderId}/status
GET    /api/delivery/drivers/available
POST   /api/delivery/drivers
```

### Admin Service (Puerto 3004)
```
GET    /api/admin/dashboard
GET    /api/admin/orders/today
GET    /api/admin/sedes
POST   /api/admin/users
PUT    /api/admin/users/{userId}
```

---

## 🔄 Flujo de Trabajo

### 1. Desarrollo Local (90% del tiempo)
- DynamoDB en Docker
- Serverless offline
- Mock auth (sin JWT real)
- **$0 costo**

### 2. Testing AWS (10% del tiempo)
- Deploy en tu cuenta AWS Academy individual
- JWT real
- Credenciales renovadas cada 4h

### 3. Integración (Viernes 8pm)
- Deploy en cuenta compartida
- Pruebas entre servicios
- Code review
- Demo

---

## 📝 Formato de Respuestas API

**Todas las respuestas deben seguir este formato:**

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
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    success: false,
    error: "Mensaje descriptivo del error"
  })
}
```

---

## 🗄️ Base de Datos

Ver [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) para detalles completos.

**Tablas principales:**
- **Users-dev**: Usuarios (clientes y staff)
- **Tenants-dev**: Sedes/Restaurantes
- **Products-dev**: Menú de productos
- **Orders-dev**: Pedidos con historial
- **WSConnections-dev**: Conexiones WebSocket
- **Carts-dev**: Carritos de compra
- **Notifications-dev**: Historial de notificaciones

---

## ⚙️ Configuración de Servicios

### serverless.yml Estándar

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
          authorizer:
            name: authorizer

resources:
  Resources:
    # Tablas DynamoDB si es necesario
```

---

## 🚨 Errores Comunes

### ❌ Credenciales expiradas
```bash
# Solución:
bash scripts/update-credentials.sh
```

### ❌ DynamoDB no responde
```bash
# Solución:
docker ps  # Verificar que corre
npm run local:dynamodb:stop
npm run local:dynamodb
npm run setup:dynamodb
```

### ❌ Puerto en uso
```bash
# Matar proceso en puerto 3003
lsof -ti:3003 | xargs kill -9
```

### ❌ "Cannot find module"
```bash
# Reinstalar dependencias
cd services/delivery-service
rm -rf node_modules
npm install
```

---

## ✅ Checklist Pre-Push

Antes de hacer push a GitHub:

- [ ] Stage es `dev` (no `dev-nayeli`)
- [ ] Profile es `fridays-dev`
- [ ] Tablas: `{Nombre}-${self:provider.stage}`
- [ ] Paths usan `/api` como prefijo
- [ ] JWT secret es el compartido
- [ ] Respuestas siguen formato estándar
- [ ] Roles usan constantes de `user-roles.js`
- [ ] Código probado localmente

---

## 📚 Documentación Adicional

- **[DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md)** - Esquemas detallados de DynamoDB
- **[AWS-SETUP.md](./AWS-ACADEMY-SETUP.md)** - Guía paso a paso AWS Academy

---

## 🔧 Herramientas Necesarias

- Node.js 18.x o superior
- npm
- AWS CLI
- Serverless Framework
- Docker (para DynamoDB local)
- Git

---

## 💡 Tips

- **Desarrolla 90% en local**, 10% en AWS
- **Renueva credenciales** cada 4 horas con `update-credentials.sh`
- **Usa mock auth** en local (no necesitas JWT real)
- **Mismo JWT secret** para todos (integración)
- **Reunión semanal** Viernes 8pm para sincronización

---

## 📞 Equipo

| Nombre | Servicios | GitHub | Rol |
|--------|-----------|--------|-----|
| Leonardo | E-commerce | @leonardo | Persona 1 |
| Luis | Kitchen + Auth | @luis | Persona 2 |
| Nayeli | Delivery + Admin | @nayeli | Persona 3 |

**Reunión:** Viernes 8pm para integración

---

## 🎯 Regla de Oro

> **Si TODOS usan las MISMAS convenciones, la integración será fácil.**  
> **Si cada uno usa valores diferentes, será un desastre.**

---

**Stack:** AWS Lambda, API Gateway, DynamoDB, Node.js 18.x, Serverless Framework  
**Última actualización:** 19 Nov 2024  
**Versión:** 2.0.0
