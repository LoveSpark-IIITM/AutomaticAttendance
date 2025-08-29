// src/pages/AttendanceList.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function AttendanceList() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalClass, setTotalClass]=useState(0);
  const API = import.meta.env.VITE_API_URL;
  useEffect(() => {
    if (!state) {
      navigate("/faculty/dashboard");
      return;
    }

    async function loadData() {
      try {
        // get all students of that batch + section
        const res1 = await fetch(
          `${API}/api/students?batch=${state.batch}&section=${state.section}`
        );
        const data1 = await res1.json();

        // get attendance records for this subject
        const res2 = await fetch(
          `${API}/api/attendance?subject=${state.subject}&batch=${state.batch}&section=${state.section}`
        );
        const data2 = await res2.json();
        setTotalClass(data2.total);

        setStudents((data1.students || []).sort((a, b) => a.roll - b.roll));
        setAttendance(data2.records || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [state, navigate]);

  // calculate % attendance for each student
  const calculatePercentage = (roll) => {
    const total = totalClass;
    const present = attendance.filter(
      (a) => a.roll === roll && a.status === "present"
    ).length;
    return total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
  };

  // filter attendance by date (if chosen)
  const isPresentOnDate = (roll) => {
    if (!selectedDate) return null;
    const record = attendance.find(
      (a) => a.roll === roll && a.date.startsWith(selectedDate)
    );
    return record ? record.status : "absent";
  };

  // export to excel
  const exportToExcel = () => {
    const rows = students.map((s) => ({
      Name: s.name,
      RollNo: s.roll,
      AttendancePercentage: calculatePercentage(s.roll),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(
      wb,
      `Attendance_${state.subject}_${state.batch}_${state.section}.xlsx`
    );
  };

  if (loading) return <p className="p-6 text-white">Loading...</p>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Attendance - {state.subject} ({state.batch}-{state.section})
        </h1>

        <div className="flex items-center gap-4 mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800"
          />
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 rounded"
          >
            📥 Export to Excel
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 rounded"
          >
            ⬅ Back
          </button>
        </div>

        <table className="w-full border border-gray-700 rounded overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 text-left">Roll No</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Attendance %</th>
              {selectedDate && <th className="p-2 text-left">Status ({selectedDate})</th>}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr
                key={s.roll}
                className="border-t border-gray-700 hover:bg-gray-800"
              >
                <td className="p-2">{s.roll}</td>
                <td className="p-2">{s.name}</td>
                <td className="p-2">{calculatePercentage(s.roll)}%</td>
                {selectedDate && (
                  <td className="p-2">
                    {isPresentOnDate(s.roll) === "present" ? (
                      <span className="text-green-400">Present</span>
                    ) : (
                      <span className="text-red-400">Absent</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
