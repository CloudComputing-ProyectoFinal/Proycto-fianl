import { ChevronRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const categories = [
    {
      id: 'hamburguesas',
      name: 'Hamburguesas',
      image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
      description: 'Nuestras legendarias hamburguesas con sabor único',
    },
    {
      id: 'entradas',
      name: 'Entradas',
      image: 'https://images.pexels.com/photos/12732/chicken-food-eating-9315.jpg',
      description: 'Alitas, deditos de pollo y más para compartir',
    },
    {
      id: 'acompañamientos',
      name: 'Acompañamientos',
      image: 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg',
      description: 'Papas fritas ilimitadas y mucho más',
    },
    {
      id: 'bebidas',
      name: 'Bebidas',
      image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
      description: 'Refrescos, limonadas y bebidas especiales',
    },
    {
      id: 'postres',
      name: 'Postres',
      image: 'https://images.pexels.com/photos/45202/brownie-dessert-cake-sweet-45202.jpeg',
      description: 'Brownies, helados y dulces irresistibles',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Bienvenido a TGI Fridays
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              La mejor experiencia en comida americana. Hamburguesas legendarias,
              alitas picantes y papas fritas ilimitadas te esperan.
            </p>
            <button
              onClick={() => onNavigate('menu')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <span>Ver Menú Completo</span>
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explora Nuestras Categorías
          </h2>
          <p className="text-lg text-gray-600">
            Descubre todos los sabores que tenemos para ti
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onNavigate('menu')}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                  {category.name}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex items-center text-red-600 font-semibold group-hover:text-red-700">
                  <span>Ver productos</span>
                  <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">¿Listo para ordenar?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Realiza tu pedido ahora y recíbelo en la puerta de tu casa
          </p>
          <button
            onClick={() => onNavigate('menu')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
          >
            Hacer un Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
