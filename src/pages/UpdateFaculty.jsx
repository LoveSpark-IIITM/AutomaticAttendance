import { useEffect, useState } from "react";
import { Pencil, UserPlus, Plus, Trash2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function AdminFaculty() {
  const [faculties, setFaculties] = useState([]);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    id: "",
    subjects: [{ subject: "", batch: "", section: "" }],
  });
  const [editId, setEditId] = useState(null);

  // fetch all faculty
  const loadFaculties = async () => {
    const data = await fetch(`${API}/api/faculty/list`).then((res) => res.json());
    setFaculties(data.faculty || []);
  };

  useEffect(() => {
    loadFaculties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${API}/api/faculty/${editId}/update`
      : `${API}/api/faculty/add`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({
      name: "",
      username: "",
      password: "",
      id: "",
      subjects: [{ subject: "", batch: "", section: "" }],
    });
    setEditId(null);
    loadFaculties();
  };

  const handleEdit = (faculty) => {
    setForm(faculty);
    setEditId(faculty.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (facultyId) => {
    if (window.confirm("Are you sure you want to delete this faculty?")) {
      await fetch(`${API}/api/faculty/${facultyId}/delete`, {
        method: "DELETE",
      });
      loadFaculties();
    }
  };

  // handle subject input
  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...form.subjects];
    updatedSubjects[index][field] = value;
    setForm({ ...form, subjects: updatedSubjects });
  };

  const addSubjectField = () => {
    setForm({
      ...form,
      subjects: [...form.subjects, { subject: "", batch: "", section: "" }],
    });
  };

  const removeSubjectField = (index) => {
    const updatedSubjects = form.subjects.filter((_, i) => i !== index);
    setForm({ ...form, subjects: updatedSubjects });
  };

  const inputClass =
    "w-full p-3 rounded-xl bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-8 text-gray-100 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <UserPlus className="w-8 h-8 text-blue-400" /> Manage Faculty
      </h1>

      {/* Faculty Form */}
      <div className="bg-gray-800/70 rounded-2xl p-6 shadow-xl mb-10 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">
          {editId ? "Update Faculty" : "Add New Faculty"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            placeholder="Faculty Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            required
          />
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className={inputClass}
            required
          />
          <input
            placeholder="Faculty ID"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            className={inputClass}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
            required={!editId}
          />

          {/* Subject fields */}
          <div className="col-span-full mt-4">
            <h3 className="text-lg font-medium mb-2">Subjects</h3>
            {form.subjects.map((s, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 mb-2 items-center">
                <input
                  placeholder="Subject"
                  value={s.subject}
                  onChange={(e) =>
                    handleSubjectChange(i, "subject", e.target.value)
                  }
                  className={inputClass}
                />
                <input
                  placeholder="Batch"
                  value={s.batch}
                  onChange={(e) =>
                    handleSubjectChange(i, "batch", e.target.value)
                  }
                  className={inputClass}
                />
                <input
                  placeholder="Section"
                  value={s.section}
                  onChange={(e) =>
                    handleSubjectChange(i, "section", e.target.value)
                  }
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeSubjectField(i)}
                  className="bg-red-600 hover:bg-red-500 p-2 rounded-lg flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSubjectField}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg mt-2 transition"
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>

          <button className="bg-blue-600 hover:bg-blue-500 transition px-6 py-3 rounded-xl font-semibold col-span-full mt-4">
            {editId ? "Update Faculty" : "Add Faculty"}
          </button>
        </form>
      </div>

      {/* Faculty Table */}
      <div className="overflow-x-auto bg-gray-800/70 rounded-2xl shadow-xl border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-900/80 text-gray-300 uppercase text-sm">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Faculty ID</th>
              <th className="px-4 py-3">Subjects</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {faculties.map((f) => (
              <tr
                key={f._id}
                className="border-b border-gray-700 hover:bg-gray-700/30 transition"
              >
                <td className="px-4 py-3">{f.name}</td>
                <td className="px-4 py-3">{f.username}</td>
                <td className="px-4 py-3">{f.id}</td>
                <td className="px-4 py-3">
                  {f.subjects?.map((s, i) => (
                    <div key={i} className="text-sm text-gray-300">
                      {s.subject} ({s.batch}-{s.section})
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded-lg transition"
                    onClick={() => handleEdit(f)}
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg transition"
                    onClick={() => handleDelete(f.id)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {faculties.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No faculty records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

