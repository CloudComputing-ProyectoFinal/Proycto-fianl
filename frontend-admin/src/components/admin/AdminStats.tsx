import { useEffect, useState } from 'react';
import adminService from '../../services/admin';

export function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [todayOrders, setTodayOrders] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      console.log('[AdminStats] fetching dashboard stats...');
      try {
        // Cargar estadísticas del dashboard
        const dashboardRes = await adminService.fetchDashboard();
        console.log('[AdminStats] dashboard result:', dashboardRes);
        
        // Cargar órdenes de hoy
        const ordersRes = await adminService.fetchTodayOrders();
        console.log('[AdminStats] today orders result:', ordersRes);
        
        if (mounted) {
          // Extraer stats de la respuesta
          const statsData = dashboardRes?.data?.stats || dashboardRes?.stats || {};
          setStats(statsData);
          
          // Extraer órdenes de la respuesta
          const ordersData = ordersRes?.data?.orders || ordersRes?.orders || [];
          setTodayOrders(ordersData);
        }
      } catch (err) {
        console.error('fetchDashboard', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          {/* Círculo exterior giratorio */}
          <div className="w-20 h-20 border-4 border-green-200 rounded-full animate-spin border-t-green-600"></div>
          {/* Círculo interior pulsante */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-green-600 rounded-full animate-pulse opacity-20"></div>
          </div>
          {/* Icono central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 animate-pulse">Cargando estadísticas</p>
          <p className="text-sm text-gray-500 mt-1">Recopilando datos del dashboard...</p>
        </div>
      </div>
    );
  }
  if (!stats) return <div className="p-4">No hay datos disponibles</div>;

  // Calcular totales por estado
  const statusCounts = stats.byStatus || {};
  const totalOrders = stats.totalOrders || 0;
  const revenue = stats.revenue || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl shadow-2xl p-8 text-white border-4 border-white">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tight">ESTADÍSTICAS DEL DÍA</h2>
            <p className="text-red-100 font-semibold mt-1">📊 Panel de Métricas TGI Fridays</p>
          </div>
        </div>
      </div>
      
      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-500 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-600 p-3 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-600 uppercase mb-2">Total Órdenes</h3>
          <p className="text-5xl font-black text-red-600">{totalOrders}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-500 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-600 p-3 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-600 uppercase mb-2">Ingresos del Día</h3>
          <p className="text-5xl font-black text-green-600">S/ {revenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-blue-500 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-600 uppercase mb-2">Nuevas</h3>
          <p className="text-5xl font-black text-blue-600">{statusCounts.CREATED || 0}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-yellow-500 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500 p-3 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-600 uppercase mb-2">En Proceso</h3>
          <p className="text-5xl font-black text-yellow-600">{(statusCounts.PREPARING || 0) + (statusCounts.COOKING || 0)}</p>
        </div>
      </div>

      {/* Tabla de órdenes de hoy */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase text-gray-900">Órdenes de Hoy</h3>
            <p className="text-sm font-semibold text-gray-600">{todayOrders.length} órdenes registradas</p>
          </div>
        </div>
        
        {todayOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-4 border-red-600 bg-red-50">
                  <th className="p-4 font-black uppercase text-xs text-gray-700">ID Orden</th>
                  <th className="p-4 font-black uppercase text-xs text-gray-700">Cliente</th>
                  <th className="p-4 font-black uppercase text-xs text-gray-700">Total</th>
                  <th className="p-4 font-black uppercase text-xs text-gray-700">Estado</th>
                  <th className="p-4 font-black uppercase text-xs text-gray-700">Pago</th>
                  <th className="p-4 font-black uppercase text-xs text-gray-700">Hora</th>
                </tr>
              </thead>
              <tbody>
                {todayOrders.map((order, idx) => (
                  <tr key={order.orderId} className={`border-b-2 border-gray-100 hover:bg-red-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4">
                      <span className="font-mono text-sm font-bold text-red-600">
                        #{order.orderId.replace('ORDER#', '').slice(0, 8)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">
                        {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">{order.customerInfo?.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-lg font-black text-green-600">
                        S/ {order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase ${
                        order.status === 'CREATED' ? 'bg-blue-600 text-white' :
                        order.status === 'PREPARING' ? 'bg-yellow-500 text-white' :
                        order.status === 'COOKING' ? 'bg-orange-600 text-white' :
                        order.status === 'READY' ? 'bg-green-600 text-white' :
                        order.status === 'PACKED' ? 'bg-purple-600 text-white' :
                        order.status === 'DELIVERING' ? 'bg-indigo-600 text-white' :
                        order.status === 'DELIVERED' ? 'bg-emerald-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase ${
                        order.paymentStatus === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {order.paymentStatus === 'COMPLETED' ? '✓ PAGADO' : '✗ PENDIENTE'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-gray-700">
                        {new Date(order.createdAt).toLocaleTimeString('es-PE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-bold text-gray-500">No hay órdenes registradas hoy</p>
            <p className="text-sm text-gray-400 mt-1">Las órdenes aparecerán aquí cuando se creen</p>
          </div>
        )}
      </div>
    </div>
  );
}
