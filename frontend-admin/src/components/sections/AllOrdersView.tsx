import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, Star, ChefHat, Box } from 'lucide-react';
import kitchenService from '../../services/kitchen';

// Tipo extendido para soportar todos los estados del flujo completo
interface ExtendedOrder {
  orderId: string;
  tenantId: string;
  userId: string;
  status: string; // Usar string genérico para soportar todos los estados
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice?: number;
    price?: number;
    subtotal: number;
  }>;
  total: number;
  createdAt: string;
  updatedAt: string;
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
}

export function AllOrdersView() {
  const [allOrders, setAllOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadAllOrders();
    const interval = setInterval(loadAllOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAllOrders = async () => {
    try {
      console.log('📋 [AllOrdersView] Cargando todas las órdenes...');
      const res = await kitchenService.getAllOrders();
      const orders = res?.data?.orders || [];
      console.log('✅ [AllOrdersView] Total órdenes:', orders.length);
      setAllOrders(orders);
    } catch (error) {
      console.error('❌ [AllOrdersView] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CREATED: 'bg-blue-100 text-blue-800 border-blue-300',
      PREPARING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      READY: 'bg-green-100 text-green-800 border-green-300',
      PACKED: 'bg-purple-100 text-purple-800 border-purple-300',
      DELIVERING: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED': return <Star className="w-5 h-5" />;
      case 'PREPARING': return <ChefHat className="w-5 h-5" />;
      case 'READY': return <CheckCircle className="w-5 h-5" />;
      case 'PACKED': return <Box className="w-5 h-5" />;
      case 'DELIVERING': return <Truck className="w-5 h-5" />;
      case 'DELIVERED': return <CheckCircle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      CREATED: 'Nueva',
      PREPARING: 'Preparando',
      READY: 'Lista',
      PACKED: 'Empaquetada',
      DELIVERING: 'En Camino',
      DELIVERED: 'Entregada',
    };
    return texts[status] || status;
  };

  const filteredOrders = filter === 'ALL' 
    ? allOrders 
    : allOrders.filter(o => o.status === filter);

  const statusCounts = {
    ALL: allOrders.length,
    CREATED: allOrders.filter(o => o.status === 'CREATED').length,
    PREPARING: allOrders.filter(o => o.status === 'PREPARING').length,
    READY: allOrders.filter(o => o.status === 'READY').length,
    PACKED: allOrders.filter(o => o.status === 'PACKED').length,
    DELIVERING: allOrders.filter(o => o.status === 'DELIVERING').length,
    DELIVERED: allOrders.filter(o => o.status === 'DELIVERED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Cargando órdenes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-8 rounded-2xl shadow-2xl border-4 border-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase mb-2 flex items-center gap-3">
              <Package size={40} />
              TODAS LAS ÓRDENES
            </h1>
            <p className="text-red-100 text-lg font-semibold">
              Vista completa del sistema - {allOrders.length} órdenes totales
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-white/30">
            <div className="text-5xl font-black">{allOrders.length}</div>
            <div className="text-sm font-semibold text-red-100">TOTAL</div>
          </div>
        </div>
      </div>

      {/* Filtros por Estado */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <h3 className="text-lg font-black text-gray-900 mb-4 uppercase">Filtrar por Estado:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
              filter === 'ALL'
                ? 'bg-red-600 text-white border-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-red-600'
            }`}
          >
            <div className="text-2xl font-black">{statusCounts.ALL}</div>
            <div className="text-xs">TODAS</div>
          </button>
          
          <button
            onClick={() => setFilter('CREATED')}
            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
              filter === 'CREATED'
                ? 'bg-blue-600 text-white border-white shadow-lg scale-105'
                : 'bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-600'
            }`}
          >
            <div className="text-2xl font-black">{statusCounts.CREATED}</div>
            <div className="text-xs">NUEVAS</div>
          </button>

          <button
            onClick={() => setFilter('PREPARING')}
            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
              filter === 'PREPARING'
                ? 'bg-yellow-600 text-white border-white shadow-lg scale-105'
                : 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:border-yellow-600'
            }`}
          >
            <div className="text-2xl font-black">{statusCounts.PREPARING}</div>
            <div className="text-xs">PREPARANDO</div>
          </button>

          <button
            onClick={() => setFilter('READY')}
            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
              filter === 'READY'
                ? 'bg-green-600 text-white border-white shadow-lg scale-105'
                : 'bg-green-50 text-green-700 border-green-300 hover:border-green-600'
            }`}
          >
            <div className="text-2xl font-black">{statusCounts.READY}</div>
            <div className="text-xs">LISTAS</div>
          </button>

          <button
            onClick={() => setFilter('PACKED')}
            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
              filter === 'PACKED'
                ? 'bg-purple-600 text-white border-white shadow-lg scale-105'
                : 'bg-purple-50 text-purple-700 border-purple-300 hover:border-purple-600'
            }`}
          >
            <div className="text-2xl font-black">{statusCounts.PACKED}</div>
            <div className="text-xs">EMPAQUETADAS</div>
          </button>

          <button
            onClick={() => setFilter('DELIVERING')}
            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
              filter === 'DELIVERING'
                ? 'bg-indigo-600 text-white border-white shadow-lg scale-105'
                : 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:border-indigo-600'
            }`}
          >
            <div className="text-2xl font-black">{statusCounts.DELIVERING}</div>
            <div className="text-xs">EN CAMINO</div>
          </button>

          <button
            onClick={() => setFilter('DELIVERED')}
            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
              filter === 'DELIVERED'
                ? 'bg-emerald-600 text-white border-white shadow-lg scale-105'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:border-emerald-600'
            }`}
          >
            <div className="text-2xl font-black">{statusCounts.DELIVERED}</div>
            <div className="text-xs">ENTREGADAS</div>
          </button>
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <h3 className="text-xl font-black text-gray-900 mb-4 uppercase">
          {filter === 'ALL' ? 'Todas las Órdenes' : `Órdenes ${getStatusText(filter)}`} ({filteredOrders.length})
        </h3>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No hay órdenes en este estado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white border-4 border-gray-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all hover:scale-102"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-gray-900 text-base">
                    #{order.orderId.replace('ORDER#', '').slice(0, 8)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border-2 flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Cliente */}
                {order.customerInfo && (
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="font-semibold text-sm text-gray-900">
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{order.customerInfo.email}</p>
                  </div>
                )}

                {/* Items */}
                <div className="mb-3 space-y-1">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.quantity}x {item.name}</span>
                      <span className="font-semibold text-gray-900">S/{item.subtotal?.toFixed(2) || (item.quantity * (item.unitPrice || 0)).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-500 italic">+{order.items.length - 3} items más</p>
                  )}
                </div>

                {/* Total */}
                <div className="border-t-2 border-red-200 pt-3 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Total:</span>
                    <span className="text-xl font-black text-red-600">S/{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Fecha */}
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(order.createdAt).toLocaleString('es-PE')}
                </p>

                {/* Badge de Solo Visualización */}
                <div className="mt-3 bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2">
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
