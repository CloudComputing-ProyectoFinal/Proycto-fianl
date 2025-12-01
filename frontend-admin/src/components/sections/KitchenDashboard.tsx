import { useState, useEffect } from 'react';
import { ChefHat, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import kitchenService from '../../services/kitchen';
import type { KitchenOrder } from '../../services/kitchen';

export function KitchenDashboard() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const tenantId = profile?.tenantId || profile?.tenant_id || '';

  useEffect(() => {
    loadMyOrders();
    // Recargar cada 30 segundos
    const interval = setInterval(loadMyOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMyOrders = async () => {
    try {
      const res = await kitchenService.getMyOrders();
      setOrders(res?.data?.orders || []);
    } catch (err) {
      console.error('loadMyOrders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPreparing = async (orderId: string) => {
    try {
      await kitchenService.updateOrderStatus(orderId, {
        status: 'PREPARING',
        tenantId,
      });
      alert('Orden marcada como "Preparando"');
      loadMyOrders();
    } catch (err) {
      console.error('handleStartPreparing error:', err);
      alert(`Error: ${err}`);
    }
  };

  const handleStartCooking = async (orderId: string) => {
    try {
      await kitchenService.updateOrderStatus(orderId, {
        status: 'COOKING',
        tenantId,
      });
      alert('Orden marcada como "Cocinando"');
      loadMyOrders();
    } catch (err) {
      console.error('handleStartCooking error:', err);
      alert(`Error: ${err}`);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await kitchenService.markOrderReady(orderId, {
        tenantId,
      });
      alert('Orden marcada como "Lista para entregar"');
      loadMyOrders();
    } catch (err) {
      console.error('handleMarkReady error:', err);
      alert(`Error: ${err}`);
    }
  };

  const assignedOrders = orders.filter(o => o.status === 'ASSIGNED');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const cookingOrders = orders.filter(o => o.status === 'COOKING');
  const readyOrders = orders.filter(o => o.status === 'READY');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-200 rounded-full animate-spin border-t-orange-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-orange-600 rounded-full animate-pulse opacity-20"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 animate-pulse">Cargando órdenes</p>
          <p className="text-sm text-gray-500 mt-1">Obteniendo tus órdenes asignadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Panel de Cocina - Cocinero</h2>
          <ChefHat className="text-orange-600" size={32} />
        </div>
        <p className="text-gray-600">
          Bienvenido, <strong>{profile?.firstName || 'Cocinero'}</strong> - Tus órdenes asignadas
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Total de órdenes activas: {orders.length}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Asignadas */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-blue-600" />
            Asignadas ({assignedOrders.length})
          </h3>
          <div className="space-y-4">
            {assignedOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">Sin órdenes</p>
              </div>
            ) : (
              assignedOrders.map((order) => (
                <div key={order.orderId} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    #{order.orderId.replace('ORDER#', '')}
                  </h4>
                  <div className="text-xs text-gray-600 mb-2">
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.quantity}x {item.name}</div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(order.createdAt).toLocaleTimeString('es-PE')}
                  </p>
                  <button
                    onClick={() => handleStartPreparing(order.orderId)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 text-sm"
                  >
                    Iniciar Preparación
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Preparando */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-yellow-600" />
            Preparando ({preparingOrders.length})
          </h3>
          <div className="space-y-4">
            {preparingOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">Sin órdenes</p>
              </div>
            ) : (
              preparingOrders.map((order) => (
                <div key={order.orderId} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    #{order.orderId.replace('ORDER#', '')}
                  </h4>
                  <div className="text-xs text-gray-600 mb-2">
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.quantity}x {item.name}</div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(order.createdAt).toLocaleTimeString('es-PE')}
                  </p>
                  <button
                    onClick={() => handleStartCooking(order.orderId)}
                    className="w-full bg-yellow-600 text-white py-2 rounded-lg font-medium hover:bg-yellow-700 text-sm"
                  >
                    Empezar a Cocinar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cocinando */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ChefHat size={20} className="mr-2 text-orange-600" />
            Cocinando ({cookingOrders.length})
          </h3>
          <div className="space-y-4">
            {cookingOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">Sin órdenes</p>
              </div>
            ) : (
              cookingOrders.map((order) => (
                <div key={order.orderId} className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    #{order.orderId.replace('ORDER#', '')}
                  </h4>
                  <div className="text-xs text-gray-600 mb-2">
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.quantity}x {item.name}</div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(order.createdAt).toLocaleTimeString('es-PE')}
                  </p>
                  <button
                    onClick={() => handleMarkReady(order.orderId)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 text-sm"
                  >
                    Marcar como Listo
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Listas */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ChefHat size={20} className="mr-2 text-green-600" />
            Listas ({readyOrders.length})
          </h3>
          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">Sin órdenes</p>
              </div>
            ) : (
              readyOrders.map((order) => (
                <div key={order.orderId} className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    #{order.orderId.replace('ORDER#', '')}
                  </h4>
                  <div className="text-xs text-gray-600 mb-2">
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.quantity}x {item.name}</div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(order.createdAt).toLocaleTimeString('es-PE')}
                  </p>
                  <div className="bg-green-100 text-green-800 py-2 px-3 rounded text-center font-medium text-sm">
                    ✓ Lista para entregar
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
