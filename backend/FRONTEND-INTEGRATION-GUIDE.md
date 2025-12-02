# 🔗 Guía de Integración Frontend - Backend
## Fridays Perú - Sistema de Gestión de Pedidos

---

## 📋 Tabla de Contenidos

1. [Información General](#información-general)
2. [URLs Base de los Servicios](#urls-base-de-los-servicios)
3. [Autenticación y Autorización](#autenticación-y-autorización)
4. [Servicios Disponibles](#servicios-disponibles)
5. [Ejemplos de Integración](#ejemplos-de-integración)
6. [Manejo de Errores](#manejo-de-errores)
7. [WebSocket para Tiempo Real](#websocket-para-tiempo-real)
8. [Variables de Entorno](#variables-de-entorno)
9. [Colecciones Postman](#colecciones-postman)

---

## 📌 Información General

### Arquitectura
El backend está desplegado en **AWS** utilizando una arquitectura de microservicios serverless:

- **5 Servicios REST API** (API Gateway + Lambda)
- **1 Servicio WebSocket** para notificaciones en tiempo real
- **2 Servicios de Background** (Step Functions y Workers)
- **Base de datos**: DynamoDB
- **Región**: us-east-1 (Virginia)
- **Stage**: dev

### Tecnología
- **Runtime**: Node.js 20.x
- **Framework**: Serverless Framework
- **Autenticación**: JWT (JSON Web Tokens)
- **Formato de datos**: JSON
- **Encoding**: UTF-8

---

## 🌐 URLs Base de los Servicios

### Producción (AWS Academy Lab)

```javascript
const API_ENDPOINTS = {
  // Servicios REST
  ECOMMERCE: 'https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev',
  KITCHEN: 'https://6nry2wpzl1.execute-api.us-east-1.amazonaws.com/dev',
  DELIVERY: 'https://8ghxkz67bd.execute-api.us-east-1.amazonaws.com/dev',
  ADMIN: 'https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev',
  
  // WebSocket
  WEBSOCKET: 'wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev'
};
```

### Desarrollo Local

```javascript
const API_ENDPOINTS = {
  ECOMMERCE: 'http://localhost:3000',
  KITCHEN: 'http://localhost:3001',
  DELIVERY: 'http://localhost:3002',
  ADMIN: 'http://localhost:3003',
  WEBSOCKET: 'ws://localhost:3004'
};
```

---

## 🔐 Autenticación y Autorización

### 1. Registro de Usuario

**Endpoint**: `POST /auth/register`  
**Servicio**: E-Commerce  
**Autenticación**: No requerida

```javascript
// Request
POST https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Password123!",
  "name": "Juan Pérez",
  "phone": "+51987654321"
}

// Response (200 OK)
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "userId": "usr_abc123",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Inicio de Sesión

**Endpoint**: `POST /auth/login`  
**Servicio**: E-Commerce  
**Autenticación**: No requerida

```javascript
// Request
POST https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Password123!"
}

// Response (200 OK)
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "usr_abc123",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "customer"
  }
}
```

### 3. Uso del Token

**Todos los endpoints protegidos** requieren el token JWT en el header `Authorization`:

```javascript
// Headers para requests autenticados
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

### 4. Roles de Usuario

| Role | Descripción | Permisos |
|------|-------------|----------|
| `customer` | Cliente | Ver productos, crear órdenes, ver sus propias órdenes |
| `cook` | Cocinero | Ver órdenes asignadas, actualizar estados de cocina |
| `driver` | Repartidor | Ver entregas asignadas, actualizar estados de entrega |
| `admin` | Administrador | Acceso completo, dashboard, reportes, gestión de usuarios |

---

## 🛒 Servicios Disponibles

## 1️⃣ E-COMMERCE SERVICE

Base URL: `https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev`

### 📦 Productos

#### Listar Todos los Productos
```javascript
GET /products

// Response
{
  "products": [
    {
      "productId": "prod_001",
      "name": "Hamburguesa Clásica",
      "description": "Hamburguesa con carne 100% res",
      "price": 25.90,
      "category": "burgers",
      "imageUrl": "https://...",
      "available": true,
      "preparationTime": 15
    }
  ]
}
```

#### Obtener Producto por ID
```javascript
GET /products/{productId}

// Response
{
  "productId": "prod_001",
  "name": "Hamburguesa Clásica",
  "description": "Hamburguesa con carne 100% res",
  "price": 25.90,
  "category": "burgers",
  "imageUrl": "https://...",
  "available": true,
  "preparationTime": 15
}
```

#### Buscar Productos
```javascript
GET /products/search?q=hamburguesa&category=burgers

// Response
{
  "products": [...],
  "count": 5,
  "query": "hamburguesa"
}
```

### 🛍️ Carrito de Compras

#### Ver Carrito
```javascript
GET /cart
Authorization: Bearer {token}

// Response
{
  "cartId": "cart_abc123",
  "userId": "usr_abc123",
  "items": [
    {
      "productId": "prod_001",
      "name": "Hamburguesa Clásica",
      "quantity": 2,
      "price": 25.90,
      "subtotal": 51.80
    }
  ],
  "total": 51.80,
  "itemCount": 2
}
```

#### Agregar al Carrito
```javascript
POST /cart/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "prod_001",
  "quantity": 2,
  "notes": "Sin cebolla"
}

// Response
{
  "message": "Producto agregado al carrito",
  "cart": { ... }
}
```

#### Actualizar Cantidad
```javascript
PUT /cart/items/{productId}
Authorization: Bearer {token}

{
  "quantity": 3
}
```

#### Eliminar del Carrito
```javascript
DELETE /cart/items/{productId}
Authorization: Bearer {token}

// Response
{
  "message": "Producto eliminado del carrito"
}
```

#### Vaciar Carrito
```javascript
DELETE /cart
Authorization: Bearer {token}
```

### 💳 Checkout y Órdenes

#### Crear Orden (Checkout)
```javascript
POST /orders/checkout
Authorization: Bearer {token}

{
  "deliveryAddress": {
    "street": "Av. Salaverry 2255",
    "district": "Jesús María",
    "city": "Lima",
    "reference": "Frente al parque"
  },
  "paymentMethod": "cash", // "cash" | "card" | "yape"
  "notes": "Tocar el timbre dos veces"
}

// Response
{
  "message": "Orden creada exitosamente",
  "order": {
    "orderId": "ord_xyz789",
    "orderNumber": "ORD-20251202-001",
    "userId": "usr_abc123",
    "items": [...],
    "subtotal": 51.80,
    "deliveryFee": 5.00,
    "total": 56.80,
    "status": "pending",
    "estimatedDeliveryTime": "2025-12-02T23:00:00Z",
    "createdAt": "2025-12-02T22:15:00Z"
  }
}
```

#### Ver Mis Órdenes
```javascript
GET /orders
Authorization: Bearer {token}

// Response
{
  "orders": [
    {
      "orderId": "ord_xyz789",
      "orderNumber": "ORD-20251202-001",
      "status": "in_progress",
      "total": 56.80,
      "createdAt": "2025-12-02T22:15:00Z",
      "items": [...]
    }
  ]
}
```

#### Ver Orden por ID
```javascript
GET /orders/{orderId}
Authorization: Bearer {token}

// Response
{
  "orderId": "ord_xyz789",
  "orderNumber": "ORD-20251202-001",
  "userId": "usr_abc123",
  "status": "in_progress",
  "items": [...],
  "total": 56.80,
  "deliveryAddress": {...},
  "timeline": [
    {
      "status": "pending",
      "timestamp": "2025-12-02T22:15:00Z"
    },
    {
      "status": "confirmed",
      "timestamp": "2025-12-02T22:16:00Z"
    }
  ]
}
```

#### Cancelar Orden
```javascript
DELETE /orders/{orderId}
Authorization: Bearer {token}

// Response
{
  "message": "Orden cancelada exitosamente",
  "orderId": "ord_xyz789"
}
```

---

## 2️⃣ KITCHEN SERVICE

Base URL: `https://6nry2wpzl1.execute-api.us-east-1.amazonaws.com/dev`

### 👨‍🍳 Gestión de Cocina

#### Ver Órdenes de Cocina (para cocineros)
```javascript
GET /kitchen/orders
Authorization: Bearer {token}
Role: cook

// Query params opcionales:
// ?status=pending | preparing | ready

// Response
{
  "orders": [
    {
      "orderId": "ord_xyz789",
      "orderNumber": "ORD-20251202-001",
      "items": [
        {
          "productId": "prod_001",
          "name": "Hamburguesa Clásica",
          "quantity": 2,
          "notes": "Sin cebolla"
        }
      ],
      "status": "pending",
      "assignedTo": null,
      "createdAt": "2025-12-02T22:15:00Z",
      "estimatedTime": 15
    }
  ]
}
```

#### Asignar Orden a Cocinero
```javascript
POST /kitchen/orders/{orderId}/assign
Authorization: Bearer {token}
Role: cook

// Response
{
  "message": "Orden asignada exitosamente",
  "orderId": "ord_xyz789",
  "assignedTo": "usr_cook123"
}
```

#### Actualizar Estado de Orden
```javascript
PUT /kitchen/orders/{orderId}/status
Authorization: Bearer {token}
Role: cook

{
  "status": "preparing" // "preparing" | "ready"
}

// Response
{
  "message": "Estado actualizado",
  "orderId": "ord_xyz789",
  "status": "preparing"
}
```

#### Marcar Orden como Lista
```javascript
POST /kitchen/orders/{orderId}/ready
Authorization: Bearer {token}
Role: cook

// Response
{
  "message": "Orden lista para entrega",
  "orderId": "ord_xyz789",
  "status": "ready"
}
```

---

## 3️⃣ DELIVERY SERVICE

Base URL: `https://8ghxkz67bd.execute-api.us-east-1.amazonaws.com/dev`

### 🚚 Gestión de Entregas

#### Ver Entregas Disponibles
```javascript
GET /delivery/available
Authorization: Bearer {token}
Role: driver

// Response
{
  "deliveries": [
    {
      "orderId": "ord_xyz789",
      "orderNumber": "ORD-20251202-001",
      "deliveryAddress": {
        "street": "Av. Salaverry 2255",
        "district": "Jesús María",
        "city": "Lima"
      },
      "status": "ready",
      "distance": 2.5, // km
      "estimatedTime": 15 // minutos
    }
  ]
}
```

#### Ver Mis Entregas
```javascript
GET /delivery/my-deliveries
Authorization: Bearer {token}
Role: driver

// Response
{
  "deliveries": [
    {
      "orderId": "ord_xyz789",
      "status": "in_transit",
      "customerName": "Juan Pérez",
      "customerPhone": "+51987654321",
      "deliveryAddress": {...}
    }
  ]
}
```

#### Asignar Entrega
```javascript
POST /delivery/{orderId}/assign
Authorization: Bearer {token}
Role: driver

// Response
{
  "message": "Entrega asignada exitosamente",
  "orderId": "ord_xyz789",
  "driverId": "usr_driver123"
}
```

#### Actualizar Estado de Entrega
```javascript
PUT /delivery/{orderId}/status
Authorization: Bearer {token}
Role: driver

{
  "status": "in_transit", // "in_transit" | "delivered"
  "location": {
    "lat": -12.0464,
    "lng": -77.0428
  }
}

// Response
{
  "message": "Estado actualizado",
  "orderId": "ord_xyz789",
  "status": "in_transit"
}
```

#### Marcar como Entregado
```javascript
POST /delivery/{orderId}/delivered
Authorization: Bearer {token}
Role: driver

{
  "notes": "Entregado en recepción",
  "signature": "base64_image_data" // opcional
}

// Response
{
  "message": "Orden entregada exitosamente",
  "orderId": "ord_xyz789",
  "deliveredAt": "2025-12-02T23:00:00Z"
}
```

---

## 4️⃣ ADMIN SERVICE

Base URL: `https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev`

### 📊 Dashboard y Reportes

#### Dashboard General
```javascript
GET /admin/dashboard
Authorization: Bearer {token}
Role: admin

// Response
{
  "summary": {
    "totalOrders": 150,
    "pendingOrders": 12,
    "inProgressOrders": 8,
    "completedToday": 45,
    "revenue": {
      "today": 2500.50,
      "week": 15000.00,
      "month": 58000.00
    }
  },
  "recentOrders": [...],
  "activeDrivers": 5,
  "activeCooks": 3
}
```

#### Reporte de Ventas
```javascript
GET /admin/reports/sales
Authorization: Bearer {token}
Role: admin

// Query params:
// ?startDate=2025-12-01&endDate=2025-12-02

// Response
{
  "period": {
    "start": "2025-12-01",
    "end": "2025-12-02"
  },
  "totalSales": 5500.00,
  "orderCount": 75,
  "averageOrderValue": 73.33,
  "topProducts": [
    {
      "productId": "prod_001",
      "name": "Hamburguesa Clásica",
      "quantity": 120,
      "revenue": 3108.00
    }
  ]
}
```

#### Gestión de Usuarios
```javascript
// Listar usuarios
GET /admin/users
Authorization: Bearer {token}
Role: admin

// Crear usuario (admin, cook, driver)
POST /admin/users
Authorization: Bearer {token}
Role: admin

{
  "email": "cocinero@fridays.pe",
  "password": "Password123!",
  "name": "Carlos García",
  "role": "cook",
  "phone": "+51987654321"
}
```

#### Gestión de Productos
```javascript
// Crear producto
POST /admin/products
Authorization: Bearer {token}
Role: admin

{
  "name": "Hamburguesa BBQ",
  "description": "Hamburguesa con salsa BBQ",
  "price": 28.90,
  "category": "burgers",
  "imageUrl": "https://...",
  "preparationTime": 15
}

// Actualizar producto
PUT /admin/products/{productId}
Authorization: Bearer {token}
Role: admin

// Eliminar producto
DELETE /admin/products/{productId}
Authorization: Bearer {token}
Role: admin
```

---

## 🔌 WebSocket para Tiempo Real

Base URL: `wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev`

### Conexión

```javascript
// Conectar al WebSocket
const ws = new WebSocket('wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev');

ws.onopen = () => {
  console.log('Conectado al WebSocket');
  
  // Autenticar la conexión
  ws.send(JSON.stringify({
    action: 'authenticate',
    token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Mensaje recibido:', data);
  
  // Manejar diferentes tipos de eventos
  switch(data.type) {
    case 'ORDER_CREATED':
      handleNewOrder(data.order);
      break;
    case 'ORDER_STATUS_CHANGED':
      handleOrderStatusChange(data.order);
      break;
    case 'DELIVERY_LOCATION_UPDATE':
      handleDeliveryLocationUpdate(data.location);
      break;
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket desconectado');
  // Reconectar después de 3 segundos
  setTimeout(connectWebSocket, 3000);
};
```

### Eventos en Tiempo Real

#### 1. Nueva Orden (para cocineros y admins)
```javascript
{
  "type": "ORDER_CREATED",
  "order": {
    "orderId": "ord_xyz789",
    "orderNumber": "ORD-20251202-001",
    "items": [...],
    "total": 56.80,
    "createdAt": "2025-12-02T22:15:00Z"
  }
}
```

#### 2. Cambio de Estado de Orden (para clientes)
```javascript
{
  "type": "ORDER_STATUS_CHANGED",
  "order": {
    "orderId": "ord_xyz789",
    "status": "preparing",
    "previousStatus": "pending",
    "updatedAt": "2025-12-02T22:20:00Z"
  }
}
```

#### 3. Actualización de Ubicación del Repartidor (para clientes)
```javascript
{
  "type": "DELIVERY_LOCATION_UPDATE",
  "orderId": "ord_xyz789",
  "location": {
    "lat": -12.0464,
    "lng": -77.0428
  },
  "estimatedArrival": "2025-12-02T23:00:00Z"
}
```

#### 4. Notificación General
```javascript
{
  "type": "NOTIFICATION",
  "message": "Tu orden está en camino",
  "priority": "high",
  "timestamp": "2025-12-02T22:45:00Z"
}
```

---

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Acción Recomendada |
|--------|-------------|-------------------|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Revisar los datos enviados |
| 401 | Unauthorized | Token inválido o expirado, solicitar login |
| 403 | Forbidden | Usuario no tiene permisos para esta acción |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: email ya registrado) |
| 500 | Internal Server Error | Error del servidor, reintentar |
| 503 | Service Unavailable | Servicio temporalmente no disponible |

### Formato de Errores

```javascript
// Respuesta de error estándar
{
  "error": "Validation Error",
  "message": "Email ya está registrado",
  "statusCode": 409,
  "details": {
    "field": "email",
    "value": "usuario@example.com"
  }
}
```

### Manejo de Tokens Expirados

```javascript
// Interceptor para manejar tokens expirados
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado, redirigir a login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🔧 Ejemplos de Integración

### Configuración de Axios

```javascript
// api/config.js
import axios from 'axios';

const API_BASE_URLS = {
  ecommerce: 'https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev',
  kitchen: 'https://6nry2wpzl1.execute-api.us-east-1.amazonaws.com/dev',
  delivery: 'https://8ghxkz67bd.execute-api.us-east-1.amazonaws.com/dev',
  admin: 'https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev'
};

// Crear instancias de axios para cada servicio
export const ecommerceApi = axios.create({
  baseURL: API_BASE_URLS.ecommerce,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const kitchenApi = axios.create({
  baseURL: API_BASE_URLS.kitchen,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const deliveryApi = axios.create({
  baseURL: API_BASE_URLS.delivery,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const adminApi = axios.create({
  baseURL: API_BASE_URLS.admin,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token automáticamente
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );
  
  apiInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Aplicar interceptor a todas las instancias
addAuthInterceptor(ecommerceApi);
addAuthInterceptor(kitchenApi);
addAuthInterceptor(deliveryApi);
addAuthInterceptor(adminApi);
```

### Servicio de Autenticación

```javascript
// services/authService.js
import { ecommerceApi } from './config';

export const authService = {
  async register(userData) {
    const response = await ecommerceApi.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(email, password) {
    const response = await ecommerceApi.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
```

### Servicio de Productos

```javascript
// services/productService.js
import { ecommerceApi } from './config';

export const productService = {
  async getAllProducts() {
    const response = await ecommerceApi.get('/products');
    return response.data.products;
  },

  async getProductById(productId) {
    const response = await ecommerceApi.get(`/products/${productId}`);
    return response.data;
  },

  async searchProducts(query, category = null) {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category);
    
    const response = await ecommerceApi.get(`/products/search?${params}`);
    return response.data.products;
  }
};
```

### Servicio de Carrito

```javascript
// services/cartService.js
import { ecommerceApi } from './config';

export const cartService = {
  async getCart() {
    const response = await ecommerceApi.get('/cart');
    return response.data;
  },

  async addItem(productId, quantity, notes = '') {
    const response = await ecommerceApi.post('/cart/items', {
      productId,
      quantity,
      notes
    });
    return response.data;
  },

  async updateItem(productId, quantity) {
    const response = await ecommerceApi.put(`/cart/items/${productId}`, {
      quantity
    });
    return response.data;
  },

  async removeItem(productId) {
    const response = await ecommerceApi.delete(`/cart/items/${productId}`);
    return response.data;
  },

  async clearCart() {
    const response = await ecommerceApi.delete('/cart');
    return response.data;
  }
};
```

### Servicio de Órdenes

```javascript
// services/orderService.js
import { ecommerceApi } from './config';

export const orderService = {
  async createOrder(orderData) {
    const response = await ecommerceApi.post('/orders/checkout', orderData);
    return response.data;
  },

  async getMyOrders() {
    const response = await ecommerceApi.get('/orders');
    return response.data.orders;
  },

  async getOrderById(orderId) {
    const response = await ecommerceApi.get(`/orders/${orderId}`);
    return response.data;
  },

  async cancelOrder(orderId) {
    const response = await ecommerceApi.delete(`/orders/${orderId}`);
    return response.data;
  }
};
```

### Hook de React para WebSocket

```javascript
// hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new WebSocket('wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev');
    
    ws.onopen = () => {
      setIsConnected(true);
      // Autenticar
      ws.send(JSON.stringify({
        action: 'authenticate',
        token: `Bearer ${token}`
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Reconectar después de 3 segundos
      setTimeout(() => {
        if (localStorage.getItem('token')) {
          window.location.reload();
        }
      }, 3000);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (message) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, messages, sendMessage };
};
```

---

## 📦 Variables de Entorno

### Archivo `.env` para el Frontend

```bash
# API Endpoints
VITE_API_ECOMMERCE=https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev
VITE_API_KITCHEN=https://6nry2wpzl1.execute-api.us-east-1.amazonaws.com/dev
VITE_API_DELIVERY=https://8ghxkz67bd.execute-api.us-east-1.amazonaws.com/dev
VITE_API_ADMIN=https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev

# WebSocket
VITE_WS_URL=wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev

# Configuración
VITE_APP_NAME="Fridays Perú"
VITE_APP_VERSION=1.0.0
VITE_ENABLE_WEBSOCKET=true

# Desarrollo
VITE_DEBUG_MODE=false
```

---

## 📚 Colecciones Postman

Las colecciones de Postman con todos los endpoints están disponibles en:

```
backend/postman/
├── Fridays Perú - Admin Service.postman_collection.json
├── Fridays Perú - Delivery Service.postman_collection.json
├── Fridays Perú - E-Commerce Service.postman_collection.json
├── Fridays Perú - Kitchen Service.postman_collection.json
└── Fridays Perú - WebSocket Service.postman_collection.json
```

**Para importar en Postman:**
1. Abrir Postman
2. Click en "Import"
3. Seleccionar los archivos JSON
4. Configurar las variables de entorno en Postman

---

## 🔄 Estados de Órdenes

### Flujo Completo

```
pending → confirmed → preparing → ready → in_transit → delivered
                  ↓
               cancelled
```

| Estado | Descripción | Siguiente Estado |
|--------|-------------|------------------|
| `pending` | Orden creada, esperando confirmación | `confirmed` o `cancelled` |
| `confirmed` | Orden confirmada, asignada a cocina | `preparing` |
| `preparing` | En preparación por cocinero | `ready` |
| `ready` | Lista para entrega | `in_transit` |
| `in_transit` | En camino con el repartidor | `delivered` |
| `delivered` | Entregada al cliente | - |
| `cancelled` | Cancelada por cliente o sistema | - |

---

## 🎨 Consideraciones de UI/UX

### Loading States
- Mostrar spinners durante las peticiones API
- Deshabilitar botones durante operaciones
- Mantener feedback visual del progreso

### Error Handling
- Mostrar mensajes de error amigables
- Permitir reintentos en caso de fallos
- Timeout de 30 segundos para peticiones

### Notificaciones en Tiempo Real
- Usar toast notifications para eventos de WebSocket
- Actualizar UI automáticamente cuando cambia el estado de una orden
- Mostrar badge con notificaciones pendientes

### Optimistic Updates
- Actualizar UI inmediatamente al agregar al carrito
- Revertir si la petición falla

---

## 🐛 Debugging

### Habilitar Logs de Desarrollo

```javascript
// api/config.js
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  axios.interceptors.request.use(request => {
    console.log('Starting Request', request);
    return request;
  });

  axios.interceptors.response.use(response => {
    console.log('Response:', response);
    return response;
  });
}
```

### Probar Endpoints con cURL

```bash
# Test de login
curl -X POST https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test de productos (con token)
curl https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📞 Soporte

### Contacto del Equipo Backend

- **Documentación Técnica**: Ver `backend/ENDPOINTS.md`
- **Arquitectura**: Ver `backend/ARCHITECTURE-AUDIT.md`
- **Deployment**: Ver `backend/DEPLOYMENT-GUIDE.md`

### Issues Comunes

1. **401 Unauthorized**: Verificar que el token esté en el header correcto
2. **CORS Errors**: Contactar al equipo backend para agregar origen
3. **WebSocket no conecta**: Verificar que el token sea válido
4. **Datos no se actualizan**: Verificar conexión WebSocket

---

## ✅ Checklist de Integración

- [ ] Configurar variables de entorno
- [ ] Implementar servicio de autenticación
- [ ] Implementar servicios de API (productos, carrito, órdenes)
- [ ] Configurar interceptores de Axios
- [ ] Implementar manejo de errores
- [ ] Conectar WebSocket para notificaciones
- [ ] Testear flujo completo de compra
- [ ] Implementar manejo de tokens expirados
- [ ] Agregar loading states
- [ ] Agregar error boundaries
- [ ] Testear en diferentes navegadores
- [ ] Verificar responsive design

---

**Última actualización**: 2 de Diciembre, 2025  
**Versión del documento**: 1.0  
**Autor**: Equipo Backend Fridays Perú
