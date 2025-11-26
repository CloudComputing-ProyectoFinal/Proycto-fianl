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
      // Crear notificación toast
      const notification: ToastNotification = {
        id: `${Date.now()}-${Math.random()}`,
        message: message.message,
        orderId: message.orderId,
        status: message.status,
        timestamp: message.timestamp,
      };

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
            {toast.message}
          </p>
          <p className="text-xs text-gray-600">
            Pedido #{toast.orderId.substring(0, 8)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(toast.timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
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
