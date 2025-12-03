import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import chefExecutiveService from '../../services/chefExecutive';
import type { KitchenOrder, Chef } from '../../services/chefExecutive';

export function ChefExecutiveDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'chefs'>('orders');
  const [loading, setLoading] = useState(true);
  
  const isAdmin = profile?.role === 'ADMIN';
  
  // Orders state
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  
  // Chefs state
  const [chefs, setChefs] = useState<Chef[]>([]);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'chefs') {
      loadChefs();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log('🔥 [ChefExecutiveDashboard] Loading orders...');
      
      // Obtener todas las órdenes del sistema
      const allOrdersRes = await chefExecutiveService.getAllOrders();
      console.log('✅ [ChefExecutiveDashboard] getAllOrders response:', allOrdersRes);
      
      const allOrders = allOrdersRes?.data?.orders || [];
      
      // Filtrar solo órdenes en estado PREPARING
      const preparingOrders = allOrders.filter((order: KitchenOrder) => order.status === 'PREPARING');
      
      console.log('📊 [ChefExecutiveDashboard] PREPARING orders:', preparingOrders.length);
      
      setOrders(preparingOrders);
    } catch (err) {
      console.error('❌ [ChefExecutiveDashboard] loadOrders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChefs = async () => {
    setLoading(true);
    try {
      // Filtrar solo Cocineros (no Cheff Ejecutivo)
      const res = await chefExecutiveService.listChefs('Cocinero');
      console.log('[ChefExecutiveDashboard] listChefs response:', res);
      // El API devuelve 'cooks' en lugar de 'chefs'
      const chefsList = res?.data?.cooks || res?.data?.chefs || [];
      setChefs(chefsList);
    } catch (err) {
      console.error('loadChefs error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ========== ORDER FUNCTIONS ==========

  const handleMarkReady = async (orderId: string) => {
    try {
      console.log('👨‍🍳 [ChefExecutiveDashboard] Marking order as READY:', orderId);
      
      await chefExecutiveService.markOrderReady(orderId);
      
      alert('✅ Orden marcada como READY (Lista para empacar)');
      loadOrders();
    } catch (err) {
      console.error('❌ [ChefExecutiveDashboard] markReady error:', err);
      alert(`❌ Error al marcar orden: ${err}`);
    }
  };

  // ========== CHEF FUNCTIONS ==========

  const handleDeleteChef = async (chef: Chef) => {
    const chefName = chef.name || `${chef.firstName || ''} ${chef.lastName || ''}`.trim();
    if (!confirm(`¿Eliminar al chef ${chefName}?`)) return;

    try {
      const chefId = chef.cook_id || chef.chefId;
      if (!chefId) {
        alert('Error: No se pudo obtener el ID del chef');
        return;
      }
      await chefExecutiveService.deleteChef(chefId);
      alert('Chef eliminado exitosamente');
      loadChefs();
    } catch (err) {
      console.error('deleteChef error:', err);
      alert(`Error al eliminar: ${err}`);
    }
  };

  // ========== RENDER LOADING ==========

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full animate-pulse opacity-20"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 animate-pulse">Cargando datos de cocina</p>
          <p className="text-sm text-gray-500 mt-1">Obteniendo información...</p>
        </div>
      </div>
    );
  }

  // ========== RENDER MAIN ==========

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-2xl shadow-2xl p-8 text-white border-4 border-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight">CHEF EJECUTIVO</h1>
              <p className="text-red-100 font-semibold">Gestión de Cocina</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-8 py-4 font-black uppercase rounded-xl transition-all shadow-lg transform hover:scale-105 ${
            activeTab === 'orders'
              ? 'bg-red-600 text-white border-4 border-white'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-600'
          }`}
        >
          🍳 Órdenes ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('chefs')}
          className={`px-8 py-4 font-black uppercase rounded-xl transition-all shadow-lg transform hover:scale-105 ${
            activeTab === 'chefs'
              ? 'bg-red-600 text-white border-4 border-white'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-600'
          }`}
        >
          👨‍🍳 Chefs ({chefs.length})
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Órdenes PREPARING - Chef Ejecutivo marca como READY */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-orange-600 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Órdenes en Preparación ({orders.length})
            </h2>
            
            {orders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="bg-white border-4 border-red-400 rounded-2xl p-6 shadow-2xl hover:shadow-red-200 transition-all duration-300 hover:scale-105 transform"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-red-600 p-2 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="font-black text-gray-900 text-lg">
                          #{order.orderId.replace('ORDER#', '').slice(0, 8)}
                        </h3>
                      </div>
                      <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-xs font-black uppercase">
                        PREPARANDO
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700">
                        {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{order.customerInfo?.email}</p>
                    </div>
                    
                    <div className="mb-3 space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-semibold">S/{item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-orange-200 pt-3 mb-3">
                      <div className="flex justify-between font-bold text-orange-700">
                        <span>Total:</span>
                        <span>S/ {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(order.createdAt).toLocaleString('es-PE')}
                    </p>
                    
                    {isAdmin ? (
                      <div className="w-full bg-gray-100 border-2 border-gray-300 text-gray-600 py-3 rounded-lg font-bold text-center flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        SOLO VISUALIZACIÓN
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkReady(order.orderId)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Marcar como Lista
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 font-medium">No hay órdenes en preparación</p>
                <p className="text-gray-400 text-sm mt-1">Las órdenes PREPARING aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHEFS TAB */}
      {activeTab === 'chefs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Lista de Chefs ({chefs.length})</h2>
            
            {chefs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Teléfono</th>
                      <th className="p-3">Especialización</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chefs.map((chef) => {
                      const chefId = chef.cook_id || chef.chefId || '';
                      const chefName = chef.name || `${chef.firstName || ''} ${chef.lastName || ''}`.trim();
                      const isAvailable = chef.isAvailable !== undefined ? chef.isAvailable : (chef.status === 'ACTIVE');
                      
                      return (
                        <tr key={chefId} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">
                            {chefName}
                          </td>
                          <td className="p-3 text-sm text-gray-600">{chef.email || '-'}</td>
                          <td className="p-3 text-sm">{chef.phoneNumber || '-'}</td>
                          <td className="p-3 text-sm">{chef.specialization || chef.role || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isAvailable ? 'Disponible' : 'No disponible'}
                            </span>
                            {chef.currentOrders !== undefined && chef.currentOrders > 0 && (
                              <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                {chef.currentOrders} órdenes
                              </span>
                            )}
                          </td>
                          <td className="p-3 space-x-2">
                            <button
                              onClick={() => handleDeleteChef(chef)}
                              className="text-red-600 hover:underline"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay chefs registrados
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
