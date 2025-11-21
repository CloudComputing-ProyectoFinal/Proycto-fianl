import { useState } from 'react';
import { ChefHat, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Order {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
}

export function KitchenDashboard() {
  const { user } = useAuth();
  const [orders] = useState<Order[]>([]);
  const [loading] = useState(false);

  // TODO: Integrar con GET /kitchen/orders del backend AWS Lambda
  const handleStartCooking = async (orderId: string) => {
    // TODO: PUT a /kitchen/orders/{id}/start del backend AWS Lambda
    console.log('Start cooking order:', orderId);
    alert('Orden marcada como "En preparación" (demo mode)');
  };

  const handleMarkReady = async (orderId: string) => {
    // TODO: PUT a /kitchen/orders/{id}/ready del backend AWS Lambda
    console.log('Mark order as ready:', orderId);
    alert('Orden marcada como "Lista" (demo mode)');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const cookingOrders = orders.filter(o => o.status === 'cooking');
  const readyOrders = orders.filter(o => o.status === 'ready');

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
          <h2 className="text-2xl font-bold text-gray-900">Panel de Cocina</h2>
          <ChefHat className="text-orange-600" size={32} />
        </div>
        <p className="text-gray-600">
          Bienvenido, <strong>{user?.nombre || 'Cocinero'}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pendientes */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-yellow-600" />
            Pendientes ({pendingOrders.length})
          </h3>
          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">No hay órdenes pendientes</p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900">#{order.order_number}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                  <button
                    onClick={() => handleStartCooking(order.id)}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700"
                  >
                    Iniciar Preparación
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* En preparación */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ChefHat size={20} className="mr-2 text-orange-600" />
            Cocinando ({cookingOrders.length})
          </h3>
          <div className="space-y-4">
            {cookingOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">No hay órdenes en preparación</p>
              </div>
            ) : (
              cookingOrders.map((order) => (
                <div key={order.id} className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900">#{order.order_number}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                  <button
                    onClick={() => handleMarkReady(order.id)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
                  >
                    Marcar como Listo
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Listos */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ChefHat size={20} className="mr-2 text-green-600" />
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
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
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
          Endpoint: <code className="bg-blue-100 px-2 py-1 rounded">GET /kitchen/orders</code>
        </p>
      </div>
    </div>
  );
}
