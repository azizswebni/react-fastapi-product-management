import { useRoutes, Navigate } from "react-router-dom";
import Login from "./views/login/Login";


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  
  if (true) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const routes = useRoutes([
    {
      path: "/",
      element: <ProtectedRoute><h1>Home</h1></ProtectedRoute>
    },
    {
      path: "/login",
      element: <Login />
    },{
      path: "/*",
      element: <h1>404</h1>
    }
  ]);
  return routes;
}

export default App
