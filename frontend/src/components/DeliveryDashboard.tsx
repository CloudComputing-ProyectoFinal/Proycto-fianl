import { useState } from 'react';
import { Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  status: string;
  total_amount: number;
  created_at: string;
}

export function DeliveryDashboard() {
  const { user } = useAuth();
  const [orders] = useState<Order[]>([]);
  const [loading] = useState(false);

  // TODO: Integrar con GET /delivery/orders del backend AWS Lambda
  const handleMarkReady = async (orderId: string) => {
    // TODO: PUT a /delivery/orders/{id}/package del backend AWS Lambda
    console.log('Mark order as packaged:', orderId);
    alert('Orden marcada como "Empaquetado" (demo mode)');
  };

  const handleStartDelivery = async (orderId: string) => {
    // TODO: PUT a /delivery/orders/{id}/dispatch del backend AWS Lambda
    console.log('Start delivery:', orderId);
    alert('Orden marcada como "En camino" (demo mode)');
  };

  const handleMarkDelivered = async (orderId: string) => {
    // TODO: PUT a /delivery/orders/{id}/deliver del backend AWS Lambda
    console.log('Mark order as delivered:', orderId);
    alert('Orden marcada como "Entregado" (demo mode)');
  };

  const readyOrders = orders.filter(o => o.status === 'ready');
  const onTheWayOrders = orders.filter(o => o.status === 'on_the_way');
  const packagingOrders = orders.filter(o => o.status === 'packaging');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Panel de Delivery</h2>
          <Truck className="text-blue-600" size={32} />
        </div>
        <p className="text-gray-600">
          Bienvenido, <strong>{user?.nombre || 'Repartidor'}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Listos para empaquetar */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Package size={20} className="mr-2 text-green-600" />
            Listos ({readyOrders.length})
          </h3>
          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">No hay órdenes listas</p>
              </div>
            ) : (
              readyOrders.map((order) => (
                <div key={order.id} className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900">#{order.order_number}</h4>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  {order.customer_address && (
                    <div className="flex items-start space-x-1 mt-2">
                      <MapPin size={16} className="text-gray-500 mt-0.5" />
                      <span className="text-xs text-gray-600">{order.customer_address}</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleMarkReady(order.id)}
                    className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Empaquetar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Empaquetando */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Package size={20} className="mr-2 text-blue-600" />
            Empaquetando ({packagingOrders.length})
          </h3>
          <div className="space-y-4">
            {packagingOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">No hay órdenes empaquetándose</p>
              </div>
            ) : (
              packagingOrders.map((order) => (
                <div key={order.id} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900">#{order.order_number}</h4>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  {order.customer_address && (
                    <div className="flex items-start space-x-1 mt-2">
                      <MapPin size={16} className="text-gray-500 mt-0.5" />
                      <span className="text-xs text-gray-600">{order.customer_address}</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleStartDelivery(order.id)}
                    className="w-full mt-3 bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700"
                  >
                    Iniciar Entrega
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* En camino */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Truck size={20} className="mr-2 text-orange-600" />
            En Camino ({onTheWayOrders.length})
          </h3>
          <div className="space-y-4">
            {onTheWayOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">No hay órdenes en camino</p>
              </div>
            ) : (
              onTheWayOrders.map((order) => (
                <div key={order.id} className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900">#{order.order_number}</h4>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  {order.customer_address && (
                    <div className="flex items-start space-x-1 mt-2">
                      <MapPin size={16} className="text-gray-500 mt-0.5" />
                      <span className="text-xs text-gray-600">{order.customer_address}</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleMarkDelivered(order.id)}
                    className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle size={20} />
                    <span>Marcar Entregado</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Modo Demo:</strong> Las órdenes se cargarán desde el backend AWS Lambda.
          Endpoint: <code className="bg-blue-100 px-2 py-1 rounded">GET /delivery/orders</code>
        </p>
      </div>
    </div>
  );
}
