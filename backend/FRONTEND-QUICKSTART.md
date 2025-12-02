# ⚡ Quick Start - Integración Frontend
## Fridays Perú - Guía Rápida de 5 Minutos

---

## 🚀 Comenzar en 3 Pasos

### 1. Instalar Dependencias

```bash
npm install axios react-hot-toast
# o
yarn add axios react-hot-toast
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto frontend:

```bash
VITE_API_ECOMMERCE=https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev
VITE_API_KITCHEN=https://6nry2wpzl1.execute-api.us-east-1.amazonaws.com/dev
VITE_API_DELIVERY=https://8ghxkz67bd.execute-api.us-east-1.amazonaws.com/dev
VITE_API_ADMIN=https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev
VITE_WS_URL=wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev
```

### 3. Copiar Archivos de Configuración

Copiar estos archivos de `backend/FRONTEND-CODE-EXAMPLES.md`:
- `api/config.ts` - Configuración de Axios
- `api/interceptors.ts` - Manejo de tokens y errores
- `types/api.types.ts` - Tipos TypeScript

---

## 📝 Ejemplo Mínimo de Integración

### Login y Consulta de Productos

```typescript
// Simple ejemplo sin hooks ni contextos
import axios from 'axios';

const API_BASE = 'https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev';

// 1. Login
async function login(email: string, password: string) {
  const response = await axios.post(`${API_BASE}/auth/login`, {
    email,
    password
  });
  
  // Guardar token
  localStorage.setItem('token', response.data.token);
  return response.data;
}

// 2. Obtener productos (sin autenticación)
async function getProducts() {
  const response = await axios.get(`${API_BASE}/products`);
  return response.data.products;
}

// 3. Agregar al carrito (requiere autenticación)
async function addToCart(productId: string, quantity: number) {
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    `${API_BASE}/cart/items`,
    { productId, quantity },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
}

// Uso
async function example() {
  // Login
  const auth = await login('test@example.com', 'password');
  console.log('Logged in:', auth.user);
  
  // Ver productos
  const products = await getProducts();
  console.log('Products:', products);
  
  // Agregar al carrito
  const cart = await addToCart('prod_001', 2);
  console.log('Cart:', cart);
}
```

---

## 🎯 URLs Principales

### APIs REST

| Servicio | URL |
|----------|-----|
| E-Commerce | `https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev` |
| Kitchen | `https://6nry2wpzl1.execute-api.us-east-1.amazonaws.com/dev` |
| Delivery | `https://8ghxkz67bd.execute-api.us-east-1.amazonaws.com/dev` |
| Admin | `https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev` |

### WebSocket

```
wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev
```

---

## 🔐 Autenticación Rápida

### Registrar Usuario

```bash
curl -X POST https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "Password123!",
    "name": "Juan Pérez",
    "phone": "+51987654321"
  }'
```

### Login

```bash
curl -X POST https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "Password123!"
  }'
```

---

## 📦 Endpoints Principales

### Sin Autenticación

```typescript
GET  /products                    // Listar productos
GET  /products/{id}              // Ver producto
GET  /products/search?q=burger   // Buscar productos
POST /auth/register              // Registrarse
POST /auth/login                 // Login
```

### Con Autenticación

```typescript
// Carrito
GET    /cart                     // Ver carrito
POST   /cart/items              // Agregar producto
PUT    /cart/items/{id}         // Actualizar cantidad
DELETE /cart/items/{id}         // Eliminar producto
DELETE /cart                    // Vaciar carrito

// Órdenes
POST   /orders/checkout         // Crear orden
GET    /orders                  // Ver mis órdenes
GET    /orders/{id}             // Ver orden específica
DELETE /orders/{id}             // Cancelar orden
```

---

## 🔔 WebSocket Básico

```javascript
const ws = new WebSocket('wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev');

ws.onopen = () => {
  // Autenticar
  ws.send(JSON.stringify({
    action: 'authenticate',
    token: 'Bearer YOUR_TOKEN'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Notification:', data);
  
  // Ejemplo: Mostrar notificación cuando cambia estado de orden
  if (data.type === 'ORDER_STATUS_CHANGED') {
    alert(`Tu orden está: ${data.order.status}`);
  }
};
```

---

## ⚠️ Manejo de Errores

```typescript
try {
  const response = await axios.post('/cart/items', data);
  // Success
} catch (error) {
  if (error.response) {
    // Errores del servidor
    switch (error.response.status) {
      case 401:
        // Token expirado - redirigir a login
        window.location.href = '/login';
        break;
      case 404:
        alert('Recurso no encontrado');
        break;
      default:
        alert(error.response.data.message);
    }
  } else {
    // Error de red
    alert('Error de conexión');
  }
}
```

---

## 📚 Documentación Completa

### Documentos Disponibles

1. **FRONTEND-INTEGRATION-GUIDE.md** - Guía completa de integración
   - Todos los endpoints documentados
   - Ejemplos de requests/responses
   - Tipos de datos
   - Manejo de errores

2. **FRONTEND-CODE-EXAMPLES.md** - Código listo para usar
   - Configuración de Axios
   - Servicios completos
   - Hooks de React
   - Componentes de ejemplo

3. **ENDPOINTS.md** - Referencia técnica
   - URLs de todos los servicios
   - ARNs de recursos AWS
   - Información de deployment

### Colecciones Postman

```
backend/postman/
├── Fridays Perú - E-Commerce Service.postman_collection.json
├── Fridays Perú - Kitchen Service.postman_collection.json
├── Fridays Perú - Delivery Service.postman_collection.json
└── Fridays Perú - Admin Service.postman_collection.json
```

---

## 🐛 Testing Rápido

### Probar que el backend funciona

```bash
# Listar productos (no requiere auth)
curl https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev/products

# Debería retornar JSON con lista de productos
```

---

## 💡 Tips

1. **Token Expirado**: Los tokens JWT expiran después de 24 horas. Redirige a login cuando recibas error 401.

2. **CORS**: Ya está configurado en el backend para aceptar cualquier origen en desarrollo.

3. **WebSocket Reconexión**: Implementa lógica de reconexión automática cada 3-5 segundos.

4. **Loading States**: Siempre muestra un indicador de carga durante las peticiones API.

5. **Optimistic UI**: Actualiza la UI inmediatamente y revierte si la petición falla.

---

## 🆘 Ayuda

### Problemas Comunes

**❌ Error 401 Unauthorized**
- Verifica que el token esté en el header: `Authorization: Bearer {token}`
- Verifica que el token no haya expirado (24 horas)

**❌ Error CORS**
- Verifica que estés usando las URLs correctas
- En desarrollo local, el backend debe estar corriendo

**❌ WebSocket no conecta**
- Verifica que el token sea válido
- Usa `wss://` (no `ws://`) para producción

**❌ 404 Not Found**
- Verifica la URL del endpoint
- Verifica que el servicio esté deployado

### Contacto

Para dudas o problemas:
1. Revisar documentación completa en `FRONTEND-INTEGRATION-GUIDE.md`
2. Revisar ejemplos de código en `FRONTEND-CODE-EXAMPLES.md`
3. Probar endpoints con Postman
4. Contactar al equipo de backend

---

## ✅ Checklist Mínimo

- [ ] Variables de entorno configuradas
- [ ] Axios instalado
- [ ] Login funcional
- [ ] Listar productos funcional
- [ ] Agregar al carrito funcional
- [ ] Ver órdenes funcional
- [ ] Manejo básico de errores
- [ ] WebSocket conectado (opcional para MVP)

---

**¡Listo para comenzar! 🚀**
