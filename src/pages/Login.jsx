// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("admin"); // default role
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  // 🔑 Clear any old sessions when login page is opened
  useEffect(() => {
    localStorage.removeItem("auth");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("Logging in...");

    try {
      if (role === "admin") {
        // demo hardcoded admin login
        if (username === "admin" && password === "1234") {
          localStorage.setItem(
            "auth",
            JSON.stringify({
              isAuth: true,
              role: "admin",
              user: { name: "Admin" },
            })
          );
          navigate("/");
        } else {
          setStatus("Invalid admin credentials");
        }
      } else if (role === "faculty") {
        // call real API for faculty login
        const res = await fetch(`${API}/api/faculty/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setStatus(data.message || "Faculty login failed");
          return;
        }

        localStorage.setItem(
          "auth",
          JSON.stringify({
            isAuth: true,
            role: "faculty",
            user: { id: data.faculty.id, name: data.faculty.name },
          })
        );

        navigate("/faculty/dashboard");
      }
    } catch (err) {
      console.error(err);
      setStatus("Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          🔐 Login
        </h2>

        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
            >
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>

        {status && (
          <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-300">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
