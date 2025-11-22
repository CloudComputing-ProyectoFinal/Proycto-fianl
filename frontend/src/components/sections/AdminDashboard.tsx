import { useState } from 'react';
import { TrendingUp, Package, Clock, Users } from 'lucide-react';

export function AdminDashboard() {
  const [stats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });

  const [recentOrders] = useState([]);

  // TODO: Integrar con GET /admin/dashboard del backend AWS Lambda
  // useEffect(() => {
  //   const fetchDashboard = async () => {
  //     const response = await fetch(`${API_URL}/admin/dashboard`);
  //     const data = await response.json();
  //     setStats(data.stats);
  //     setRecentOrders(data.recentOrders);
  //   };
  //   fetchDashboard();
  // }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Pedidos Hoy</h3>
            <Package className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">En Proceso</h3>
            <Clock className="text-orange-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeOrders}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Ingresos Hoy</h3>
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            S/ {stats.totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Clientes</h3>
            <Users className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pedidos Recientes</h2>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600">No hay pedidos recientes</p>
            <p className="text-gray-500 text-sm mt-2">
              TODO: Integrar con GET /admin/dashboard del backend AWS Lambda
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-900">#{order.order_number}</p>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    S/ {order.total_amount.toFixed(2)}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Modo Demo:</strong> Este dashboard mostrará datos reales cuando se integre con el backend AWS Lambda.
          Los endpoints necesarios están en <code className="bg-blue-100 px-2 py-1 rounded">backend/services/admin-service/</code>
        </p>
      </div>
    </div>
  );
}
