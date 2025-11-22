import { ShoppingCart, User, LogOut, Home, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  currentPage?: string;
}

export function Navbar({ currentPage }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const profileName = (profile as any)?.name ?? '';
  const profileRole = String((profile as any)?.role ?? '');

  return (
    <nav className="bg-black text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-red-600 hover:text-red-500 transition-colors"
            >
              TGI FRIDAYS
            </button>

            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => navigate('/')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'home'
                    ? 'bg-red-600 text-white'
                    : 'hover:bg-gray-800'
                }`}
              >
                <Home size={20} />
                <span>Inicio</span>
              </button>

              <button
                onClick={() => navigate('/menu')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'menu'
                    ? 'bg-red-600 text-white'
                    : 'hover:bg-gray-800'
                }`}
              >
                <Package size={20} />
                <span>Menú</span>
              </button>

              {profileRole !== 'cliente' && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-red-600 text-white'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {profile ? (
              <>
                {profileRole === 'cliente' && (
                  <button
                    onClick={() => navigate('/cart')}
                    className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ShoppingCart size={24} />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </button>
                )}

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
                    <User size={20} />
                    <div className="text-left">
                      <div className="text-sm font-medium">{profileName}</div>
                      <div className="text-xs text-gray-400 capitalize">{profileRole}</div>
                    </div>
                  </div>

                  <button
                    onClick={signOut}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate('/auth/login')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
