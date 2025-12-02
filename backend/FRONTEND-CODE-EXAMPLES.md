# 🎯 Ejemplos Prácticos de Integración - Frontend
## Fridays Perú - Implementaciones Listas para Usar

---

## 📁 Estructura de Archivos Recomendada

```
src/
├── api/
│   ├── config.ts              # Configuración base de API
│   ├── interceptors.ts        # Interceptores de Axios
│   └── services/
│       ├── authService.ts
│       ├── productService.ts
│       ├── cartService.ts
│       ├── orderService.ts
│       ├── kitchenService.ts
│       ├── deliveryService.ts
│       └── adminService.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useOrders.ts
│   └── useWebSocket.ts
├── contexts/
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── WebSocketContext.tsx
├── types/
│   └── api.types.ts
└── utils/
    └── errorHandler.ts
```

---

## 🔧 Configuración Base (TypeScript)

### `api/config.ts`

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// URLs de los servicios
export const API_ENDPOINTS = {
  ECOMMERCE: import.meta.env.VITE_API_ECOMMERCE || 'https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev',
  KITCHEN: import.meta.env.VITE_API_KITCHEN || 'https://6nry2wpzl1.execute-api.us-east-1.amazonaws.com/dev',
  DELIVERY: import.meta.env.VITE_API_DELIVERY || 'https://8ghxkz67bd.execute-api.us-east-1.amazonaws.com/dev',
  ADMIN: import.meta.env.VITE_API_ADMIN || 'https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev',
  WEBSOCKET: import.meta.env.VITE_WS_URL || 'wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev',
};

// Configuración base para axios
const createApiInstance = (baseURL: string): AxiosInstance => {
  return axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Crear instancias para cada servicio
export const ecommerceApi = createApiInstance(API_ENDPOINTS.ECOMMERCE);
export const kitchenApi = createApiInstance(API_ENDPOINTS.KITCHEN);
export const deliveryApi = createApiInstance(API_ENDPOINTS.DELIVERY);
export const adminApi = createApiInstance(API_ENDPOINTS.ADMIN);
```

### `api/interceptors.ts`

```typescript
import { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'react-hot-toast'; // o tu librería de notificaciones

export const setupInterceptors = (apiInstance: AxiosInstance) => {
  // Request interceptor - Agregar token
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log en desarrollo
      if (import.meta.env.DEV) {
        console.log(`🔵 ${config.method?.toUpperCase()} ${config.url}`, config.data);
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Manejar errores
  apiInstance.interceptors.response.use(
    (response) => {
      // Log en desarrollo
      if (import.meta.env.DEV) {
        console.log(`🟢 Response from ${response.config.url}`, response.data);
      }
      return response;
    },
    (error: AxiosError) => {
      if (import.meta.env.DEV) {
        console.error(`🔴 Error from ${error.config?.url}`, error.response?.data);
      }

      // Manejar diferentes tipos de errores
      if (error.response) {
        const status = error.response.status;
        
        switch (status) {
          case 401:
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            window.location.href = '/login';
            break;
          
          case 403:
            toast.error('No tienes permisos para realizar esta acción.');
            break;
          
          case 404:
            toast.error('Recurso no encontrado.');
            break;
          
          case 409:
            toast.error('Conflicto: ' + (error.response.data as any)?.message);
            break;
          
          case 500:
            toast.error('Error del servidor. Por favor, intenta más tarde.');
            break;
          
          default:
            toast.error((error.response.data as any)?.message || 'Ocurrió un error.');
        }
      } else if (error.request) {
        // Request fue enviado pero no hubo respuesta
        toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        // Algo pasó al configurar el request
        toast.error('Error inesperado. Por favor, intenta nuevamente.');
      }
      
      return Promise.reject(error);
    }
  );
};
```

---

## 📝 Tipos TypeScript

### `types/api.types.ts`

```typescript
// ===== Usuario =====
export interface User {
  userId: string;
  email: string;
  name: string;
  role: 'customer' | 'cook' | 'driver' | 'admin';
  phone?: string;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

// ===== Productos =====
export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  preparationTime: number;
}

export interface ProductsResponse {
  products: Product[];
  count?: number;
}

// ===== Carrito =====
export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  imageUrl?: string;
}

export interface Cart {
  cartId: string;
  userId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  notes?: string;
}

// ===== Órdenes =====
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'in_transit' 
  | 'delivered' 
  | 'cancelled';

export interface DeliveryAddress {
  street: string;
  district: string;
  city: string;
  reference?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'cash' | 'card' | 'yape';
  notes?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  timeline?: {
    status: OrderStatus;
    timestamp: string;
  }[];
}

export interface CheckoutRequest {
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'cash' | 'card' | 'yape';
  notes?: string;
}

export interface OrderResponse {
  message: string;
  order: Order;
}

export interface OrdersResponse {
  orders: Order[];
}

// ===== WebSocket =====
export type WebSocketEventType = 
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'DELIVERY_LOCATION_UPDATE'
  | 'NOTIFICATION';

export interface WebSocketMessage {
  type: WebSocketEventType;
  order?: Order;
  location?: {
    lat: number;
    lng: number;
  };
  message?: string;
  priority?: 'low' | 'medium' | 'high';
  timestamp: string;
}

// ===== Dashboard Admin =====
export interface DashboardData {
  summary: {
    totalOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
    completedToday: number;
    revenue: {
      today: number;
      week: number;
      month: number;
    };
  };
  recentOrders: Order[];
  activeDrivers: number;
  activeCooks: number;
}
```

---

## 🔐 Servicio de Autenticación

### `api/services/authService.ts`

```typescript
import { ecommerceApi } from '../config';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User 
} from '../../types/api.types';

class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await ecommerceApi.post<AuthResponse>('/auth/register', data);
    
    if (response.data.token) {
      this.saveToken(response.data.token);
      this.saveUser(response.data.user);
    }
    
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await ecommerceApi.post<AuthResponse>('/auth/login', data);
    
    if (response.data.token) {
      this.saveToken(response.data.token);
      this.saveUser(response.data.user);
    }
    
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: User['role']): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}

