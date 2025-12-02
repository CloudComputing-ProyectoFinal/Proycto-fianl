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
      <h2 className="text-2xl font-bold">Estadísticas del Día</h2>
      
      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm opacity-90 mb-2">Total Órdenes</h3>
          <p className="text-4xl font-bold">{totalOrders}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm opacity-90 mb-2">Ingresos del Día</h3>
          <p className="text-4xl font-bold">S/ {revenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm opacity-90 mb-2">Órdenes Creadas</h3>
          <p className="text-4xl font-bold">{statusCounts.CREATED || 0}</p>
        </div>
      </div>

      {/* Tabla de órdenes de hoy */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Órdenes de Hoy ({todayOrders.length})</h3>
        
        {todayOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3">ID Orden</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Pago</th>
                  <th className="p-3">Hora</th>
                </tr>
              </thead>
              <tbody>
                {todayOrders.map((order) => (
                  <tr key={order.orderId} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">
                      {order.orderId.replace('ORDER#', '')}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">
                        {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{order.customerInfo?.email}</div>
                    </td>
                    <td className="p-3 font-semibold">
                      S/ {order.total.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'READY' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleTimeString('es-PE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay órdenes registradas hoy
          </div>
        )}
      </div>
    </div>
  );
}
