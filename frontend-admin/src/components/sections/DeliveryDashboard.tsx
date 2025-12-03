import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, MapPin, Users, Clock, Phone, Mail, Navigation } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import deliveryService from '../../services/delivery';
import type { Driver, DeliveryOrder } from '../../services/delivery';

export function DeliveryDashboard() {
  const { user, profile } = useAuth();
  const [currentOrder, setCurrentOrder] = useState<DeliveryOrder | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  useEffect(() => {
    console.log('[DeliveryDashboard] mount', { user, profile });
    loadCurrentOrder();
    loadAvailableDrivers();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      loadCurrentOrder();
    }, 30000);
    
    return () => {
      clearInterval(interval);
      console.log('[DeliveryDashboard] unmount');
    };
  }, [user]);

  const loadCurrentOrder = async () => {
    setLoading(true);
    try {
      const res = await deliveryService.getCurrentOrder();
      console.log('[DeliveryDashboard] getCurrentOrder response:', res);
      setCurrentOrder(res.data.order);
    } catch (err: any) {
      console.error('loadCurrentOrder error:', err);
      // Si no hay orden actual, no es un error crítico
      if (err.message?.includes('404')) {
        setCurrentOrder(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const res = await deliveryService.getAvailableDrivers();
      setAvailableDrivers(res.data.drivers || []);
    } catch (err) {
      console.error('loadAvailableDrivers error:', err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleStartDelivery = async () => {
    if (!currentOrder) return;
    if (!confirm('¿Iniciar entrega de la orden?')) return;
    
    try {
      const res = await deliveryService.updateOrderStatus(currentOrder.orderId, 'DELIVERING');
      console.log('[DeliveryDashboard] updateOrderStatus DELIVERING response:', res);
      alert('🚚 Entrega iniciada');
      loadCurrentOrder();
    } catch (err) {
      console.error('handleStartDelivery error:', err);
      alert(`❌ Error al iniciar entrega: ${err}`);
    }
  };

  const handleMarkDelivered = async () => {
    if (!currentOrder) return;
    if (!confirm('¿Confirmar que la orden fue entregada al cliente?')) return;
    
    try {
      const res = await deliveryService.updateOrderStatus(currentOrder.orderId, 'DELIVERED');
      console.log('[DeliveryDashboard] updateOrderStatus DELIVERED response:', res);
      alert('✅ Orden entregada exitosamente');
      setCurrentOrder(null);
      loadCurrentOrder();
    } catch (err) {
      console.error('handleMarkDelivered error:', err);
      alert(`❌ Error al marcar como entregada: ${err}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ASSIGNED: 'bg-blue-100 text-blue-800',
      PACKED: 'bg-indigo-100 text-indigo-800',
      DELIVERING: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      READY: 'bg-yellow-100 text-yellow-800',
      PREPARING: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      ASSIGNED: 'Asignada',
      PACKED: 'Empaquetada',
      DELIVERING: 'En Camino',
      DELIVERED: 'Entregada',
      READY: 'Lista',
      PREPARING: 'Preparando',
    };
    return texts[status] || status;
  };

  if (loading && !currentOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <Truck className="absolute inset-0 m-auto text-blue-600" size={32} />
        </div>
        <p className="text-lg font-semibold text-gray-700">Cargando información de delivery...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl shadow-2xl p-8 text-white border-4 border-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl">
                <Truck size={40} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight uppercase">TGI DELIVERY</h2>
                <p className="text-red-100 font-semibold">Panel de Repartidor</p>
              </div>
            </div>
            <button
              onClick={loadCurrentOrder}
              className="bg-white text-red-600 px-6 py-3 rounded-xl font-black hover:bg-red-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              🔄 ACTUALIZAR
            </button>
          </div>
          <p className="text-white text-lg">
            Bienvenido, <strong className="text-yellow-300">{profile?.firstName || user?.nombre || 'Conductor'}</strong> 🚚
          </p>
        </div>
      </div>

      {/* Orden Actual */}
      {currentOrder ? (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-red-400">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-3xl font-black uppercase flex items-center">
                <Navigation className="mr-3" size={32} />
                Orden Activa
              </h3>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(currentOrder.status)}`}>
                {getStatusText(currentOrder.status)}
              </span>
            </div>
            <p className="text-blue-100 text-sm">
              ID: {currentOrder.orderId.replace('ORDER#', '')}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Cliente y Dirección */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Phone size={18} className="mr-2 text-blue-600" />
                  Información del Cliente
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-lg text-gray-900">
                    {currentOrder.customerInfo.firstName} {currentOrder.customerInfo.lastName}
                  </p>
                  <p className="flex items-center text-gray-700">
                    <Phone size={14} className="mr-2" />
                    {currentOrder.customerInfo.phoneNumber}
                  </p>
                  <p className="flex items-center text-gray-700">
                    <Mail size={14} className="mr-2" />
                    {currentOrder.customerInfo.email}
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <MapPin size={18} className="mr-2 text-orange-600" />
                  Dirección de Entrega
                </h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <p className="font-medium">{currentOrder.deliveryAddress.street}</p>
                  <p>{currentOrder.deliveryAddress.district}, {currentOrder.deliveryAddress.city}</p>
                  <p className="text-gray-600">CP: {currentOrder.deliveryAddress.zipCode}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                <Package size={18} className="mr-2 text-gray-700" />
                Productos ({currentOrder.items.length})
              </h4>
              <div className="space-y-2">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-3 border">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900">
                      {currentOrder.currency} {item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">{currentOrder.currency} {currentOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Delivery:</span>
                  <span className="font-medium">{currentOrder.currency} {currentOrder.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t-2 border-green-300">
                  <span>TOTAL:</span>
                  <span>{currentOrder.currency} {currentOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notas */}
            {currentOrder.notes && (
              <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                <p className="text-sm"><strong>Notas:</strong> {currentOrder.notes}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="pt-4">
              {(currentOrder.status === 'ASSIGNED' || currentOrder.status === 'PACKED') && (
                <button
                  onClick={handleStartDelivery}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-5 rounded-xl font-bold text-xl flex items-center justify-center space-x-3 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  <Truck size={28} />
                  <span>🚚 Iniciar Entrega</span>
                </button>
              )}
              {currentOrder.status === 'DELIVERING' && (
                <button
                  onClick={handleMarkDelivered}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-5 rounded-xl font-bold text-xl flex items-center justify-center space-x-3 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  <CheckCircle size={28} />
                  <span>✅ Marcar como Entregada</span>
                </button>
              )}
              {currentOrder.status === 'DELIVERED' && (
                <div className="w-full bg-green-50 border-2 border-green-300 text-green-800 py-5 rounded-xl font-bold text-xl flex items-center justify-center space-x-3">
                  <CheckCircle size={28} />
                  <span>✅ Orden Entregada</span>
                </div>
              )}
            </div>

            {/* Timeline */}
            {currentOrder.history && currentOrder.history.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Clock size={18} className="mr-2 text-gray-700" />
                  Historial ({currentOrder.history.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentOrder.history.slice(-5).reverse().map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-white rounded p-2 border">
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(entry.status)}`}>
                          {getStatusText(entry.status)}
                        </span>
                        <span className="ml-2 text-gray-600">por {entry.handler.role}</span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {new Date(entry.timestamp).toLocaleTimeString('es-PE')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Truck size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Sin Orden Activa</h3>
          <p className="text-gray-600">No tienes ninguna orden asignada en este momento.</p>
        </div>
      )}

      {/* Conductores Disponibles - Opcional */}
      {availableDrivers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Users size={24} className="mr-2 text-green-600" />
              Conductores Disponibles ({availableDrivers.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableDrivers.map((driver) => (
              <div key={driver.driverId} className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{driver.name}</h4>
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    Disponible
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center">
                    <Truck size={14} className="mr-1" />
                    {driver.vehicleType.charAt(0).toUpperCase() + driver.vehicleType.slice(1)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Entregas: {driver.currentDeliveries}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