export const authService = new AuthService();
```

---

## 🛒 Servicio de Productos y Carrito

### `api/services/productService.ts`

```typescript
import { ecommerceApi } from '../config';
import { Product, ProductsResponse } from '../../types/api.types';

class ProductService {
  async getAllProducts(): Promise<Product[]> {
    const response = await ecommerceApi.get<ProductsResponse>('/products');
    return response.data.products;
  }

  async getProductById(productId: string): Promise<Product> {
    const response = await ecommerceApi.get<Product>(`/products/${productId}`);
    return response.data;
  }

  async searchProducts(query: string, category?: string): Promise<Product[]> {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category);
    
    const response = await ecommerceApi.get<ProductsResponse>(
      `/products/search?${params}`
    );
    return response.data.products;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await ecommerceApi.get<ProductsResponse>(
      `/products?category=${category}`
    );
    return response.data.products;
  }
}

export const productService = new ProductService();
```

### `api/services/cartService.ts`

```typescript
import { ecommerceApi } from '../config';
import { Cart, AddToCartRequest } from '../../types/api.types';

class CartService {
  async getCart(): Promise<Cart> {
    const response = await ecommerceApi.get<Cart>('/cart');
    return response.data;
  }

  async addItem(data: AddToCartRequest): Promise<Cart> {
    const response = await ecommerceApi.post<{ cart: Cart }>('/cart/items', data);
    return response.data.cart;
  }

  async updateItem(productId: string, quantity: number): Promise<Cart> {
    const response = await ecommerceApi.put<{ cart: Cart }>(
      `/cart/items/${productId}`,
      { quantity }
    );
    return response.data.cart;
  }

  async removeItem(productId: string): Promise<void> {
    await ecommerceApi.delete(`/cart/items/${productId}`);
  }

  async clearCart(): Promise<void> {
    await ecommerceApi.delete('/cart');
  }
}

export const cartService = new CartService();
```

---

## 📦 Servicio de Órdenes

### `api/services/orderService.ts`

```typescript
import { ecommerceApi } from '../config';
import { 
  Order, 
  OrderResponse, 
  OrdersResponse, 
  CheckoutRequest 
} from '../../types/api.types';

class OrderService {
  async createOrder(data: CheckoutRequest): Promise<Order> {
    const response = await ecommerceApi.post<OrderResponse>(
      '/orders/checkout',
      data
    );
    return response.data.order;
  }

  async getMyOrders(): Promise<Order[]> {
    const response = await ecommerceApi.get<OrdersResponse>('/orders');
    return response.data.orders;
  }

  async getOrderById(orderId: string): Promise<Order> {
    const response = await ecommerceApi.get<Order>(`/orders/${orderId}`);
    return response.data;
  }

  async cancelOrder(orderId: string): Promise<void> {
    await ecommerceApi.delete(`/orders/${orderId}`);
  }

  // Polling para actualizar estado de orden (si no usas WebSocket)
  async pollOrderStatus(
    orderId: string,
    callback: (order: Order) => void,
    interval: number = 5000
  ): () => void {
    const intervalId = setInterval(async () => {
      try {
        const order = await this.getOrderById(orderId);
        callback(order);
      } catch (error) {
        console.error('Error polling order status:', error);
      }
    }, interval);

    // Retornar función para detener el polling
    return () => clearInterval(intervalId);
  }
}

