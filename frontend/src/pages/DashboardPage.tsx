import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard } from '../components/AdminDashboard';
import { KitchenDashboard } from '../components/KitchenDashboard';
import { DeliveryDashboard } from '../components/DeliveryDashboard';

export function DashboardPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (profile) {
      if (profile.role === 'admin') {
        setActiveTab('admin');
      } else if (['cheff', 'cocinero', 'digitador'].includes(profile.role)) {
        setActiveTab('kitchen');
      } else if (['repartidor', 'empacador'].includes(profile.role)) {
        setActiveTab('delivery');
      }
    }
  }, [profile]);

  if (!profile || profile.role === 'cliente') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600">
            No tienes permisos para acceder al dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-300">Panel de control - {profile.role}</p>
        </div>
      </div>

      {profile.role === 'admin' && (
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
      </div>
    </div>
  );
}
