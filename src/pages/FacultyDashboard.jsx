// src/pages/FacultyDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FacultyDashboard() {
  const [faculty, setFaculty] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const f = JSON.parse(localStorage.getItem("auth") || "null");
    if (!f) {
      navigate("/faculty/login");
      return;
    }
    setFaculty(f.user);
    // load subjects for this faculty
    fetch(`${API}/api/faculty/${f.user.id}/subjects`)
      .then(res => res.json())
      .then(data => setSubjects(data.subjects || []));
  }, []);

  if (!faculty) return null;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Welcome, {faculty.name}</h1>
        </div>

        <h2 className="text-xl mb-4">Your Subjects</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {subjects.map((s, idx) => (
            <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg">{s.subject}</h3>
              <p className="text-gray-300">Batch: {s.batch} | Section: {s.section}</p>
              <div className="mt-3 flex gap-2">
                <button
                  className="px-3 py-2 bg-green-600 rounded"
                  onClick={() => navigate("/faculty/take-attendance", { state: { subject: s.subject, batch: s.batch, section: s.section } })}
                >
                  Take Attendance
                </button>
                <button
                  className="px-3 py-2 bg-blue-600 rounded"
                  onClick={() => navigate("/attendance/list", { state: { subject: s.subject, batch: s.batch, section: s.section } })}
                >
                  View Attendance
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
