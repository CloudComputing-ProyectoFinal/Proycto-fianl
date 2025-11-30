import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import { AdminDashboard } from '../components/sections/AdminDashboard';
import { KitchenDashboard } from '../components/sections/KitchenDashboard';
import { DeliveryDashboard } from '../components/sections/DeliveryDashboard';
import { UserDashboard } from '../components/sections/UserDashboard';
import { AdminStats } from '../components/admin/AdminStats';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminUsers } from '../components/admin/AdminUsers';

export function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'stats' | 'products' | 'users'>('stats');

  // Detectar la pestaña activa según la URL
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/dashboard/kitchen')) {
      setActiveTab('kitchen');
    } else if (path.includes('/dashboard/delivery')) {
      setActiveTab('delivery');
    } else if (path.includes('/dashboard/admin')) {
      setActiveTab('admin');
      // Detectar sub-pestaña de admin desde el parámetro :section
      if (section) {
        setAdminSubTab(section as 'stats' | 'products' | 'users');
      }
    } else if (profile) {
      // Default según rol cuando está en /dashboard o /
      const role = profile.role?.toUpperCase() || '';
      if (role === 'ADMIN') {
        navigate('/dashboard/admin/stats', { replace: true });
      } else if (role === 'COOK') {
        navigate('/dashboard/kitchen', { replace: true });
      } else if (role === 'DISPATCHER') {
        navigate('/dashboard/delivery', { replace: true });
      } else if (role === 'USER') {
        setActiveTab('user');
      }
    }
  }, [location.pathname, section, profile, navigate]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const role = profile.role?.toUpperCase() || '';
  if (role === 'USER') {
    return <UserDashboard />;
  }

  const getRoleDisplay = () => {
    const role = profile?.role?.toUpperCase() || '';
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'COOK': 'Cocinero',
      'DISPATCHER': 'Repartidor',
      'USER': 'Cliente',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-300">
                Bienvenido, <strong>{profile?.firstName || profile?.nombre || 'Usuario'}</strong> - {getRoleDisplay()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {role === 'ADMIN' && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => navigate('/dashboard/admin/stats')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Vista General
            </button>
            <button
              onClick={() => navigate('/dashboard/kitchen')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'kitchen'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cocina
            </button>
            <button
              onClick={() => navigate('/dashboard/delivery')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'delivery'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Delivery
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-8">
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {/* Admin sub-tabs: Stats / Products / Orders / Users */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <div className="flex space-x-3 flex-wrap">
                <button 
                  onClick={() => navigate('/dashboard/admin/stats')} 
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    adminSubTab === 'stats' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Estadísticas
                </button>
                <button 
                  onClick={() => navigate('/dashboard/admin/products')} 
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    adminSubTab === 'products' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Productos
                </button>
                <button 
                  onClick={() => navigate('/dashboard/admin/users')} 
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    adminSubTab === 'users' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Usuarios
                </button>
              </div>
            </div>

            {adminSubTab === 'stats' && <AdminStats />}
            {adminSubTab === 'products' && <AdminProducts />}
            {adminSubTab === 'users' && <AdminUsers />}
          </div>
        )}
        {activeTab === 'kitchen' && <KitchenDashboard />}
        {activeTab === 'delivery' && <DeliveryDashboard />}
        {activeTab === 'user' && <UserDashboard />}
      </div>
    </div>
  );
}

 
