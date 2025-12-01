import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import App from "@/App";
import { AuthPage } from "@/pages/AuthPage";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "../pages/NotFoundPage";

/**
 * Rutas para la aplicación administrativa/staff
 * Roles: ADMIN, CHEF_EXECUTIVE, COOK, DISPATCHER
 * 
 * Estructura:
 * - /dashboard - Vista principal según rol
 * - /dashboard/admin - Panel administrativo (solo ADMIN)
 * - /dashboard/admin/stats - Estadísticas
 * - /dashboard/admin/products - Gestión de productos
 * - /dashboard/admin/users - Gestión de usuarios
 * - /dashboard/chef-executive - Gestión de cocina y chefs (CHEF_EXECUTIVE)
 * - /dashboard/kitchen - Vista de cocina para cocineros (COOK)
 * - /dashboard/delivery - Vista de delivery (DISPATCHER)
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <ProtectedRoute />,
        children: [
          {
            path: "",
            element: <DashboardPage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "dashboard/admin",
            element: <DashboardPage />,
          },
          {
            path: "dashboard/admin/:section",
            element: <DashboardPage />,
          },
          {
            path: "dashboard/chef-executive",
            element: <DashboardPage />,
          },
          {
            path: "dashboard/kitchen",
            element: <DashboardPage />,
          },
          {
            path: "dashboard/delivery",
            element: <DashboardPage />,
          },
        ],
      },
      {
        path: "auth",
        element: <AuthPage />,
      },
      {
        path: "auth/login",
        element: <LoginPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;