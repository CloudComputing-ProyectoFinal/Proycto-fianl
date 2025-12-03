import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCircle, Clock, Package, Truck, ChefHat, X, RefreshCw } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import webSocketService from '../services/websocket';

interface Notification {
  id: string;
  type: string;
  message: string;
  orderId: string;
  status: string;
  timestamp: string;
}

// Mensajes personalizados por estado
const STATUS_MESSAGES: Record<string, string> = {
  'CREATED': '¡Pedido creado! Estamos procesando tu orden.',
  'COOKING': '🍳 Tu pedido está siendo preparado por nuestro chef.',
  'PACKING': '📦 Tu pedido está siendo empacado.',
  'READY': '✅ ¡Tu pedido está listo para entrega!',
  'DELIVERING': '🏍️ ¡Tu pedido está en camino!',
  'DELIVERED': '🎉 ¡Pedido entregado! ¡Buen provecho!',
  'CANCELLED': '❌ Tu pedido ha sido cancelado.',
};

export function WebSocketNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Callback estable para manejar mensajes
  const handleMessage = useCallback((message: any) => {
    console.log('🔔 WebSocketNotifications recibió mensaje:', message);

    // Ignorar mensajes de estado de conexión
    if (message.type === 'CONNECTION_STATUS') {
      console.log('🔔 Mensaje de conexión ignorado');
      return;
    }

    // El mensaje ya viene normalizado desde websocket.ts
    const data = message.data || message;

    // Obtener el orderId - si no hay, ignorar el mensaje
    const orderId = data.orderId || message.orderId || '';
    if (!orderId) {
      console.log('🔔 Mensaje sin orderId ignorado');
      return;
    }

    // Obtener el estado del pedido
    const status = data.newStatus || data.status || message.status || '';

    // Ignorar mensajes de error o sin estado válido
    const messageText = data.message || message.message || '';
    if (
      !status ||
      status === 'UNKNOWN' ||
      messageText.toLowerCase().includes('forbidden') ||
      messageText.toLowerCase().includes('error') ||
      messageText.toLowerCase().includes('unauthorized')
    ) {
      console.log('🔔 Mensaje de error o inválido ignorado:', messageText);
      return;
    }

    // Usar mensaje del backend o mensaje personalizado
    const customMessage = messageText || STATUS_MESSAGES[status] || 'Estado de pedido actualizado';

    const notification: Notification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: message.type || 'ORDER_STATUS_UPDATE',
      message: customMessage,
      orderId: data.orderId || message.orderId || '',
      status: status,
      timestamp: data.timestamp || message.timestamp || new Date().toISOString(),
    };

    console.log('🔔 Notificación procesada:', notification);

    setNotifications(prev => {
      // Evitar duplicados basados en orderId + status + timestamp cercano
      const isDuplicate = prev.some(n =>
        n.orderId === notification.orderId &&
        n.status === notification.status &&
        Math.abs(new Date(n.timestamp).getTime() - new Date(notification.timestamp).getTime()) < 5000
      );

      if (isDuplicate) {
        console.log('🔔 Notificación duplicada ignorada');
        return prev;
      }

      const updated = [notification, ...prev].slice(0, 15);
      console.log('🔔 Notificaciones actualizadas:', updated.length);
      return updated;
    });

    // Mostrar notificación del navegador si está permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('TGI Fridays - Actualización de Pedido', {
          body: notification.message,
          icon: '/logito.png',
          tag: `order-${notification.orderId}-${notification.status}`,
        });
      } catch (e) {
        console.warn('No se pudo mostrar notificación del navegador:', e);
      }
    }
  }, []);

  const { isConnected, connect } = useWebSocket({
    onMessage: handleMessage,
    autoConnect: true,
  });

  // Solicitar permiso de notificaciones
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CREATED':
        return <Bell className="text-blue-500" size={20} />;
      case 'COOKING':
        return <ChefHat className="text-orange-500" size={20} />;
      case 'PACKING':
        return <Package className="text-purple-500" size={20} />;
      case 'READY':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'DELIVERING':
      case 'ON_THE_WAY':
        return <Truck className="text-yellow-500" size={20} />;
      case 'DELIVERED':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'CANCELLED':
        return <X className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CREATED': return 'bg-blue-50 border-blue-200';
      case 'COOKING': return 'bg-orange-50 border-orange-200';
      case 'PACKING': return 'bg-purple-50 border-purple-200';
      case 'READY': return 'bg-green-50 border-green-200';
      case 'DELIVERING':
      case 'ON_THE_WAY': return 'bg-yellow-50 border-yellow-200';
      case 'DELIVERED': return 'bg-green-50 border-green-200';
      case 'CANCELLED': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleReconnect = () => {
    console.log('🔄 Reconectando WebSocket...');
    webSocketService.reconnect();
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        title={isConnected ? 'Notificaciones (Conectado)' : 'Notificaciones (Desconectado)'}
      >
        <Bell size={24} className={isConnected ? 'text-gray-700' : 'text-gray-400'} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
        {!isConnected && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <h3 className="font-bold text-gray-900">Notificaciones</h3>
              <p className="text-xs text-gray-500 mt-1">
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Conectado en tiempo real
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Desconectado
                    <button
                      onClick={handleReconnect}
                      className="ml-2 text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <RefreshCw size={12} /> Reconectar
                    </button>
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No tienes notificaciones</p>
                <p className="text-xs mt-1">Las actualizaciones de tus pedidos aparecerán aquí</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors group relative border-l-4 ${getStatusColor(notification.status)}`}
                  >
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                    >
                      <X size={14} />
                    </button>

                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {getStatusIcon(notification.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {notification.message}
                        </p>
                        {notification.orderId && (
                          <p className="text-xs text-gray-500">
                            Pedido #{notification.orderId.replace('ORDER#', '').substring(0, 8)}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString('es-PE', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setNotifications([])}
                className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium py-1"
              >
                Limpiar todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
