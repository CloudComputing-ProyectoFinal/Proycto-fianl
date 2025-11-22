import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';

/**
 * Layout principal de la aplicación
 * Contiene el Navbar y el contenido de las rutas hijas vía Outlet
 */
export default function App() {
  const location = useLocation();
  
  // Obtener la página actual desde la ruta
  const getCurrentPage = () => {
    const path = location.pathname.split('/')[1] || 'home';
    return path;
  };

  // Rutas que no deben mostrar el Navbar
  const hideNavbarRoutes = ['/auth', '/auth/login', '/auth/register'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar currentPage={getCurrentPage()} />}
      <Outlet />
    </>
  );
}
