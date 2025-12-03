/**
 * Servicio de WebSocket - Notificaciones en tiempo real
 * Conexión automática con manejo de reconexión
 *
 * URL: wss://m4mwqz1lm5.execute-api.us-east-1.amazonaws.com/dev
 *
 * Formato del backend (handleOrderStatusChange.js):
 * {
 *   type: 'ORDER_STATUS_UPDATE',
 *   data: {
 *     orderId, previousStatus, newStatus, timestamp, message,
 *     driverLocation, updatedBy
 *   }
 * }
 */

import API_ENDPOINTS from '../config/api-endpoints';

export type NotificationType =
  | 'ORDER_STATUS_UPDATE'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_LOCATION_UPDATE'
  | 'ORDER_DELIVERED'
  | 'ORDER_READY'
  | 'ORDER_CANCELLED'
  | 'CONNECTION_STATUS';

// Datos dentro del campo 'data' del mensaje del backend
export interface OrderStatusData {
  orderId: string;
  previousStatus?: string;
  newStatus: string;
  status?: string; // Alternativa a newStatus
  timestamp?: string;
  message?: string;
  driverLocation?: {
    lat: number;
    lng: number;
  } | null;
  updatedBy?: {
    role: string;
    email: string;
  } | null;
}

export interface WebSocketNotification {
  type: NotificationType;
  // El backend envía los datos en 'data'
  data?: OrderStatusData;
  // Campos normalizados para uso en componentes
  orderId?: string;
  status?: string;
  message?: string;
  timestamp?: string;
  driver?: {
    name: string;
    phone: string;
    vehicleType: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  estimatedTime?: string;
}

export type NotificationHandler = (notification: WebSocketNotification) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 3000;
  private handlers: Set<NotificationHandler> = new Set();
  private token: string | null = null;
  private isConnecting = false;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    console.log('🔌 WebSocketService inicializado');
  }

  /**
   * Conectar al WebSocket con token de autenticación
   */
  connect(token: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('🔌 WebSocket ya está conectado');
      return;
    }

    if (this.isConnecting) {
      console.log('🔌 WebSocket ya está conectándose...');
      return;
    }

    this.token = token;
    this.isConnecting = true;

    try {
      const wsUrl = `${API_ENDPOINTS.WEBSOCKET}?token=${encodeURIComponent(token)}`;
      console.log('🔌 Conectando a WebSocket:', API_ENDPOINTS.WEBSOCKET);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket conectado exitosamente');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPing();

        this.notifyHandlers({
          type: 'CONNECTION_STATUS',
          message: 'Conectado a notificaciones en tiempo real',
          timestamp: new Date().toISOString(),
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          console.log('📨 Mensaje WebSocket recibido:', raw);

          const notification = this.normalizeNotification(raw);
          console.log('📨 Notificación normalizada:', notification);

          this.notifyHandlers(notification);
        } catch (error) {
          console.error('❌ Error parseando notificación:', error, event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error WebSocket:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket desconectado. Code:', event.code);
        this.isConnecting = false;
        this.ws = null;
        this.stopPing();

        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts && this.token) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('❌ Error creando WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.token) return;

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), 30000);

    console.log(`🔄 Reintentando conexión en ${Math.round(delay / 1000)}s (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.token && !this.isConnected()) {
        this.connect(this.token);
      }
    }, delay);
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ action: 'ping' }));
        } catch (e) {
          console.warn('⚠️ Error enviando ping:', e);
        }
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private normalizeNotification(raw: any): WebSocketNotification {
    const data = raw.data || {};

    return {
      type: raw.type || 'ORDER_STATUS_UPDATE',
      data: raw.data,
      orderId: data.orderId || raw.orderId,
      status: data.newStatus || data.status || raw.newStatus || raw.status,
      message: data.message || raw.message,
      timestamp: data.timestamp || raw.timestamp || new Date().toISOString(),
      location: data.driverLocation || raw.driverLocation || raw.location,
    };
  }

  private notifyHandlers(notification: WebSocketNotification): void {
    console.log(`📨 Notificando a ${this.handlers.size} handlers`);

    this.handlers.forEach((handler) => {
      try {
        handler(notification);
      } catch (error) {
        console.error('❌ Error en handler de notificación:', error);
      }
    });
  }

  disconnect(): void {
    console.log('🔌 Desconectando WebSocket...');
    this.stopPing();
    this.reconnectAttempts = this.maxReconnectAttempts;

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.token = null;
    this.isConnecting = false;
  }

  onNotification(handler: NotificationHandler): () => void {
    this.handlers.add(handler);
    console.log(`🔌 Handler registrado. Total handlers: ${this.handlers.size}`);

    return () => {
      this.handlers.delete(handler);
      console.log(`🔌 Handler eliminado. Total handlers: ${this.handlers.size}`);
    };
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ WebSocket no está conectado. Estado:', this.getConnectionState());
    }
  }

  simulateNotification(rawMessage: any): void {
    console.log('📨 Simulando notificación local:', rawMessage);
    console.log('📨 Handlers registrados:', this.handlers.size);

    const notification = this.normalizeNotification(rawMessage);
    console.log('📨 Notificación normalizada a enviar:', notification);

    this.notifyHandlers(notification);
  }

  reconnect(): void {
    if (this.token) {
      const savedToken = this.token;
      this.disconnect();
      this.reconnectAttempts = 0;
      setTimeout(() => {
        this.connect(savedToken);
      }, 1000);
    }
  }
}

const webSocketService = new WebSocketService();

export default webSocketService;
