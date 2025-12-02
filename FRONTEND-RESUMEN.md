# 🎨 FRIDAYS PERÚ - RESUMEN DEL FRONTEND

## 📋 Índice
- [Descripción General](#descripción-general)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías y Dependencias](#tecnologías-y-dependencias)
- [Componentes Principales](#componentes-principales)
- [Páginas y Rutas](#páginas-y-rutas)
- [Gestión de Estado](#gestión-de-estado)
- [Servicios y APIs](#servicios-y-apis)
- [Cómo Correr Localmente](#cómo-correr-localmente)

---

## 📖 Descripción General

El proyecto tiene **DOS aplicaciones frontend separadas** construidas con **React + TypeScript + Vite**:

### 1. **Frontend Customer** (`frontend-customer/`)
- 🛒 **E-commerce** para clientes finales
- Catálogo de productos, carrito de compras, checkout
- Tracking de pedidos en tiempo real
- Dashboard para clientes

### 2. **Frontend Admin** (`frontend-admin/`)
- 👨‍💼 **Panel administrativo** para el personal del restaurante
- Dashboards especializados por rol (Chef, Cocina, Delivery, Admin)
- Gestión de productos, usuarios, pedidos y reportes
- Herramientas operativas

---

## 🏗️ Estructura del Proyecto

### Frontend Customer
```
frontend-customer/
├── public/              # Assets estáticos (logos, imágenes)
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── WebSocketNotifications.tsx
│   │   ├── WebSocketToast.tsx
│   │   ├── admin/       # Componentes de dashboards
│   │   ├── forms/       # Formularios
│   │   ├── sections/    # Secciones de páginas
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── DeliveryDashboard.tsx
│   │   │   ├── KitchenDashboard.tsx
│   │   │   └── UserDashboard.tsx
│   │   └── ui/          # Componentes UI base
│   ├── contexts/        # Context API
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── context.tsx
│   ├── hooks/           # Custom hooks
│   ├── interfaces/      # TypeScript interfaces
│   ├── pages/           # Páginas principales
│   │   ├── HomePage.tsx
│   │   ├── MenuPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrderTrackingPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── AuthPage.tsx
│   │   └── AdminPanelPage.tsx
│   ├── router/          # Configuración de rutas
│   │   ├── routes.tsx
│   │   └── ProtectedRoute.tsx
│   ├── services/        # Servicios API
│   │   ├── auth.ts
│   │   ├── food.ts
│   │   └── admin.ts
│   ├── store/           # Estado global (Zustand)
│   ├── styles/          # Estilos globales
│   ├── utils/           # Utilidades
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

### Frontend Admin
```
frontend-admin/
├── public/              # Assets estáticos
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── WebSocketNotifications.tsx
│   │   ├── WebSocketToast.tsx
│   │   ├── admin/       # Componentes administrativos
│   │   │   ├── AdminStats.tsx
│   │   │   ├── AdminOrders.tsx
│   │   │   ├── AdminProducts.tsx
│   │   │   ├── AdminUsers.tsx
│   │   │   └── AdminDrivers.tsx
│   │   ├── forms/
│   │   ├── sections/
│   │   └── ui/
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── AdminPanelPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── AuthPage.tsx
│   ├── router/
│   ├── services/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🛠️ Tecnologías y Dependencias

### Stack Principal
- **React 18.3.1** - Framework UI
- **TypeScript 5.5.3** - Tipado estático
- **Vite 7.2.2** - Build tool & dev server
- **React Router DOM 7.9.6** - Enrutamiento
- **Tailwind CSS 3.4.1** - Estilos utility-first

### Gestión de Estado
- **Zustand 5.0.8** - State management (store global)
- **React Context API** - State local (Auth, Cart)

### UI & Componentes
- **Lucide React 0.344.0** - Íconos
- **clsx 2.1.1** - Manejo de clases CSS
- **tailwind-merge 3.4.0** - Merge de clases Tailwind

### Comunicación
- **WebSocket API** - Notificaciones en tiempo real
- **Fetch API** - Llamadas REST a AWS Lambda

---

## 🧩 Componentes Principales

### Compartidos entre ambos frontends

#### **Navbar.tsx**
- Navegación principal
- Menú de usuario
- Carrito de compras (customer)
- Enlaces contextuales por rol

#### **WebSocketNotifications.tsx**
- Conexión WebSocket con AWS API Gateway
- Recepción de notificaciones en tiempo real
- Gestión de eventos de pedidos

#### **WebSocketToast.tsx**
- Toast notifications
- Alertas de actualización de pedidos
- Notificaciones push

### Específicos de Customer

#### **Sections**
- `UserDashboard.tsx` - Dashboard del cliente
- `KitchenDashboard.tsx` - Vista de cocina
- `DeliveryDashboard.tsx` - Vista de delivery
- `AdminDashboard.tsx` - Vista administrativa

#### **Forms**
- Formularios de checkout
- Formularios de registro/login
- Formularios de edición

### Específicos de Admin

#### **Admin Components**
- `AdminStats.tsx` - Estadísticas y métricas
- `AdminOrders.tsx` - Gestión de pedidos
- `AdminProducts.tsx` - CRUD de productos
- `AdminUsers.tsx` - Gestión de usuarios
- `AdminDrivers.tsx` - Gestión de repartidores

---

## 🗺️ Páginas y Rutas

### Frontend Customer

| Ruta | Página | Descripción | Protegida |
|------|--------|-------------|-----------|
| `/` | `HomePage` | Landing page | ❌ |
| `/menu` | `MenuPage` | Catálogo de productos | ❌ |
| `/cart` | `CartPage` | Carrito de compras | ✅ |
| `/checkout` | `CheckoutPage` | Proceso de pago | ✅ |
| `/orders/:id` | `OrderTrackingPage` | Seguimiento de pedido | ✅ |
| `/dashboard` | `DashboardPage` | Dashboard por rol | ✅ |
| `/admin` | `AdminPanelPage` | Panel admin | ✅ (admin) |
| `/auth/login` | `LoginPage` | Inicio de sesión | ❌ |
| `/auth/register` | `RegisterPage` | Registro | ❌ |

### Frontend Admin

| Ruta | Página | Descripción | Protegida |
|------|--------|-------------|-----------|
| `/` | `DashboardPage` | Dashboard principal | ✅ |
| `/admin` | `AdminPanelPage` | Panel administrativo | ✅ (admin) |
| `/auth/login` | `LoginPage` | Inicio de sesión | ❌ |

### Protección de Rutas

Ambos frontends usan `ProtectedRoute.tsx` para:
- Verificar autenticación (JWT token)
- Validar roles de usuario
- Redireccionar si no autorizado

---

## 🔄 Gestión de Estado

### Context API

#### **AuthContext.tsx**
```typescript
// Gestiona autenticación y perfil de usuario
{
  user: User | null,
  profile: UserProfile | null,
  isLoading: boolean,
  login: (email, password) => Promise<void>,
  logout: () => void,
  register: (userData) => Promise<void>
}
```

#### **CartContext.tsx** (Solo Customer)
```typescript
// Gestiona carrito de compras
{
  items: CartItem[],
  addItem: (product, quantity) => void,
  removeItem: (productId) => void,
  updateQuantity: (productId, quantity) => void,
  clearCart: () => void,
  total: number
}
```

### Zustand Store

Usado para estado global más complejo:
- Productos del menú
- Pedidos activos
- Notificaciones
- Configuración de UI

---

## 📡 Servicios y APIs

### Estructura de Servicios

```typescript
// services/auth.ts
export const authService = {
  login: (email, password) => Promise<TokenResponse>,
  register: (userData) => Promise<User>,
  refreshToken: () => Promise<TokenResponse>,
  logout: () => void
}

// services/food.ts
export const foodService = {
  getProducts: () => Promise<Product[]>,
  getProductById: (id) => Promise<Product>,
  getCategories: () => Promise<Category[]>
}

// services/admin.ts
export const adminService = {
  getOrders: () => Promise<Order[]>,
  updateOrderStatus: (id, status) => Promise<void>,
  getUsers: () => Promise<User[]>,
  getStats: () => Promise<Stats>
}
```

### Endpoints Base

Los servicios se conectan a los endpoints AWS desplegados:

```typescript
const API_BASE_URL = 'https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev';
const WS_URL = 'wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev';
```

Ver: `backend/ENDPOINTS.md` para todos los endpoints disponibles

---

## 🚀 Cómo Correr Localmente

### Pre-requisitos
```bash
# Node.js 18+ y npm/yarn
node --version  # v18+
npm --version   # 9+
```

### Frontend Customer

#### 1. Instalar dependencias
```bash
cd frontend-customer
npm install
```

#### 2. Configurar variables de entorno ⚠️ **IMPORTANTE**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Editar `.env` con los endpoints correctos (ya están configurados en el archivo):
```env
# E-Commerce Service
VITE_API_URL_AUTH=https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev
VITE_API_URL_COMIDA=https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev
VITE_API_BASE_URL=https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev

# Admin Service
VITE_API_URL_ADMIN=https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev
VITE_API_URL_USERS=https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev
VITE_API_URL_STATS=https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev

# WebSocket
VITE_API_URL_WS=wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev

# Kitchen & Delivery
VITE_API_URL_KITCHEN=https://6nry2wpzl1.execute-api.us-east-1.amazonaws.com/dev
VITE_API_URL_DELIVERY=https://8ghxkz67bd.execute-api.us-east-1.amazonaws.com/dev
```

> **⚠️ NOTA CRÍTICA**: Sin el archivo `.env` configurado, el frontend aparecerá **completamente en blanco** sin errores visibles en la consola. Esto es porque las variables de entorno son requeridas por el `AuthContext` y otros servicios.

#### 3. Ejecutar en modo desarrollo
```bash
npm run dev
```

La app estará disponible en: **http://localhost:5173**

#### 4. Otros comandos útiles
```bash
# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Type checking
npm run typecheck
```

### Frontend Admin

#### 1. Instalar dependencias
```bash
cd frontend-admin
npm install
```

#### 2. Configurar variables de entorno ⚠️ **IMPORTANTE**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Los archivos `.env` ya están configurados con los endpoints correctos. Si necesitas modificarlos, edita el archivo `.env` directamente.

> **⚠️ NOTA CRÍTICA**: Sin el archivo `.env` configurado, el frontend aparecerá **completamente en blanco** sin errores visibles en la consola.

#### 3. Ejecutar en modo desarrollo
```bash
npm run dev
```

La app estará disponible en: **http://localhost:5174** (puerto diferente)

### Ejecutar ambos frontends simultáneamente

```bash
# Desde la raíz del proyecto
# Terminal 1
cd frontend-customer && npm run dev

# Terminal 2 (nueva terminal)
cd frontend-admin && npm run dev
```

O puedes usar un script de npm en la raíz:

```bash
# Desde la raíz
npm install # instala ambos
npm run dev # ejecuta ambos frontends
```

---

## 🔧 Configuración Adicional

### Vite Config
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### Tailwind Config
- Configuración personalizada de colores
- Tema de Fridays (rojo, negro, blanco)
- Responsive breakpoints

### TypeScript Config
- Strict mode activado
- Path aliases configurados (`@/`)
- JSX: react-jsx

---

## 📱 Features Destacados

### WebSocket en Tiempo Real
- Conexión persistente con AWS API Gateway WebSocket
- Notificaciones push de cambios de estado de pedidos
- Reconexión automática

### Autenticación JWT
- Tokens almacenados en localStorage
- Refresh token automático
- Protected routes por rol

### Carrito Persistente
- LocalStorage para persistencia
- Sincronización entre tabs
- Cálculo automático de totales

### Responsive Design
- Mobile-first approach
- Optimizado para tablets y desktop
- Menú hamburguesa en móviles

---

## 🎨 Diseño y UX

### Paleta de Colores (Fridays)
- **Primario**: Rojo (#E31837)
- **Secundario**: Negro (#000000)
- **Acento**: Blanco (#FFFFFF)
- **Hover**: Rojo oscuro (#C41230)

### Tipografía
- Font principal: System fonts (optimizado)
- Tamaños responsive
- Line-height optimizado para legibilidad

---

## 📝 Notas Importantes

### Diferencias Customer vs Admin

| Característica | Customer | Admin |
|----------------|----------|-------|
| E-commerce | ✅ | ❌ |
| Carrito | ✅ | ❌ |
| Dashboards operativos | ✅ (limitado) | ✅ (completo) |
| Gestión CRUD | ❌ | ✅ |
| Reportes | ❌ | ✅ |

### Credenciales de Prueba

**Cliente:**
```
Email: cliente@test.com
Password: test1234
```

**Admin:**
```
Email: admin@fridays.pe
Password: admin1234
```

**Chef:**
```
Email: chef@fridays.pe
Password: chef1234
```

---

## 🐛 Troubleshooting

### Frontend aparece en blanco / Pantalla blanca
**Causa**: Falta el archivo `.env` con las variables de entorno.

**Solución**:
```bash
# En frontend-customer o frontend-admin
cp .env.example .env
# Reinicia el servidor de desarrollo (Ctrl+C y npm run dev)
```

Las variables de entorno son **OBLIGATORIAS** porque el código las requiere en el inicio de la aplicación.

### Puerto ya en uso
```bash
# Cambiar puerto en vite.config.ts
export default defineConfig({
  server: {
    port: 3000 // o el que prefieras
  }
})
```

### Errores de TypeScript
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### WebSocket no conecta
- Verificar que los endpoints en ENDPOINTS.md estén actuales
- Verificar credenciales AWS Academy
- Revisar CORS en API Gateway

---

## 📚 Recursos Adicionales

- **Documentación Backend**: `backend/README.md`
- **Endpoints API**: `backend/ENDPOINTS.md`
- **Arquitectura**: `backend/docs/ARCHITECTURE.md`
- **Postman Collection**: `backend/postman_collection.json`

---

**¡Listo para desarrollar!** 🚀

Para cualquier duda, revisa la documentación completa en la carpeta `backend/docs/`
