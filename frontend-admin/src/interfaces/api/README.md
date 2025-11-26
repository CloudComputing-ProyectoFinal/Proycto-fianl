# API Interfaces

Este directorio contiene todos los tipados TypeScript para los contratos de request/response de las funciones Lambda del backend.

## Estructura

```
api/
├── index.ts          # Punto de entrada centralizado
├── common.ts         # Tipos comunes (paginación, filtros, estados)
├── auth.ts           # Endpoints de autenticación
├── reports.ts        # Endpoints de reportes
├── places.ts         # Endpoints de lugares
└── users.ts          # Endpoints de usuarios
```

## Endpoints Mapeados

### Autenticación (`auth.ts`)
- `POST /auth/register` - Registro de nuevos usuarios (solo estudiantes desde frontend)
- `POST /auth/login` - Inicio de sesión


### Lugares (`places.ts`)
- `GET /places` - Listar lugares disponibles con filtros

### Usuarios (`users.ts`)
- `GET /users` - Listar usuarios con filtros (admin/authority)

## Uso

```typescript
import type {
  LoginRequest,
  LoginResponse,
  CreateReportRequest,
  CreateReportResponse,
  GetReportsParams,
  Report
} from '@/interfaces/api';

// En servicios
async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  return response.json();
}

// En componentes
const [reports, setReports] = useState<Report[]>([]);
```

## Tipos Comunes

### Estados de Reporte
- `PENDIENTE` - Reporte recién creado
- `ATENDIENDO` - Reporte en proceso
- `RESUELTO` - Reporte completado

### Niveles de Urgencia
- `BAJA` - Prioridad baja
- `MEDIA` - Prioridad media  
- `ALTA` - Prioridad alta (requiere atención inmediata)

### Roles de Usuario
- `student` - Estudiante (crea reportes)
- `authority` - Autoridad (atiende reportes de su sector)
- `admin` - Administrador (acceso completo)

## Paginación

Todos los endpoints que retornan listas soportan paginación mediante:

```typescript
interface PaginationParams {
  page?: number;  // Número de página (default: 1)
  size?: number;  // Tamaño de página (default: 20)
}

interface PaginationResponse {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  # API Interfaces

  Este directorio contiene todos los tipados TypeScript para los contratos de request/response que usa el frontend (y las lambdas del backend).

  ## Estructura

  ```
  api/
  ├── index.ts          # Punto de entrada centralizado
  ├── common.ts         # Tipos comunes (paginación, filtros, roles)
  ├── auth.ts           # Endpoints de autenticación (registro / login)
  ├── users.ts          # Endpoints de usuarios
  ├── orders.ts         # Tipos para pedidos (orders)
  └── menu.ts           # Tipos para menú / catálogo
  ```

  ## Objetivo

  Normalizar y tipar las respuestas/requests de la API para que los componentes del frontend trabajen con contratos claros. Los nombres de campos están en español cuando aplica (`correo_electronico`, `sede_id`, `contraseña`, etc.).

  ## Endpoints (mapeo conceptual)

  ### Autenticación (`auth.ts`)
  - `POST /auth/register` - Registro de nuevos usuarios
  - `POST /auth/login` - Inicio de sesión

  ### Usuarios (`users.ts`)
  - `GET /users` - Listar usuarios (filtrable por `role`, `sede_id`)
  - `GET /users/:id` - Obtener perfil de usuario

  ### Pedidos (`orders.ts`)
  - `GET /orders` - Listar pedidos (filtros por `sede_id`, `status`, `term`)
  - `POST /orders` - Crear pedido
  - `PATCH /orders/:id` - Actualizar estado / asignar repartidor

  ### Menú (`menu.ts`)
  - `GET /menu` - Obtener items del menú
  - `GET /menu/:id` - Obtener detalle de un item
  - `POST /menu` - Crear o actualizar items (admin)

  ## Tipos comunes

  ### Roles de Usuario
  - `USUARIO` - Cliente / usuario final
  - `COCINERO` - Personal de cocina
  - `DESPACHADOR` - Repartidor / delivery
  - `ADMIN` - Administrador

  Estos roles están definidos en `common.ts` como:

  ```ts
  export type Role = 'USUARIO' | 'COCINERO' | 'DESPACHADOR' | 'ADMIN';
  ```

  ### Estados de Pedido (OrderStatus)
  - `pending` — Pedido recibido
  - `packaging` — En preparación / empaquetando
  - `ready` — Pedido listo
  - `on_the_way` — En camino (repartidor asignado)
  - `delivered` — Entregado
  - `cancelled` — Cancelado

  Estos tipos están en `orders.ts`.

  ## Paginación

  Todos los endpoints que retornan listas soportan paginación mediante:

  ```ts
  interface PaginationParams {
    page?: number;  // Número de página (default: 1)
    size?: number;  // Tamaño de página (default: 20)
  }

  interface PaginationResponse {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  }
  ```

  ## Filtros

  Los endpoints de listado soportan filtros opcionales. Para el dominio restaurante los más comunes son:

  ```typescript
  interface FilterParams {
    sede_id?: string;      // filtrar por sucursal
    status?: string;       // estado del pedido
    term?: string;         // búsqueda de texto (cliente, número de pedido)
    orderBy?: string;
    order?: 'asc' | 'desc';
  }
  ```

  ## Uso rápido

  Importa los tipos desde el punto central `@/interfaces/api`:

  ```ts
  import type { LoginRequest, LoginResponse, Order, MenuItem } from '@/interfaces/api';

  // Ejemplo: realizar login
  async function login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await fetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    return res.json();
  }
  ```

  ## Notas
  - Los timestamps usan formato ISO8601.
  - Los IDs son UUID v4 cuando corresponda.
  - La autenticación usa JWT en header `Authorization: Bearer <token>`.
  - Nuevos tipos añadidos: `Order`, `OrderWithDriver`, `OrderItem`, `MenuItem`, `Category`.

  ---

  Si quieres, puedo añadir ejemplos concretos de request/response (ej.: payload de `POST /orders`) o un pequeño archivo `EXAMPLES.md` con JSONs de ejemplo para la integración con tu backend.
