import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type User = Database['public']['Tables']['users']['Row'];

interface OrderWithDriver extends Order {
  driver?: User;
}

export function DeliveryDashboard() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<OrderWithDriver[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.sede_id) {
      loadOrders();
      loadDrivers();
      subscribeToOrders();
    }
  }, [profile]);

  const loadOrders = async () => {
    if (!profile?.sede_id) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          driver:users!orders_assigned_driver_id_fkey(*)
        `)
        .eq('sede_id', profile.sede_id)
        .in('status', ['packaging', 'ready', 'on_the_way'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrders(data as OrderWithDriver[]);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    if (!profile?.sede_id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('sede_id', profile.sede_id)
        .eq('role', 'repartidor')
        .eq('active', true);

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const subscribeToOrders = () => {
    const channel = supabase
      .channel('delivery-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await supabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_new_status: 'ready',
        p_user_id: profile?.id || '',
        p_notes: 'Pedido empaquetado y listo',
      });

      loadOrders();
    } catch (error) {
      console.error('Error marking order ready:', error);
      alert('Error al marcar pedido listo');
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ assigned_driver_id: driverId })
        .eq('id', orderId);

      if (error) throw error;

      await supabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_new_status: 'on_the_way',
        p_user_id: profile?.id || '',
        p_notes: 'Repartidor asignado',
      });

      loadOrders();
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert('Error al asignar repartidor');
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await supabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_new_status: 'delivered',
        p_user_id: profile?.id || '',
        p_notes: 'Pedido entregado al cliente',
      });

      loadOrders();
    } catch (error) {
      console.error('Error marking delivered:', error);
      alert('Error al marcar como entregado');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.status]) {
      acc[order.status] = [];
    }
    acc[order.status].push(order);
    return acc;
  }, {} as Record<string, OrderWithDriver[]>);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={20} />
            </div>
            <span>Empaquetando</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {groupedOrders.packaging?.length || 0}
            </span>
          </h2>
          <div className="space-y-4">
            {groupedOrders.packaging?.map((order) => (
              <div key={order.id} className="border-2 border-blue-200 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 mb-1">
                    #{order.order_number}
                  </h3>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  {order.customer_address && (
                    <div className="flex items-start space-x-2 mt-2 text-sm text-gray-600">
                      <MapPin size={14} className="mt-1 flex-shrink-0" />
                      <span>{order.customer_address}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleMarkReady(order.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Marcar Listo
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <span>Listos</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              {groupedOrders.ready?.length || 0}
            </span>
          </h2>
          <div className="space-y-4">
            {groupedOrders.ready?.map((order) => (
              <div key={order.id} className="border-2 border-green-200 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 mb-1">
                    #{order.order_number}
                  </h3>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  {order.customer_address && (
                    <div className="flex items-start space-x-2 mt-2 text-sm text-gray-600">
                      <MapPin size={14} className="mt-1 flex-shrink-0" />
                      <span>{order.customer_address}</span>
                    </div>
                  )}
                </div>

                {order.order_type === 'delivery' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Asignar Repartidor
                    </label>
                    <select
                      onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-2"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Seleccionar repartidor
                      </option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {order.order_type === 'pickup' && (
                  <button
                    onClick={() => handleMarkDelivered(order.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Cliente Recogió
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Truck className="text-orange-600" size={20} />
            </div>
            <span>En Camino</span>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
              {groupedOrders.on_the_way?.length || 0}
            </span>
          </h2>
          <div className="space-y-4">
            {groupedOrders.on_the_way?.map((order) => (
              <div key={order.id} className="border-2 border-orange-200 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 mb-1">
                    #{order.order_number}
                  </h3>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  {order.customer_address && (
                    <div className="flex items-start space-x-2 mt-2 text-sm text-gray-600">
                      <MapPin size={14} className="mt-1 flex-shrink-0" />
                      <span>{order.customer_address}</span>
                    </div>
                  )}
                  {order.driver && (
                    <div className="mt-2 bg-orange-50 p-2 rounded text-sm">
                      <span className="font-medium">Repartidor:</span> {order.driver.name}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleMarkDelivered(order.id)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Marcar Entregado
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
