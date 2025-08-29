import { Navigate } from "react-router-dom";

export default function FacultyRoute({ children }) {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  if (auth && auth.isAuth && auth.role === "faculty") {
    return children;
  }
  return <Navigate to="/login" />;
}
