import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Enroll from "./pages/Enroll.jsx";
import Admin from "./pages/Admin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import FacultyRoute from "./components/FacultyRoute.jsx";
import Login from "./pages/Login.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import TakeAttendance from "./pages/TakeAttendance.jsx";
import AttendanceList from "./pages/AttendanceList.jsx";
import { useEffect, useState } from "react";

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(localStorage.getItem("auth") === "true");

  useEffect(() => {
    // Re-check auth whenever route changes
    setIsAuth(localStorage.getItem("auth"));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <div>
      {/* ✅ Show logout button only when logged in and not on login page */}
      {isAuth && location.pathname !== "/login" && (
        <button
          onClick={handleLogout}
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            zIndex: 1000
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 6px 12px rgba(0,0,0,0.25)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
          }}
        >
          🚪 Logout
        </button>
      )}

      <div>{children}</div>
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/faculty/dashboard" element={
          <FacultyRoute>
            <FacultyDashboard />
          </FacultyRoute>
        }></Route>
        <Route path="/faculty/take-attendance" element={
          <FacultyRoute>
            <TakeAttendance />
          </FacultyRoute>
        }></Route>
        <Route path="/attendance/list" element={
          <FacultyRoute>
            <AttendanceList />
          </FacultyRoute>
        }/>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/enroll"
          element={
            <PrivateRoute>
              <Enroll />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
