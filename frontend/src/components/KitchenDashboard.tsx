import { useState, useEffect } from 'react';
import { ChefHat, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export function KitchenDashboard() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.sede_id) {
      loadOrders();
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
          order_items(*)
        `)
        .eq('sede_id', profile.sede_id)
        .in('status', ['confirmed', 'in_kitchen', 'cooking'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrders(data as OrderWithItems[]);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToOrders = () => {
    const channel = supabase
      .channel('kitchen-updates')
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

  const handleStartCooking = async (orderId: string) => {
    try {
      await supabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_new_status: 'in_kitchen',
        p_user_id: profile?.id || '',
        p_notes: 'Pedido iniciado en cocina',
      });

      loadOrders();
    } catch (error) {
      console.error('Error starting order:', error);
      alert('Error al iniciar pedido');
    }
  };

  const handleItemStatusChange = async (
    itemId: string,
    newStatus: 'assigned' | 'cooking' | 'ready'
  ) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({
          status: newStatus,
          assigned_cook_id: newStatus === 'assigned' ? profile?.id : undefined,
        })
        .eq('id', itemId);

      if (error) throw error;

      const { data: item } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('id', itemId)
        .single();

      if (item) {
        const { data: allItems } = await supabase
          .from('order_items')
          .select('status')
          .eq('order_id', item.order_id);

        if (allItems?.every(i => i.status === 'ready')) {
          await supabase.rpc('update_order_status', {
            p_order_id: item.order_id,
            p_new_status: 'packaging',
            p_user_id: profile?.id || '',
            p_notes: 'Todos los items listos',
          });
        } else if (allItems?.some(i => i.status === 'cooking')) {
          await supabase.rpc('update_order_status', {
            p_order_id: item.order_id,
            p_new_status: 'cooking',
            p_user_id: profile?.id || '',
          });
        }
      }

      loadOrders();
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Error al actualizar estado');
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
  }, {} as Record<string, OrderWithItems[]>);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <span>Nuevos Pedidos</span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
              {groupedOrders.confirmed?.length || 0}
            </span>
          </h2>
          <div className="space-y-4">
            {groupedOrders.confirmed?.map((order) => (
              <div key={order.id} className="border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">#{order.order_number}</h3>
                  <span className="text-xs text-gray-600">
                    {new Date(order.created_at).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="text-sm">
                      <span className="font-medium">{item.quantity}x</span> {item.name}
                      <span className="text-gray-500 ml-2">({item.station})</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleStartCooking(order.id)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Iniciar Preparación
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChefHat className="text-orange-600" size={20} />
            </div>
            <span>En Cocina</span>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
              {groupedOrders.in_kitchen?.length || 0}
            </span>
          </h2>
          <div className="space-y-4">
            {groupedOrders.in_kitchen?.map((order) => (
              <div key={order.id} className="border-2 border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">#{order.order_number}</h3>
                  <span className="text-xs text-gray-600">
                    {new Date(order.created_at).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                    >
                      <div>
                        <span className="font-medium">{item.quantity}x</span> {item.name}
                        <span className="text-gray-500 ml-2">({item.station})</span>
                      </div>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleItemStatusChange(
                            item.id,
                            e.target.value as 'assigned' | 'cooking' | 'ready'
                          )
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="assigned">Asignado</option>
                        <option value="cooking">Cocinando</option>
                        <option value="ready">Listo</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <ChefHat className="text-red-600" size={20} />
            </div>
            <span>Cocinando</span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
              {groupedOrders.cooking?.length || 0}
            </span>
          </h2>
          <div className="space-y-4">
            {groupedOrders.cooking?.map((order) => (
              <div key={order.id} className="border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">#{order.order_number}</h3>
                  <span className="text-xs text-gray-600">
                    {new Date(order.created_at).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                    >
                      <div>
                        <span className="font-medium">{item.quantity}x</span> {item.name}
                        <span className="text-gray-500 ml-2">({item.station})</span>
                      </div>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleItemStatusChange(
                            item.id,
                            e.target.value as 'assigned' | 'cooking' | 'ready'
                          )
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="assigned">Asignado</option>
                        <option value="cooking">Cocinando</option>
                        <option value="ready">Listo</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
