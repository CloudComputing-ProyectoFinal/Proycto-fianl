import { createBrowserRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { HomePage } from "@/pages/HomePage";
import { MenuPage } from "@/pages/MenuPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { AuthPage } from "@/pages/AuthPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { OrderTrackingPage } from "@/pages/OrderTrackingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { Navbar } from "@/components/Navbar";

// Wrappers para páginas que necesitan Navbar
function HomePageWrapper() {
  return (
    <>
      <Navbar currentPage="home" />
      <HomePage />
    </>
  );
}

function MenuPageWrapper() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar currentPage="menu" />
      <MenuPage onNavigate={(page) => navigate(`/${page === 'home' ? '' : page}`)} />
    </>
  );
}

function CartPageWrapper() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar currentPage="cart" />
      <CartPage onNavigate={(page) => navigate(`/${page === 'home' ? '' : page}`)} />
    </>
  );
}

function CheckoutPageWrapper() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar currentPage="checkout" />
      <CheckoutPage onNavigate={(page) => navigate(`/${page === 'home' ? '' : page}`)} />
    </>
  );
}

function AuthPageWrapper() {
  const navigate = useNavigate();
  return <AuthPage onNavigate={(page) => navigate(`/${page === 'home' ? '' : page}`)} />;
}

function OrderTrackingPageWrapper() {
  return (
    <>
      <Navbar currentPage="tracking" />
      <OrderTrackingPage />
    </>
  );
}

function DashboardPageWrapper() {
  return (
    <>
      <Navbar currentPage="dashboard" />
      <DashboardPage />
    </>
  );
}

/**
 * Rutas principales para el sistema de restaurante
 * Roles soportados: USUARIO, COCINERO, DESPACHADOR, ADMIN
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePageWrapper />,
  },
  {
    path: "/menu",
    element: <MenuPageWrapper />,
  },
  {
    path: "/auth",
    element: <AuthPageWrapper />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/register",
    element: <RegisterPage />,
  },
  {
    path: "/cart",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <CartPageWrapper />,
      },
    ],
  },
  {
    path: "/checkout",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <CheckoutPageWrapper />,
      },
    ],
  },
  {
    path: "/tracking",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <OrderTrackingPageWrapper />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <DashboardPageWrapper />,
      },
    ],
  },
  {
    path: "*",
    element: <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-4">Página no encontrada</p>
        <a href="/" className="text-red-600 hover:text-red-700 font-medium">
          Volver al inicio
        </a>
      </div>
    </div>,
  },
]);

export default router;