import { useState, useEffect } from 'react';
import { ChefHat, Clock, Star, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import kitchenService from '../../services/kitchen';
import type { KitchenOrder } from '../../services/kitchen';

export function KitchenDashboard() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [allOrders, setAllOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const tenantId = profile?.tenantId || profile?.tenant_id || '';

  useEffect(() => {
    loadAllData();
    // Recargar cada 30 segundos
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      console.log('🔥 [KitchenDashboard] Iniciando loadAllData...');
      
      // SOLO cargar todas las órdenes y filtrar por status
      console.log('📞 [KitchenDashboard] Llamando a getAllOrders()...');
      const allRes = await kitchenService.getAllOrders();
      console.log('✅ [KitchenDashboard] getAllOrders response:', allRes);
      console.log('🔍 [KitchenDashboard] allRes.data:', allRes?.data);
      console.log('🔍 [KitchenDashboard] allRes.data.orders:', allRes?.data?.orders);
      
      const allOrders = allRes?.data?.orders || [];
      
      // Filtrar por cada status
      const createdOrders = allOrders.filter(o => o.status === 'CREATED');
      const assignedOrders = allOrders.filter(o => o.status === 'ASSIGNED');
      const preparingOrders = allOrders.filter(o => o.status === 'PREPARING');
      const cookingOrders = allOrders.filter(o => o.status === 'COOKING');
      const readyOrders = allOrders.filter(o => o.status === 'READY');
      
      console.log('📊 [KitchenDashboard] CREATED:', createdOrders.length);
      console.log('📊 [KitchenDashboard] ASSIGNED:', assignedOrders.length);
      console.log('📊 [KitchenDashboard] PREPARING:', preparingOrders.length);
      console.log('📊 [KitchenDashboard] COOKING:', cookingOrders.length);
      console.log('📊 [KitchenDashboard] READY:', readyOrders.length);
      
      // Guardar órdenes CREATED en allOrders
      setAllOrders(createdOrders);
      // Guardar el resto en orders para las columnas de trabajo
      setOrders([...assignedOrders, ...preparingOrders, ...cookingOrders, ...readyOrders]);
      
    } catch (err) {
      console.error('❌ [KitchenDashboard] loadAllData error:', err);
      console.error('❌ [KitchenDashboard] Error details:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await kitchenService.acceptOrder(orderId);
      alert('✅ Orden aceptada y marcada como PREPARING');
      loadAllData();
    } catch (err) {
      console.error('handleAcceptOrder error:', err);
      alert(`❌ Error al aceptar orden: ${err}`);
    }
  };

  const handleStartPreparing = async (orderId: string) => {
    try {
      await kitchenService.updateOrderStatus(orderId, {
        status: 'PREPARING',
        tenantId,
      });
      alert('Orden marcada como "Preparando"');
      loadAllData();
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
      loadAllData();
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
      loadAllData();
    } catch (err) {
      console.error('handleMarkReady error:', err);
      alert(`Error: ${err}`);
    }
  };

  // CREATED orders from getAllOrders (filtered)
  const createdOrders = allOrders;
  // My assigned orders from getMyOrders
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
      <div className="bg-gradient-to-r from-purple-600 via-orange-500 to-red-500 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="animate-pulse" size={32} />
            Panel de Cocina Elite
          </h2>
          <ChefHat className="animate-bounce" size={40} />
        </div>
        <p className="text-white/90">
          Bienvenido, <strong className="text-yellow-300">{profile?.firstName || 'Chef'}</strong> 🔥
        </p>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur">
            🆕 Nuevas: {createdOrders.length}
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur">
            📋 Asignadas: {assignedOrders.length}
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur">
            🍳 En proceso: {preparingOrders.length + cookingOrders.length}
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur">
            ✅ Listas: {readyOrders.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* NUEVAS ÓRDENES - CREATED */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Star size={20} className="mr-2 text-purple-600 animate-pulse" />
            Nuevas Órdenes ({createdOrders.length})
          </h3>
          <div className="space-y-4">
            {createdOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">Sin órdenes nuevas</p>
              </div>
            ) : (
              createdOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">
                      #{order.orderId.replace('ORDER#', '').slice(0, 8)}
                    </h4>
                    <Sparkles size={16} className="text-purple-600 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="text-xs text-gray-600 mb-2 space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-semibold">S/{item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-purple-200 pt-2 mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-bold text-purple-700">S/{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(order.createdAt).toLocaleString('es-PE')}
                  </p>
                  <button
                    onClick={() => handleAcceptOrder(order.orderId)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 text-sm shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Star size={16} className="animate-pulse" />
                    Aceptar Orden
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

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
