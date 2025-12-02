# 🚀 Quick Start - Frontend Customer Integrado

## ⚡ Inicio Rápido

```bash
# 1. Ir al directorio del frontend
cd frontend-customer

# 2. Instalar dependencias (si no están instaladas)
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:5173/
```

## ✅ Verificar Integración

### 1. Verificar Variables de Entorno
```bash
# Verificar que .env existe
cat .env | grep VITE_API

# Deberías ver:
# VITE_API_URL_AUTH=https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev
# VITE_API_URL_COMIDA=https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev
# ... etc
```

### 2. Probar Login
```typescript
// En la consola del navegador (DevTools)
import { login } from './src/services/auth';

const response = await login({
  email: 'cliente@fridays.com',
  password: 'todos123'
});

console.log('Token:', response.token);
console.log('Usuario:', response.user);
```

### 3. Probar Menú
```typescript
// En la consola del navegador
import { fetchFood } from './src/services/food';

const menu = await fetchFood();
console.log('Productos:', menu.products);
```

### 4. Verificar WebSocket
```typescript
// En tu componente React
import { useWebSocket } from '@/hooks/useWebSocket';

function MyComponent() {
  const { isConnected, lastMessage } = useWebSocket({
    onMessage: (msg) => console.log('Nueva notificación:', msg)
  });
  
  return (
    <div>
      WebSocket: {isConnected ? '✅ Conectado' : '❌ Desconectado'}
    </div>
  );
}
```

## 📝 Usuarios de Prueba

Según `backend/API_ENDPOINTS.md`:

```typescript
// Cliente
{
  email: 'cliente@fridays.com',
  password: 'todos123',
  role: 'USER'
}

// Cocinero
{
  email: 'chef@fridays.com',
  password: 'todos123',
  role: 'COOK'
}

// Repartidor
{
  email: 'driver@fridays.com',
  password: 'todos123',
  role: 'DISPATCHER'
}

// Admin
{
  email: 'admin@fridays.com',
  password: 'todos123',
  role: 'ADMIN'
}
```

## 🔗 Endpoints Disponibles

### E-Commerce Service
```
Base URL: https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev

✅ POST   /auth/login
✅ POST   /auth/register
✅ GET    /menu
✅ GET    /menu/{category}
✅ POST   /orders
✅ GET    /orders/my-orders
✅ GET    /orders/{id}
✅ POST   /orders/{id}/cancel
✅ GET    /orders/{id}/track
```

### Admin Service
```
Base URL: https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev

✅ GET    /admin/dashboard
✅ GET    /admin/products
✅ GET    /admin/orders
✅ GET    /admin/users
```

### WebSocket
```
Base URL: wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev

✅ Conectar con: ?userId={id}&role={role}&tenantId={tenantId}
```

## 🧪 Testing Manual

### 1. Test de Login
1. Abrir `http://localhost:5173/login`
2. Ingresar credenciales de prueba
3. Verificar que redirige al dashboard
4. Verificar que el token se guarda en localStorage

### 2. Test de Menú
1. Abrir `http://localhost:5173/menu`
2. Verificar que carga productos
3. Verificar imágenes y precios
4. Probar filtros por categoría

### 3. Test de Orden
1. Agregar productos al carrito
2. Ir a checkout
3. Completar información de envío
4. Crear orden
5. Verificar redirección a tracking

### 4. Test de WebSocket
1. Crear una orden
2. Verificar notificación en tiempo real
3. Verificar toast notification
4. Verificar actualización automática del estado

## 📁 Archivos Importantes

```
frontend-customer/
├── .env                              ← Variables de entorno
├── src/
│   ├── services/
│   │   ├── api/config.ts            ← Configuración central ⭐
│   │   ├── auth.ts                  ← Autenticación
│   │   ├── food.ts                  ← Menú/Productos
│   │   ├── orders.ts                ← Órdenes ⭐ NUEVO
│   │   └── admin.ts                 ← Admin
│   ├── hooks/
│   │   └── useWebSocket.ts          ← WebSocket
│   └── utils/
│       └── loaderEnv.ts             ← Env loader
├── INTEGRATION-COMPLETED.md         ← Documentación completa
└── package.json
```

## 🐛 Problemas Comunes

### Puerto 5173 ocupado
```bash
# Matar proceso en el puerto
lsof -ti:5173 | xargs kill -9

# O cambiar puerto en vite.config.ts
```

### CORS Error
```bash
# Verificar que backend tiene CORS habilitado
# Verificar que estás usando el endpoint correcto
```

### 401 Unauthorized
```bash
# Verificar token en localStorage
localStorage.getItem('auth_token')

# Si no existe, hacer login nuevamente
```

### WebSocket no conecta
```bash
# Verificar que el usuario está logueado
# Verificar URL en .env
# Verificar consola del navegador para errores
```

## 📞 Soporte

- **Documentación Backend**: `backend/API_ENDPOINTS.md`
- **Endpoints AWS**: `ENDPOINTS.md`
- **Guía Completa**: `INTEGRACION-FRONTEND-CUSTOMER.md`
- **Ejemplos**: `FRONTEND-CODE-EXAMPLES.md`

## 🎉 ¡Listo!

El frontend está integrado y funcionando. Ahora puedes:

1. ✅ Desarrollar nuevas features
2. ✅ Conectar componentes a los servicios
3. ✅ Probar flujos completos
4. ✅ Deploy a producción

**Servidor corriendo:** `http://localhost:5173/` 🚀
