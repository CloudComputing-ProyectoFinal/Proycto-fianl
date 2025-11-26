import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/forms/RegisterForm';

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            TGI FRIDAYS
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <RegisterForm onSwitchToLogin={() => navigate('/auth/login')} />

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
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
