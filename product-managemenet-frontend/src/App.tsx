import { useRoutes, Navigate, useLocation } from "react-router-dom";
import Login from "./views/login/Login";
import { useAuthStore } from "./store/auth.store";
import Dashboard from "./components/dashboard/Dashboard";
import Products from "./views/products/Products";
import Register from "./views/register/Register";
import Favorites from "./views/favorites/Favorites";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  if (
    isAuthenticated == false &&
    !["/register", "/login"].includes(location.pathname)
  ) {
    return <Navigate to="/login" />;
  }
  if (isAuthenticated == true && location.pathname == "/login") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const routes = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
      children: [
        {
          index: true,
          element: <Products />,
        },
        {
          path: "/favs",
          element: <Favorites />,
        }
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/*",
      element: <h1>404</h1>,
    },
  ]);
  return <ProtectedRoute>{routes}</ProtectedRoute>;
}

export default App;
