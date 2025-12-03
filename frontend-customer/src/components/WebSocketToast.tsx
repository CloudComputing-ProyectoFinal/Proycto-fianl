import { useEffect, useState } from 'react';
import { Bell, CheckCircle, ChefHat, Package, Truck, X } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

interface ToastNotification {
  id: string;
  message: string;
  orderId: string;
  status: string;
  timestamp: string;
}

export function WebSocketToast() {
  const [toast, setToast] = useState<ToastNotification | null>(null);

  useWebSocket({
    onMessage: (message) => {
      // Ignorar mensajes de conexión
      if (message.type === 'CONNECTION_STATUS') {
        return;
      }

      // Extraer datos del mensaje (puede venir en message.data o directamente)
      const data = message.data || message;

      // Validar que tengamos los campos necesarios
      const orderId = data.orderId || message.orderId || '';
      const status = data.newStatus || data.status || message.status || '';
      const msg = data.message || message.message || '';
      const timestamp = data.timestamp || message.timestamp || new Date().toISOString();

      // Solo mostrar toast si hay orderId válido
      if (!orderId) {
        console.log('🔔 Toast: Mensaje sin orderId ignorado');
        return;
      }

      // Ignorar mensajes de error
      if (
        !status ||
        status === 'UNKNOWN' ||
        msg.toLowerCase().includes('forbidden') ||
        msg.toLowerCase().includes('error') ||
        msg.toLowerCase().includes('unauthorized')
      ) {
        console.log('🔔 Toast: Mensaje de error ignorado:', msg);
        return;
      }

      const notification: ToastNotification = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: msg || 'Actualización de pedido',
        orderId: orderId,
        status: status,
        timestamp: timestamp,
      };

      console.log('🔔 Toast: Mostrando notificación', notification);
      setToast(notification);

      // Auto-ocultar después de 8 segundos
      setTimeout(() => {
        setToast(null);
      }, 8000);
    },
    autoConnect: true,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED':
        return <Bell className="text-blue-500" size={24} />;
      case 'COOKING':
        return <ChefHat className="text-orange-500" size={24} />;
      case 'READY':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'PACKAGED':
        return <Package className="text-purple-500" size={24} />;
      case 'ON_THE_WAY':
        return <Truck className="text-yellow-500" size={24} />;
      case 'DELIVERED':
        return <CheckCircle className="text-green-600" size={24} />;
      default:
        return <Bell className="text-gray-500" size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'border-blue-500 bg-blue-50';
      case 'COOKING':
        return 'border-orange-500 bg-orange-50';
      case 'READY':
        return 'border-green-500 bg-green-50';
      case 'PACKAGED':
        return 'border-purple-500 bg-purple-50';
      case 'ON_THE_WAY':
        return 'border-yellow-500 bg-yellow-50';
      case 'DELIVERED':
        return 'border-green-600 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  if (!toast) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-slide-up">
      <div
        className={`${getStatusColor(
          toast.status
        )} border-l-4 rounded-lg shadow-2xl p-4 max-w-md flex items-start gap-3 bg-white`}
      >
        <div className="flex-shrink-0 mt-1">
          {getStatusIcon(toast.status)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {toast.message || 'Actualización de pedido'}
          </p>
          <p className="text-xs text-gray-600">
            Pedido #{toast.orderId ? toast.orderId.substring(0, 8) : 'N/A'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {toast.timestamp
              ? new Date(toast.timestamp).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : new Date().toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
            }
          </p>
        </div>

        <button
          onClick={() => setToast(null)}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label="Cerrar notificación"
        >
          <X size={18} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
