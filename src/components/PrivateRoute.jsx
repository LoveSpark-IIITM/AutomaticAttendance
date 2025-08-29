import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");

  // Check auth exists and user is admin
  if (auth && auth.isAuth && auth.role === "admin") {
    return children;
  }

  return <Navigate to="/login" />;
}
