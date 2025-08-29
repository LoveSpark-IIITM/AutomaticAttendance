// src/pages/Admin.jsx
import { useEffect, useState } from "react";

export default function Admin() {
  const [students, setStudents] = useState([]);
  const [batchFilter, setBatchFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [search, setSearch] = useState("");
  // const API="http://localhost:5000"
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API}/api/students/list`)
      .then((res) => res.json())
      .then((data) => {
        // if using Atlas version, it returns { students: [...] }
        setStudents(data.students || []); 
      })
      .catch(err => console.error(err));
  }, []);

  // Get unique batches and sections
  const uniqueBatches = [...new Set(students.map((s) => s.batch))].filter(Boolean);
  const uniqueSections = [...new Set(students.map((s) => s.section))].filter(Boolean);

  // Apply filters + search
  const filtered = students.filter((s) => {
    const matchesBatch = batchFilter ? s.batch === batchFilter : true;
    const matchesSection = sectionFilter ? s.section === sectionFilter : true;
    const matchesSearch =
      search.trim() === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll.toString().includes(search);

    return matchesBatch && matchesSection && matchesSearch;
  });

  // Group filtered students
  const grouped = filtered.reduce((acc, s) => {
    const key = `${s.batch || "Unknown"}-${s.section || "?"}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8">📊 Admin Dashboard</h1>

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="p-3 flex-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Batches</option>
          {uniqueBatches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="p-3 flex-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Sections</option>
          {uniqueSections.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by Name or Roll No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 flex-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Student Groups */}
      {Object.entries(grouped).map(([group, groupStudents]) => {
        const [cls, sec] = group.split("-");
        return (
          <div key={group} className="mb-12">
            <h2 className="text-2xl font-semibold mb-5 border-b border-gray-700 pb-2">
              Batch {cls} - Section {sec}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {groupStudents.map((s) => (
                <div
                  key={s.roll}
                  className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-indigo-500/30 transition"
                >
                  <h3 className="text-lg font-bold mb-2">{s.name}</h3>
                  <p className="text-gray-300">
                    <span className="font-semibold">Roll:</span> {s.roll}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold">Batch:</span> {s.batch}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold">Section:</span> {s.section}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {filtered.length === 0 && (
        <p className="text-gray-400 text-center mt-10">No students found.</p>
      )}
    </div>
  );
}
