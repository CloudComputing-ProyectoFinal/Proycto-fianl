import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-red-600 mb-4">404</h1>
          <div className="h-1 w-32 bg-red-600 mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-4">
            ¡Oops! Página no encontrada
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver atrás
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </button>
        </div>

        <div className="mt-12 text-gray-500 text-sm">
          <p>¿Necesitas ayuda? Visita nuestro menú o contacta con soporte.</p>
        </div>
      </div>
    </div>
  );
}
