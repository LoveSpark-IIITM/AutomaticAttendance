import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-10 text-center tracking-wide bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
        Attendance Monitoring System
      </h1>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl">
        <Link
          to="/enroll"
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-105 transition transform duration-300 hover:bg-blue-600/30"
        >
          <h2 className="text-xl font-semibold mb-2">📋 Enroll Student</h2>
          <p className="text-gray-300 text-sm">
            Register new students with face recognition data.
          </p>
        </Link>

        <Link
          to="/admin/update"
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-105 transition transform duration-300 hover:bg-green-600/30"
        >
          <h2 className="text-xl font-semibold mb-2">✅ Add/Update Faculty</h2>
          <p className="text-gray-300 text-sm">
            Record attendance instantly with face matching.
          </p>
        </Link>

        <Link
          to="/admin"
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-105 transition transform duration-300 hover:bg-purple-600/30"
        >
          <h2 className="text-xl font-semibold mb-2">⚙️ Admin Dashboard</h2>
          <p className="text-gray-300 text-sm">
            Manage attendance records and student data.
          </p>
        </Link>
      </div>

    </div>
  );
}
