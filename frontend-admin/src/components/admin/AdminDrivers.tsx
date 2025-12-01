import { useEffect, useState } from 'react';
import adminService from '../../services/admin';
import type { Driver } from '../../services/admin';

export function AdminDrivers() {
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      console.log('[AdminDrivers] fetching drivers list...');
      const res = await adminService.listDrivers();
      console.log('[AdminDrivers] fetch result:', res);
      
      setDrivers(res?.data?.drivers || []);
    } catch (err) {
      console.error('loadDrivers error:', err);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-full animate-pulse opacity-20"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 animate-pulse">Cargando conductores</p>
          <p className="text-sm text-gray-500 mt-1">Obteniendo información de delivery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conductores de Delivery</h2>
          <p className="text-gray-600 mt-1">Gestiona los conductores y su disponibilidad</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm opacity-90 mb-2">Disponibles</h3>
          <p className="text-4xl font-bold">
            {drivers.filter(d => d.isAvailable).length}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm opacity-90 mb-2">En Ruta</h3>
          <p className="text-4xl font-bold">
            {drivers.filter(d => d.currentDeliveries > 0).length}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm opacity-90 mb-2">Total Conductores</h3>
          <p className="text-4xl font-bold">{drivers.length}</p>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">Lista de Conductores</h3>
        </div>
        
        {drivers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Vehículo</th>
                  <th className="p-4">Disponibilidad</th>
                  <th className="p-4">Entregas Activas</th>
                  <th className="p-4">Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.driverId} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {driver.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{driver.name}</p>
                          <p className="text-xs text-gray-500">ID: {driver.driverId.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {driver.vehicleType === 'moto' && (
                          <>
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Moto</span>
                          </>
                        )}
                        {driver.vehicleType === 'auto' && (
                          <>
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Auto</span>
                          </>
                        )}
                        {driver.vehicleType === 'bicicleta' && (
                          <>
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Bicicleta</span>
                          </>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      {driver.isAvailable ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                          Disponible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                          No disponible
                        </span>
                      )}
                    </td>
                    
                    <td className="p-4">
                      {driver.currentDeliveries > 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                          {driver.currentDeliveries} en ruta
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin entregas</span>
                      )}
                    </td>
                    
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(driver.createdAt).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-gray-500 text-lg">No hay conductores registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}
