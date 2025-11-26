import { useEffect, useState } from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export function UserDashboard() {
  const navigate = useNavigate();
  const { itemCount: hookItemCount } = useCart();
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const readLocalCart = () => {
      try {
        const raw = localStorage.getItem('cart');
        if (!raw) {
          setCartCount(hookItemCount || 0);
          return;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const count = parsed.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0);
          setCartCount(count || hookItemCount || 0);
        } else {
          setCartCount(hookItemCount || 0);
        }
      } catch (e) {
        setCartCount(hookItemCount || 0);
      }
    };

    readLocalCart();

    // listen for storage events (other tabs)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cart') readLocalCart();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [hookItemCount]);

  const clearLocalCart = () => {
    localStorage.removeItem('cart');
    setCartCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Mi Cuenta</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Navegación</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/menu')}
                className="flex items-center gap-3 px-4 py-3 border rounded hover:bg-gray-50"
              >
                <Package />
                <span>Ver Menú</span>
              </button>

              <button
                onClick={() => navigate('/cart')}
                className="flex items-center gap-3 px-4 py-3 border rounded hover:bg-gray-50"
              >
                <ShoppingCart />
                <span>Ver Carrito</span>
                <span className="ml-auto font-medium">{cartCount}</span>
              </button>

              <button
                onClick={clearLocalCart}
                className="mt-4 px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Vaciar carrito (local)
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Resumen del Carrito</h2>
            {cartCount === 0 ? (
              <p className="text-gray-600">Tu carrito está vacío.</p>
            ) : (
              <p className="text-gray-600">Tienes {cartCount} item(s) en tu carrito.</p>
            )}

            <div className="mt-6">
              <button
                onClick={() => navigate('/menu')}
                className="px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 mr-3"
              >
                Seguir comprando
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="px-4 py-3 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Ir al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
