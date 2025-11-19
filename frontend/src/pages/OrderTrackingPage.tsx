import { useState, useEffect } from 'react';
import { Package, Clock, ChefHat, Box, Truck, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export function OrderTrackingPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadOrders();
      subscribeToOrders();
    }
  }, [profile]);

  const loadOrders = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

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
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Pendiente',
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
        };
      case 'confirmed':
        return {
          icon: CheckCircle,
          text: 'Confirmado',
          color: 'text-green-600',
          bg: 'bg-green-100',
        };
      case 'in_kitchen':
        return {
          icon: ChefHat,
          text: 'En Cocina',
          color: 'text-orange-600',
          bg: 'bg-orange-100',
        };
      case 'cooking':
        return {
          icon: ChefHat,
          text: 'Cocinando',
          color: 'text-orange-600',
          bg: 'bg-orange-100',
        };
      case 'packaging':
        return {
          icon: Box,
          text: 'Empaquetando',
          color: 'text-blue-600',
          bg: 'bg-blue-100',
        };
      case 'ready':
        return {
          icon: Package,
          text: 'Listo',
          color: 'text-green-600',
          bg: 'bg-green-100',
        };
      case 'on_the_way':
        return {
          icon: Truck,
          text: 'En Camino',
          color: 'text-blue-600',
          bg: 'bg-blue-100',
        };
      case 'delivered':
        return {
          icon: CheckCircle,
          text: 'Entregado',
          color: 'text-green-600',
          bg: 'bg-green-100',
        };
      default:
        return {
          icon: Package,
          text: status,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Mis Pedidos</h1>
          <p className="text-xl text-gray-300">
            Seguimiento en tiempo real de tus pedidos
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={80} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No tienes pedidos
            </h2>
            <p className="text-gray-600">
              Realiza tu primer pedido desde el menú
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Pedido #{order.order_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleString('es-PE', {
                            dateStyle: 'long',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                      <div
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full ${statusInfo.bg}`}
                      >
                        <StatusIcon size={20} className={statusInfo.color} />
                        <span className={`font-semibold ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Cliente:</span>
                        <p className="font-medium">{order.customer_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Teléfono:</span>
                        <p className="font-medium">{order.customer_phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tipo:</span>
                        <p className="font-medium capitalize">{order.order_type}</p>
                      </div>
                    </div>

                    {order.customer_address && (
                      <div className="mt-4">
                        <span className="text-gray-600 text-sm">Dirección:</span>
                        <p className="font-medium">{order.customer_address}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Items del Pedido
                    </h4>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium text-gray-900">
                            S/ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-4 pt-4 flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">
                        S/ {order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
