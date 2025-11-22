import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useCart } from '../hooks/useCart';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

interface MenuPageProps {
  onNavigate: (page: string) => void;
}

export function MenuPage({ onNavigate: _onNavigate }: MenuPageProps) {
  const [menuItems] = useState<MenuItem[]>([]);
  const [loading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addToCart } = useCart();

  const categories = [
    { id: 'all', name: 'Todo' },
    { id: 'hamburguesas', name: 'Hamburguesas' },
    { id: 'entradas', name: 'Entradas' },
    { id: 'acompañamientos', name: 'Acompañamientos' },
    { id: 'bebidas', name: 'Bebidas' },
    { id: 'postres', name: 'Postres' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = async (itemId: string) => {
    await addToCart(itemId, 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Nuestro Menú</h1>
          <p className="text-xl text-gray-300">
            Descubre nuestros platos más deliciosos
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Categorías</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.image_url || 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  <span className="text-2xl font-bold text-red-600">
                    S/ {item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.available ? 'Disponible' : 'No disponible'}
                  </span>
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={!item.available}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      item.available
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus size={20} />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">
              No hay productos disponibles en esta categoría
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
