# 🍔 TGI Fridays - Sistema de Gestión de Pedidos

Sistema completo de e-commerce y gestión de pedidos para restaurante TGI Fridays Perú. Incluye plataforma web para clientes y dashboards especializados para operaciones de cocina, delivery y administración.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Roles de Usuario](#roles-de-usuario)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación y Configuración](#instalación-y-configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Base de Datos](#base-de-datos)
- [Flujo de Pedidos](#flujo-de-pedidos)
- [Funcionalidades Detalladas](#funcionalidades-detalladas)
- [Desarrollo](#desarrollo)

## 🎯 Descripción General

Sistema integral que conecta a clientes con el restaurante, permitiendo realizar pedidos en línea y gestionar todo el proceso desde la cocina hasta la entrega. Incluye autenticación de usuarios, carrito de compras, seguimiento de pedidos en tiempo real y dashboards especializados para cada rol operativo.

## ✨ Características Principales

### Para Clientes
- 🛒 **E-commerce Completo**: Navegación por categorías, catálogo de productos con imágenes
- 🛍️ **Carrito de Compras**: Gestión de items, cantidades y cálculo automático de totales
- 👤 **Autenticación**: Registro e inicio de sesión con Supabase Auth
- 📦 **Seguimiento de Pedidos**: Visualización en tiempo real del estado del pedido
- 📱 **Diseño Responsivo**: Experiencia optimizada para móviles y desktop

### Para Personal del Restaurante
- 👨‍🍳 **Dashboard de Chef**: Gestión y asignación de pedidos a cocineros
- 🔥 **Dashboard de Cocina**: Vista por estaciones (parrilla, freidora, bar)
- 📦 **Dashboard de Empaque**: Control de pedidos listos para entregar
- 🚚 **Dashboard de Delivery**: Gestión de entregas en ruta
- 👑 **Panel de Administración**: Gestión de menú, sedes, usuarios y reportes

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Cliente    │  │   Cocina     │  │    Admin     │     │
│  │   (E-comm)   │  │  (Kitchen)   │  │  (Gestión)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Supabase      │
                    │  ┌───────────┐  │
                    │  │PostgreSQL │  │
                    │  │    +      │  │
                    │  │    RLS    │  │
                    │  └───────────┘  │
                    │  ┌───────────┐  │
                    │  │   Auth    │  │
                    │  └───────────┘  │
                    │  ┌───────────┐  │
                    │  │ Realtime  │  │
                    │  └───────────┘  │
                    └─────────────────┘
```

## 👥 Roles de Usuario

### 1. **Cliente** (`cliente`)
- Navegar el menú
- Agregar items al carrito
- Realizar pedidos
- Rastrear estado de sus pedidos

### 2. **Digitador** (`digitador`)
- Recibir y confirmar pedidos telefónicos
- Gestionar pedidos de la sede

### 3. **Chef** (`cheff`)
- Visualizar pedidos confirmados
- Asignar items a cocineros por estación
- Supervisar progreso de cocina

### 4. **Cocinero** (`cocinero`)
- Ver items asignados por estación
- Actualizar estado de preparación
- Marcar items como listos

### 5. **Empacador** (`empacador`)
- Ver pedidos listos para empacar
- Preparar pedidos para delivery/pickup
- Marcar pedidos como listos para entrega

### 6. **Repartidor** (`repartidor`)
- Ver pedidos asignados
- Actualizar estado de entrega
- Confirmar entregas completadas

### 7. **Administrador** (`admin`)
- Gestión completa del sistema
- Administrar sedes
- Gestionar usuarios y permisos
- Gestionar catálogo de productos
- Ver reportes y estadísticas

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL con Row Level Security (RLS)
  - Authentication
  - Realtime subscriptions
  - Storage (para imágenes)

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **TypeScript Compiler** - Verificación de tipos

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd cloud_final_front/frontend
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crear archivo `.env` en la carpeta `frontend`:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Configurar Base de Datos
Ejecutar el script de migración en Supabase:
```bash
# Ir al SQL Editor en Supabase Dashboard
# Ejecutar: supabase/migrations/20251119013741_create_fridays_schema.sql
```

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 6. Construir para Producción
```bash
npm run build
npm run preview  # Para previsualizar el build
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Navbar.tsx      # Barra de navegación
│   │   ├── AdminDashboard.tsx     # Dashboard administrador
│   │   ├── KitchenDashboard.tsx   # Dashboard cocina
│   │   └── DeliveryDashboard.tsx  # Dashboard delivery
│   │
│   ├── pages/              # Páginas principales
│   │   ├── HomePage.tsx           # Landing page
│   │   ├── MenuPage.tsx           # Catálogo de productos
│   │   ├── CartPage.tsx           # Carrito de compras
│   │   ├── CheckoutPage.tsx       # Proceso de compra
│   │   ├── AuthPage.tsx           # Login/Registro
│   │   ├── OrderTrackingPage.tsx  # Seguimiento de pedidos
│   │   └── DashboardPage.tsx      # Dashboards por rol
│   │
│   ├── contexts/           # Contextos de React
│   │   └── AuthContext.tsx        # Gestión de autenticación
│   │
│   ├── hooks/              # Custom hooks
│   │   └── useCart.ts             # Lógica del carrito
│   │
│   ├── lib/                # Utilidades y configuración
│   │   ├── supabase.ts            # Cliente de Supabase
│   │   └── database.types.ts      # Tipos TypeScript de BD
│   │
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globales
│
├── supabase/
│   └── migrations/         # Scripts de base de datos
│       └── 20251119013741_create_fridays_schema.sql
│
├── public/                 # Archivos estáticos
├── index.html             # HTML principal
├── vite.config.ts         # Configuración de Vite
├── tailwind.config.js     # Configuración de Tailwind
├── tsconfig.json          # Configuración de TypeScript
└── package.json           # Dependencias y scripts
```

## 🗄️ Base de Datos

### Tablas Principales

#### `sedes`
Locales del restaurante
- `id`, `name`, `address`, `phone`, `active`

#### `users`
Usuarios del sistema (extiende auth.users)
- `id`, `sede_id`, `email`, `role`, `name`, `phone`, `active`

#### `menu_items`
Catálogo de productos
- `id`, `sede_id`, `name`, `description`, `price`, `category`
- `image_url`, `available`, `preparation_time`, `station`

#### `orders`
Pedidos de clientes
- `id`, `order_number`, `sede_id`, `customer_id`
- `customer_name`, `customer_phone`, `customer_address`
- `order_type` (delivery/pickup), `status`, `total_amount`
- `assigned_cheff_id`, `assigned_driver_id`
- Timestamps: `created_at`, `confirmed_at`, `kitchen_start_at`, `ready_at`, `delivered_at`

#### `order_items`
Items individuales de cada pedido
- `id`, `order_id`, `menu_item_id`, `name`, `price`, `quantity`
- `station`, `status`, `assigned_cook_id`, `notes`

#### `cart_items`
Carrito temporal de clientes
- `id`, `customer_id`, `menu_item_id`, `quantity`

#### `order_status_history`
Historial de cambios de estado
- `id`, `order_id`, `status`, `changed_by`, `notes`, `created_at`

### Estados de Pedidos

```
pending → confirmed → in_kitchen → cooking → packaging →
ready → on_the_way → delivered
                      ↓
                  cancelled
```

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:
- **Clientes**: Solo ven sus propios pedidos y el menú
- **Personal**: Solo accede a datos de su sede
- **Administradores**: Acceso completo al sistema

## 🔄 Flujo de Pedidos

### 1. Cliente Realiza Pedido
```
Cliente → Menú → Carrito → Checkout → Pedido Creado
```

### 2. Confirmación (Digitador/Chef)
```
Pedido Pendiente → Revisar → Confirmar → In Kitchen
```

### 3. Preparación (Chef + Cocineros)
```
In Kitchen → Asignar a Cocineros → Cooking → Items Ready
```

### 4. Empaque (Empacador)
```
All Items Ready → Packaging → Ready for Delivery
```

### 5. Entrega (Repartidor)
```
Ready → Assign Driver → On The Way → Delivered
```

## 🎨 Funcionalidades Detalladas

### Sistema de Autenticación

**Registro de Cliente:**
```typescript
const { error } = await signUp(email, password, name, phone);
```

**Inicio de Sesión:**
```typescript
const { error } = await signIn(email, password);
```

**Contexto de Autenticación:**
- Maneja sesión de usuario
- Carga perfil automáticamente
- Proporciona funciones de auth a toda la app

### Gestión del Carrito

**Hook useCart:**
```typescript
const {
  cartItems,        // Items en el carrito
  loading,          // Estado de carga
  addToCart,        // Agregar item
  updateQuantity,   // Actualizar cantidad
  removeFromCart,   // Eliminar item
  clearCart,        // Vaciar carrito
  total,            // Total del carrito
  itemCount         // Cantidad de items
} = useCart();
```

**Persistencia:**
- Carrito almacenado en Supabase
- Sincronizado automáticamente
- Único por usuario

### Dashboards por Rol

#### Dashboard de Chef
- Lista de pedidos confirmados
- Asignación de items a cocineros
- Vista general de la cocina
- Control de tiempos de preparación

#### Dashboard de Cocina
- Vista filtrada por estación de trabajo
- Items asignados al cocinero actual
- Actualización de estado de items
- Temporizadores de preparación

#### Dashboard de Delivery
- Pedidos asignados al repartidor
- Información de dirección de entrega
- Actualización de estado de entrega
- Mapa de rutas (futuro)

#### Panel de Administración
- CRUD de productos del menú
- Gestión de sedes
- Administración de usuarios
- Reportes y estadísticas
- Configuración del sistema

### Seguimiento de Pedidos

**Visualización en Tiempo Real:**
- Estado actual del pedido
- Historial de cambios
- Tiempo estimado de entrega
- Información del repartidor

## 🚀 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo

# Build
npm run build           # Compilar para producción
npm run preview         # Previsualizar build

# Linting
npm run lint            # Verificar código

# Type Checking
npm run typecheck       # Verificar tipos TypeScript
```

### Convenciones de Código

- **Componentes**: PascalCase (ej: `HomePage.tsx`)
- **Hooks**: camelCase con prefijo `use` (ej: `useCart.ts`)
- **Tipos**: PascalCase (ej: `MenuItem`, `OrderStatus`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `ORDER_STATUSES`)

### Agregar Nuevas Características

1. **Nueva Página:**
   - Crear componente en `src/pages/`
   - Agregar ruta en `App.tsx`
   - Actualizar navegación en `Navbar.tsx`

2. **Nuevo Dashboard:**
   - Crear componente en `src/components/`
   - Agregar lógica de rol en `DashboardPage.tsx`
   - Actualizar políticas RLS si es necesario

3. **Nueva Tabla en BD:**
   - Crear migration SQL
   - Regenerar tipos con Supabase CLI
   - Actualizar `database.types.ts`

### Testing (Recomendado para futuro)

```bash
# Instalar dependencias de testing
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Agregar script en package.json
"test": "vitest"
```

## 🔐 Seguridad

### Row Level Security (RLS)
- Todas las tablas protegidas
- Políticas basadas en roles
- Aislamiento por sede

### Autenticación
- JWT tokens de Supabase
- Sesiones persistentes
- Refresh automático de tokens

### Variables de Entorno
- Nunca commitear `.env`
- Usar variables de entorno en producción
- Anon key es pública, pero protegida por RLS

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints de Tailwind:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

## 🐛 Troubleshooting

### Problemas Comunes

**Error: "Invalid login credentials"**
- Verificar email y contraseña
- Confirmar email si es requerido
- Verificar que el usuario existe en la tabla `users`

**Error: "new row violates row-level security policy"**
- Verificar políticas RLS
- Confirmar que el usuario tiene el rol correcto
- Verificar que `sede_id` es correcto

**Carrito no se actualiza:**
- Verificar que el usuario está autenticado
- Revisar console para errores de Supabase
- Verificar conexión a internet

**Imágenes no cargan:**
- Verificar URLs en la base de datos
- Confirmar configuración de Storage en Supabase
- Revisar políticas de acceso a Storage

## 📞 Soporte

Para problemas o preguntas:
1. Revisar console del navegador
2. Verificar logs de Supabase
3. Revisar esta documentación
4. Contactar al equipo de desarrollo

## 🎯 Roadmap Futuro

- [ ] Integración de pagos (Culqi, Niubiz)
- [ ] Notificaciones push
- [ ] App móvil nativa (React Native)
- [ ] Sistema de recompensas/puntos
- [ ] Chat de soporte en vivo
- [ ] Integración con Google Maps para delivery
- [ ] Panel de analíticas avanzadas
- [ ] Sistema de reservas
- [ ] Programa de fidelización

## 📄 Licencia

Todos los derechos reservados © 2025 TGI Fridays Perú

---

**Desarrollado con ❤️ para TGI Fridays Perú**
