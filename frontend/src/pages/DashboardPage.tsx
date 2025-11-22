import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard } from '../components/sections/AdminDashboard';
import { KitchenDashboard } from '../components/sections/KitchenDashboard';
import { DeliveryDashboard } from '../components/sections/DeliveryDashboard';
import { UserDashboard } from '../components/sections/UserDashboard';

export function DashboardPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (profile) {
      const role = profile.role?.toUpperCase() || '';
      
      // Redirigir automáticamente según el rol
      if (role === 'ADMIN') {
        setActiveTab('admin');
      } else if (role === 'COOK') {
        setActiveTab('kitchen');
      } else if (role === 'DISPATCHER') {
        setActiveTab('delivery');
      } else if (role === 'USER') {
        // Mostrar vista de usuario dentro del dashboard
        setActiveTab('user');
      }
    }
  }, [profile]);

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
                Bienvenido, <strong>{profile?.nombre || 'Usuario'}</strong> - {getRoleDisplay()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {role === 'ADMIN' && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('kitchen')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'kitchen'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cocina
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
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
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'kitchen' && <KitchenDashboard />}
        {activeTab === 'delivery' && <DeliveryDashboard />}
        {activeTab === 'user' && <UserDashboard />}
      </div>
    </div>
  );
}
