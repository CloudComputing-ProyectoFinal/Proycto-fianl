import { useState } from 'react';
import { MapPin, Phone, User, FileText } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { cartItems, total, clearCart } = useCart();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    address: '',
    notes: '',
    orderType: 'delivery' as 'delivery' | 'pickup',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    setLoading(true);

    try {
      // TODO: POST a /orders endpoint del backend AWS Lambda
      const orderData = {
        customer_id: profile?.id || null,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.orderType === 'delivery' ? formData.address : null,
        order_type: formData.orderType,
        total_amount: total + (formData.orderType === 'delivery' ? 5 : 0),
        notes: formData.notes || null,
        items: cartItems.map((item) => ({
          menu_item_id: item.menu_item_id,
          name: item.menu_item.name,
          price: item.menu_item.price,
          quantity: item.quantity,
        })),
      };

      console.log('Submit order:', orderData);
      
      // Simulación de pedido exitoso
      alert('¡Pedido realizado con éxito! (demo mode)');
      
      await clearCart();

      alert(`¡Pedido confirmado! Número de orden: ${orderNumber}`);
      onNavigate('tracking');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear el pedido. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    onNavigate('cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Finalizar Pedido</h1>
          <p className="text-xl text-gray-300">
            Completa tu información para procesar el pedido
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Información de Entrega
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pedido
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, orderType: 'delivery' })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      formData.orderType === 'delivery'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, orderType: 'pickup' })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      formData.orderType === 'pickup'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Recoger en Tienda
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <User size={16} />
                    <span>Nombre Completo</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} />
                    <span>Teléfono</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>

                {formData.orderType === 'delivery' && (
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} />
                      <span>Dirección de Entrega</span>
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      rows={3}
                      required
                      placeholder="Calle, número, distrito, referencias..."
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText size={16} />
                    <span>Notas Especiales (Opcional)</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    rows={2}
                    placeholder="Ej: Sin cebolla, extra salsa..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Resumen
              </h2>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity}x {item.menu_item.name}
                    </span>
                    <span className="font-medium text-gray-900">
                      S/ {(item.menu_item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
                {formData.orderType === 'delivery' && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span>S/ 5.00</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    S/ {(total + (formData.orderType === 'delivery' ? 5 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