export const orderService = new OrderService();
```

---

## 🪝 React Hooks Personalizados

### `hooks/useAuth.ts`

```typescript
import { useState, useEffect } from 'react';
import { authService } from '../api/services/authService';
import { User, LoginRequest, RegisterRequest } from '../types/api.types';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsAuthenticated(!!currentUser);
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(data);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('¡Bienvenido de vuelta!');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('¡Cuenta creada exitosamente!');
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrarse');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
};
```

### `hooks/useCart.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { cartService } from '../api/services/cartService';
import { Cart, AddToCartRequest } from '../types/api.types';
import { toast } from 'react-hot-toast';

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error fetching cart:', error);
      }
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (data: AddToCartRequest) => {
    try {
      const updatedCart = await cartService.addItem(data);
      setCart(updatedCart);
      toast.success('Producto agregado al carrito');
    } catch (error) {
      toast.error('Error al agregar producto');
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await cartService.updateItem(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      toast.error('Error al actualizar cantidad');
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await cartService.removeItem(productId);
      await fetchCart();
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      toast.error('Error al eliminar producto');
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
      toast.success('Carrito vaciado');
    } catch (error) {
      toast.error('Error al vaciar carrito');
      throw error;
    }
  };

  return {
    cart,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };
};
```

### `hooks/useWebSocket.ts`

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../api/config';
import { authService } from '../api/services/authService';
import { WebSocketMessage } from '../types/api.types';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    const token = authService.getToken();
    if (!token) {
      console.warn('No token available for WebSocket connection');
      return;
    }

    try {
      const ws = new WebSocket(API_ENDPOINTS.WEBSOCKET);

      ws.onopen = () => {
        console.log('🟢 WebSocket connected');
        setIsConnected(true);
        
        // Autenticar la conexión
        ws.send(JSON.stringify({
          action: 'authenticate',
          token: `Bearer ${token}`
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message:', data);
          setMessages(prev => [...prev, data]);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('🔴 WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('🔴 WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Reconectar después de 3 segundos
        if (authService.isAuthenticated()) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }, [isConnected]);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    messages,
    sendMessage,
    connect,
    disconnect,
  };
};
```

---

## 🎯 Componentes de Ejemplo

### Componente de Login

```tsx
// components/Auth/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
      navigate('/'); // Redirigir a home después del login
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};
```

### Componente de Carrito

```tsx
// components/Cart/CartWidget.tsx
import React from 'react';
import { useCart } from '../../hooks/useCart';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export const CartWidget: React.FC = () => {
  const { cart, isLoading } = useCart();

  if (isLoading) return null;

  const itemCount = cart?.itemCount || 0;

  return (
    <div className="relative">
      <ShoppingCartIcon className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </div>
  );
};
```

### Componente de Producto

```tsx
// components/Products/ProductCard.tsx
import React from 'react';
import { Product } from '../../types/api.types';
import { useCart } from '../../hooks/useCart';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart({
        productId: product.productId,
        quantity,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1">{product.description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold">S/ {product.price.toFixed(2)}</span>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-16 px-2 py-1 border rounded"
            />
            
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !product.available}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isAdding ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔔 Sistema de Notificaciones en Tiempo Real

```tsx
// components/Notifications/OrderNotifications.tsx
import React, { useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { toast } from 'react-hot-toast';

export const OrderNotifications: React.FC = () => {
  const { messages, isConnected } = useWebSocket();

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) return;

    switch (latestMessage.type) {
      case 'ORDER_STATUS_CHANGED':
        const status = latestMessage.order?.status;
        const statusMessages: Record<string, string> = {
          confirmed: '✅ Tu orden ha sido confirmada',
          preparing: '👨‍🍳 Tu orden está siendo preparada',
          ready: '🎉 ¡Tu orden está lista!',
          in_transit: '🚚 Tu orden está en camino',
          delivered: '✅ ¡Tu orden ha sido entregada!',
        };
        
        if (status && statusMessages[status]) {
          toast.success(statusMessages[status]);
        }
        break;

      case 'DELIVERY_LOCATION_UPDATE':
        // Actualizar mapa con ubicación del repartidor
        console.log('Driver location:', latestMessage.location);
        break;

      case 'NOTIFICATION':
        if (latestMessage.priority === 'high') {
          toast.error(latestMessage.message || '');
        } else {
          toast(latestMessage.message || '');
        }
        break;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <span className={`h-2 w-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm">
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>
    </div>
  );
};
```

---

## ✅ Checklist de Implementación

```markdown
### Setup Inicial
- [ ] Instalar dependencias: `npm install axios react-hot-toast`
- [ ] Crear archivo `.env` con las URLs de API
- [ ] Configurar estructura de carpetas

### Configuración de API
- [ ] Crear `api/config.ts` con las instancias de Axios
- [ ] Implementar `api/interceptors.ts`
- [ ] Aplicar interceptors a todas las instancias

### Servicios
- [ ] Implementar `authService.ts`
- [ ] Implementar `productService.ts`
- [ ] Implementar `cartService.ts`
- [ ] Implementar `orderService.ts`

### Hooks
- [ ] Implementar `useAuth` hook
- [ ] Implementar `useCart` hook
- [ ] Implementar `useWebSocket` hook

### Componentes
- [ ] Crear componente de Login
- [ ] Crear componente de Registro
- [ ] Crear lista de productos
- [ ] Crear carrito de compras
- [ ] Crear checkout
- [ ] Crear tracking de órdenes

### Testing
- [ ] Probar flujo de autenticación
- [ ] Probar agregar productos al carrito
- [ ] Probar proceso de checkout
- [ ] Verificar notificaciones en tiempo real

### Producción
- [ ] Verificar variables de entorno
- [ ] Testear en diferentes navegadores
- [ ] Optimizar bundle size
- [ ] Configurar error tracking
```

---

**Última actualización**: 2 de Diciembre, 2025  
**Versión**: 1.0
