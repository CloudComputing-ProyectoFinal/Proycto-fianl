import { useState, useEffect } from 'react';
import { Package, CheckCircle2 } from 'lucide-react';
import { getAllOrders, markOrderPacked } from '../../services/packing.ts';

interface Order {
  orderId: string;
  tenantId: string;
  userId: string;
  status: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export function PackingDashboard() {
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      console.log('📦 [PackingDashboard] Cargando órdenes READY...');
      const res = await getAllOrders();
      const allOrders = res?.data?.orders || [];
      
      // Filtrar solo órdenes READY
      const ready = allOrders.filter((o: Order) => o.status === 'READY');
      console.log('✅ [PackingDashboard] Órdenes READY:', ready.length);
      
      setReadyOrders(ready);
    } catch (error) {
      console.error('❌ [PackingDashboard] Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPacked = async (orderId: string) => {
    try {
      console.log('📦 [PackingDashboard] Marcando orden como PACKED:', orderId);
      await markOrderPacked(orderId);
      
      // Mostrar notificación de éxito
      alert('✅ Orden marcada como EMPAQUETADA correctamente');
      
      // Recargar órdenes
      await loadOrders();
      
      console.log('✅ [PackingDashboard] Orden marcada como PACKED');
    } catch (error) {
      console.error('❌ [PackingDashboard] Error marking as packed:', error);
      alert('❌ Error al marcar orden como empaquetada');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl shadow-2xl p-8 text-white border-4 border-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl">
              <Package className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight">EMPAQUETADO</h1>
              <p className="text-red-100 font-semibold">
                🎁 Órdenes listas para empaquetar
              </p>
            </div>
          </div>
          <button
            onClick={loadOrders}
            className="bg-white text-red-600 px-6 py-3 rounded-xl font-black hover:bg-red-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            🔄 ACTUALIZAR
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-bold uppercase">Órdenes Listas</p>
              <p className="text-5xl font-black text-red-600 mt-2">{readyOrders.length}</p>
            </div>
            <div className="bg-red-600 p-4 rounded-xl">
              <Package className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Órdenes READY */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">
          Órdenes para Empaquetar ({readyOrders.length})
        </h2>

        {readyOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay órdenes para empaquetar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-green-400 hover:border-green-600 hover:shadow-green-200 transition-all transform hover:scale-105"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-gray-800 text-lg">
                      #{order.orderId.split('#')[1]?.substring(0, 8) || order.orderId}
                    </span>
                  </div>
                  <span className="px-4 py-2 bg-green-500 text-white rounded-full text-xs font-black uppercase">
                    ✅ LISTA
                  </span>
                </div>

                {/* Customer Info */}
                {order.customerInfo && (
                  <div className="mb-4 pb-4 border-b border-blue-200">
                    <p className="text-sm text-gray-600">Cliente:</p>
                    <p className="font-semibold text-gray-800">
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </p>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 font-medium">Items ({order.items.length}):</p>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-gray-600 font-medium">
                        S/ {item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-4 pt-4 border-t border-blue-200">
                  <span className="text-gray-700 font-semibold">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    S/ {order.total.toFixed(2)}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleMarkPacked(order.orderId)}
                  className="w-full py-4 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-black uppercase text-sm hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-white"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  ¡EMPAQUETADO!
                </button>

                {/* Timestamp */}
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Lista: {new Date(order.updatedAt).toLocaleString('es-PE')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
