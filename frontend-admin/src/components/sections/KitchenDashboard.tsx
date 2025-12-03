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
  const isAdmin = profile?.role === 'ADMIN';

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

  // Solo filtrar CREATED y PREPARING
  const createdOrders = allOrders.filter(o => o.status === 'CREATED');
  const preparingOrders = allOrders.filter(o => o.status === 'PREPARING');

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
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-2xl p-8 text-white border-4 border-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl">
                <ChefHat size={40} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight uppercase">TGI COCINA</h2>
                <p className="text-red-100 font-semibold">Panel de Control Chef</p>
              </div>
            </div>
            <button 
              onClick={loadAllData}
              className="bg-white text-red-600 px-6 py-3 rounded-xl font-black hover:bg-red-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              🔄 ACTUALIZAR
            </button>
          </div>
          <p className="text-white text-lg mb-4">
            Bienvenido, <strong className="text-yellow-300">{profile?.firstName || 'Chef'}</strong> 🔥
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-white/30">
              <div className="text-4xl font-black">{createdOrders.length}</div>
              <div className="text-sm font-semibold text-red-100">🆕 Órdenes Nuevas</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-white/30">
              <div className="text-4xl font-black">{preparingOrders.length}</div>
              <div className="text-sm font-semibold text-red-100">🍳 En Preparación</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NUEVAS ÓRDENES - CREATED */}
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Star size={24} className="text-white" />
            </div>
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
                  className="bg-white border-4 border-red-500 rounded-2xl p-5 shadow-2xl hover:shadow-red-200 transition-all duration-300 hover:scale-105 transform"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-red-600 p-2 rounded-lg">
                        <Sparkles size={16} className="text-white animate-pulse" />
                      </div>
                      <h4 className="font-black text-gray-900 text-base">
                        #{order.orderId.replace('ORDER#', '').slice(0, 8)}
                      </h4>
                    </div>
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-black uppercase">¡NUEVA!</span>
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
                  {isAdmin ? (
                    <div className="w-full bg-gray-100 border-2 border-gray-300 text-gray-600 py-3.5 rounded-xl font-bold uppercase text-sm text-center">
                      👁️ SOLO VISUALIZACIÓN
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcceptOrder(order.orderId)}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-black uppercase text-sm hover:from-red-700 hover:to-red-800 shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 border-2 border-white"
                    >
                      <Star size={18} className="fill-white" />
                      ¡ACEPTAR ORDEN!
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* EN PREPARACIÓN - PREPARING (Solo visualización) */}
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <ChefHat size={24} className="text-white" />
            </div>
            En Preparación ({preparingOrders.length})
          </h3>
          <div className="space-y-4">
            {preparingOrders.length === 0 ? (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-500 font-semibold">No hay órdenes en preparación</p>
              </div>
            ) : (
              preparingOrders.map((order) => (
                <div key={order.orderId} className="bg-white border-4 border-yellow-400 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-gray-900 text-base">
                      #{order.orderId.replace('ORDER#', '')}
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-xs font-bold uppercase">
                      ⏳ PREPARANDO
                    </span>
                  </div>
                  <div className="mb-3 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700">{item.quantity}x {item.name}</span>
                        <span className="text-xs font-bold text-red-600">S/{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t-2 border-yellow-200 pt-3 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-xl font-black text-red-600">S/{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(order.createdAt).toLocaleString('es-PE')}
                  </p>
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg px-4 py-3">
                    <p className="text-yellow-800 text-sm font-bold text-center">
                      🍳 El Chef Ejecutivo marcará como READY
                    </p>
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
