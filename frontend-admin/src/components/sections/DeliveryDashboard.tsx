import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, MapPin, Users, Clock, Phone, Mail, Navigation } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import deliveryService from '../../services/delivery';
import type { Driver, DeliveryOrder } from '../../services/delivery';

export function DeliveryDashboard() {
  const { user, profile } = useAuth();
  const [currentOrder, setCurrentOrder] = useState<DeliveryOrder | null>(null);
  const [deliveringOrders, setDeliveringOrders] = useState<DeliveryOrder[]>([]); // Para ADMIN
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  
  const isAdmin = profile?.role === 'ADMIN';

  useEffect(() => {
    console.log('[DeliveryDashboard] mount', { user, profile, isAdmin });
    
    if (isAdmin) {
      loadDeliveringOrders();
    } else {
      loadCurrentOrder();
      loadAvailableDrivers();
    }
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      if (isAdmin) {
        loadDeliveringOrders();
      } else {
        loadCurrentOrder();
      }
    }, 30000);
    
    return () => {
      clearInterval(interval);
      console.log('[DeliveryDashboard] unmount');
    };
  }, [user, isAdmin]);

  const loadDeliveringOrders = async () => {
    setLoading(true);
    try {
      console.log('🚨 [DeliveryDashboard ADMIN] Cargando todas las órdenes DELIVERING...');
      const res = await deliveryService.listDeliveryOrders();
      console.log('✅ [DeliveryDashboard ADMIN] listDeliveryOrders response:', res);
      const allOrders = res?.data?.orders || [];
      // Filtrar solo órdenes en estado DELIVERING
      const delivering = allOrders.filter(o => o.status === 'DELIVERING');
      console.log('📦 [DeliveryDashboard ADMIN] Órdenes DELIVERING:', delivering.length);
      setDeliveringOrders(delivering);
    } catch (err) {
      console.error('❌ [DeliveryDashboard ADMIN] loadDeliveringOrders error:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && !currentOrder && deliveringOrders.length === 0) {
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

  // Vista para ADMIN: Todas las órdenes DELIVERING
  if (isAdmin) {
    return (
      <div className="space-y-6">
        {/* Header ADMIN */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl shadow-2xl p-8 text-white border-4 border-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl">
                  <Truck size={40} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tight uppercase">ÓRDENES EN CAMINO</h2>
                  <p className="text-red-100 font-semibold">Vista Admin - Delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-white/30">
                  <div className="text-5xl font-black">{deliveringOrders.length}</div>
                  <div className="text-sm font-semibold text-red-100">EN CAMINO</div>
                </div>
                <button
                  onClick={loadDeliveringOrders}
                  className="bg-white text-red-600 px-6 py-3 rounded-xl font-black hover:bg-red-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  🔄 ACTUALIZAR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Órdenes DELIVERING */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <h3 className="text-xl font-black text-gray-900 mb-4 uppercase flex items-center gap-2">
            <Truck className="text-purple-600" />
            Órdenes en Entrega ({deliveringOrders.length})
          </h3>
          
          {deliveringOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Truck className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No hay órdenes en camino</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveringOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white border-4 border-purple-400 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-gray-900 text-base">
                      #{order.orderId.replace('ORDER#', '').slice(0, 8)}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold uppercase border-2 border-purple-300 flex items-center gap-1">
                      <Truck size={14} />
                      EN CAMINO
                    </span>
                  </div>

                  {/* Conductor */}
                  {order.driver_name && (
                    <div className="mb-3 pb-3 border-b border-gray-200 bg-indigo-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Conductor:</p>
                      <p className="font-bold text-sm text-indigo-900">{order.driver_name}</p>
                    </div>
                  )}

                  {/* Cliente */}
                  {order.customerInfo && (
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <p className="text-xs text-gray-500">Cliente:</p>
                      <p className="font-semibold text-sm text-gray-900">
                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone size={10} />
                        {order.customerInfo.phoneNumber}
                      </p>
                    </div>
                  )}

                  {/* Dirección */}
                  {order.deliveryAddress && (
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} className="text-orange-600" />
                        Dirección:
                      </p>
                      <p className="text-sm text-gray-700 font-medium">{order.deliveryAddress.street}</p>
                      <p className="text-xs text-gray-500">{order.deliveryAddress.district}, {order.deliveryAddress.city}</p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="mb-3 space-y-1">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.quantity}x {item.name}</span>
                        <span className="font-semibold text-gray-900">{order.currency} {item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-500 italic">+{order.items.length - 2} items más</p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-purple-200 pt-3 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Total:</span>
                      <span className="text-xl font-black text-purple-600">{order.currency} {order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Fecha */}
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                    <Clock size={12} />
                    {new Date(order.assigned_at || order.updatedAt).toLocaleString('es-PE')}
                  </p>

                  {/* Badge ADMIN */}
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2">
                    <p className="text-gray-600 text-xs font-bold text-center">
                      👁️ SOLO VISUALIZACIÓN
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista para DISPATCHER: Orden actual del conductor
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
              {isAdmin ? (
                <div className="w-full bg-gray-100 border-2 border-gray-300 text-gray-600 py-5 rounded-xl font-bold text-xl flex items-center justify-center space-x-3">
                  👁️ SOLO VISUALIZACIÓN - ADMIN
                </div>
              ) : (
                <>
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
                </>
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
