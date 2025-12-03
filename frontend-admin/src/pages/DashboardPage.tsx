import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import { AdminDashboard } from '../components/sections/AdminDashboard';
import { KitchenDashboard } from '../components/sections/KitchenDashboard';
import { ChefExecutiveDashboard } from '../components/sections/ChefExecutiveDashboard';
import { DeliveryDashboard } from '../components/sections/DeliveryDashboard';
import { PackingDashboard } from '../components/sections/PackingDashboard';
import { UserDashboard } from '../components/sections/UserDashboard';
import { AdminStats } from '../components/admin/AdminStats';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminDrivers } from '../components/admin/AdminDrivers';

export function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'stats' | 'products' | 'users' | 'drivers'>('stats');

  // Detectar la pestaña activa según la URL
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/dashboard/kitchen')) {
      setActiveTab('kitchen');
    } else if (path.includes('/dashboard/chef-executive')) {
      setActiveTab('chef-executive');
    } else if (path.includes('/dashboard/packing')) {
      setActiveTab('packing');
    } else if (path.includes('/dashboard/delivery')) {
      setActiveTab('delivery');
    } else if (path.includes('/dashboard/admin')) {
      setActiveTab('admin');
      // Detectar sub-pestaña de admin desde el parámetro :section
      if (section) {
        setAdminSubTab(section as 'stats' | 'products' | 'users' | 'drivers');
      }
    } else if (profile) {
      // Default según rol cuando está en /dashboard o /
      const role = profile.role?.toUpperCase() || '';
      console.log('🔍 [DashboardPage] Profile role:', profile.role, '→ Uppercase:', role);
      if (role === 'ADMIN') {
        navigate('/dashboard/admin/stats', { replace: true });
      } else if (role === 'CHEF_EXECUTIVE') {
        navigate('/dashboard/chef-executive', { replace: true });
      } else if (role === 'COOK') {
        navigate('/dashboard/kitchen', { replace: true });
      } else if (role === 'PACKER') {
        navigate('/dashboard/packing', { replace: true });
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
  
  // Protección: usuarios normales van a su dashboard
  if (role === 'USER') {
    return <UserDashboard />;
  }
  
  // Protección: roles no-admin SOLO pueden ver su propio dashboard
  if (role !== 'ADMIN') {
    if (role === 'CHEF_EXECUTIVE') {
      return <ChefExecutiveDashboard />;
    }
    if (role === 'COOK') {
      return <KitchenDashboard />;
    }
    if (role === 'PACKER') {
      return <PackingDashboard />;
    }
    if (role === 'DISPATCHER') {
      return <DeliveryDashboard />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      {/* Tabs de navegación según rol */}
      {role === 'ADMIN' && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => navigate('/dashboard/admin/stats')}
              className={`px-8 py-3 rounded-xl font-black uppercase transition-all transform hover:scale-105 shadow-lg ${
                activeTab === 'admin'
                  ? 'bg-red-600 text-white border-4 border-white'
                  : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'
              }`}
            >
              📊 Vista General
            </button>
            <button
              onClick={() => navigate('/dashboard/chef-executive')}
              className={`px-8 py-3 rounded-xl font-black uppercase transition-all transform hover:scale-105 shadow-lg ${
                activeTab === 'chef-executive'
                  ? 'bg-red-600 text-white border-4 border-white'
                  : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'
              }`}
            >
              👨‍🍳 Chef Ejecutivo
            </button>
            <button
              onClick={() => navigate('/dashboard/kitchen')}
              className={`px-8 py-3 rounded-xl font-black uppercase transition-all transform hover:scale-105 shadow-lg ${
                activeTab === 'kitchen'
                  ? 'bg-red-600 text-white border-4 border-white'
                  : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'
              }`}
            >
              🍳 Cocina
            </button>
            <button
              onClick={() => navigate('/dashboard/packing')}
              className={`px-8 py-3 rounded-xl font-black uppercase transition-all transform hover:scale-105 shadow-lg ${
                activeTab === 'packing'
                  ? 'bg-red-600 text-white border-4 border-white'
                  : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'
              }`}
            >
              📦 Empaquetado
            </button>
            <button
              onClick={() => navigate('/dashboard/delivery')}
              className={`px-8 py-3 rounded-xl font-black uppercase transition-all transform hover:scale-105 shadow-lg ${
                activeTab === 'delivery'
                  ? 'bg-red-600 text-white border-4 border-white'
                  : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'
              }`}
            >
              🚚 Delivery
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
                <button 
                  onClick={() => navigate('/dashboard/admin/drivers')} 
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    adminSubTab === 'drivers' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Conductores
                </button>
              </div>
            </div>

            {adminSubTab === 'stats' && <AdminStats />}
            {adminSubTab === 'products' && <AdminProducts />}
            {adminSubTab === 'users' && <AdminUsers />}
            {adminSubTab === 'drivers' && <AdminDrivers />}
          </div>
        )}
        {activeTab === 'chef-executive' && <ChefExecutiveDashboard />}
        {activeTab === 'kitchen' && <KitchenDashboard />}
        {activeTab === 'packing' && <PackingDashboard />}
        {activeTab === 'delivery' && <DeliveryDashboard />}
        {activeTab === 'user' && <UserDashboard />}
      </div>
    </div>
  );
}

 
