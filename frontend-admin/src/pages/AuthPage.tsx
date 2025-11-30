import { useState } from 'react';
import { LoginForm } from '../components/forms/LoginForm';
import { RegisterForm } from '../components/forms/RegisterForm';

interface AuthPageProps {
  onNavigate: (page: string) => void;
}

export function AuthPage({ onNavigate }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            TGI FRIDAYS
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Registrarse
            </button>
          </div>

          {isLogin ? (
            <LoginForm />
          ) : (
            <RegisterForm />
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
