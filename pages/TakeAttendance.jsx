// src/pages/TakeAttendance.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Camera from "../components/Camera"; // your existing camera
import { getDescriptorFromVideo, loadModels } from "../lib/face"; // existing helpers

export default function TakeAttendance() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { subject, batch, section } = loc.state || {};
  const videoRef = useRef(null);
  const [status, setStatus] = useState("Loading models...");
  const [capturing, setCapturing] = useState(false);
  const [results, setResults] = useState(null);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    (async () => {
      await loadModels();
      setStatus("Models loaded. Ready.");
    })();
  }, []);

  // helper: convert Float32Array to plain array
  function toArray(desc) {
    if (!desc) return null;
    return Array.from(desc);
  }

  // collect descriptors during the capture window
  async function startCapture() {
    if (!videoRef.current) return;
    setCapturing(true);
    setStatus("Starting camera - looking for faces...");

    const collected = []; // Array of descriptor arrays
    const startAt = Date.now();
    const CAPTURE_DURATION = 5000; // 5s window to collect faces
    const INTERVAL = 700; // check every 700ms

    const timer = setInterval(async () => {
      const det = await getDescriptorFromVideo(videoRef.current);
      if (det && det.descriptor) {
        const arr = toArray(det.descriptor);
        // naive dedupe: skip if very similar to already collected descriptors
        let skip = false;
        for (const c of collected) {
          // cosine similarity
          const dot = c.reduce((acc, v, i) => acc + v * arr[i], 0);
          const mag1 = Math.sqrt(c.reduce((acc, v) => acc + v * v, 0));
          const mag2 = Math.sqrt(arr.reduce((acc, v) => acc + v * v, 0));
          const cos = dot / (mag1 * mag2);
          if (cos > 0.95) {
            skip = true;
            break;
          }
        }
        if (!skip) collected.push(arr);
        setStatus(`Detected faces: ${collected.length}`);
      }

      if (Date.now() - startAt > CAPTURE_DURATION) {
        clearInterval(timer);
        setStatus("Capture finished. Sending for matching...");
        // send to backend
        await sendAttendance(collected);
        setCapturing(false);
      }
    }, INTERVAL);
  }

  async function sendAttendance(descriptors) {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      const faculty=auth.user;
      const payload = {
        facultyId: faculty.id,
        subject,
        batch,
        section,
        timestamp: new Date().toISOString(),
        detectedDescriptors: descriptors, // arrays of numbers
      };

      const res = await fetch(`${API}/api/attendance/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("Error marking attendance: " + (data.message || "unknown"));
      } else {
        setStatus("Attendance recorded.");
        setResults(data.record);
      }
    } catch (err) {
      console.error(err);
      setStatus("Network error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button className="mb-4 text-sm text-gray-300" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="text-2xl font-bold mb-4">Take Attendance</h1>
        <p className="text-gray-300 mb-2">Subject: <strong>{subject}</strong> — Batch: <strong>{batch}</strong> — Section: <strong>{section}</strong></p>
        <p className="text-sm text-gray-400 mb-4">{status}</p>

        <div className="bg-gray-800 p-4 rounded mb-4">
          <Camera ref={videoRef} />
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-green-600 rounded" onClick={startCapture} disabled={capturing}>
            {capturing ? "Capturing..." : "Start Capture (5s)"}
          </button>
          <button className="px-4 py-2 bg-gray-700 rounded" onClick={() => {
            setStatus("Ready.");
            setResults(null);
          }}>
            Reset
          </button>
        </div>

        {results && (
          <div className="mt-6 bg-gray-800 p-4 rounded">
            <h3 className="font-semibold mb-2">Attendance Result</h3>
            <p className="text-sm text-gray-300">Timestamp: {results.timestamp}</p>
            <p className="mt-2">Present Rolls: {results.present.join(", ") || "None"}</p>
            <div className="mt-3">
              <h4 className="font-medium">Matches</h4>
              <ul className="list-disc ml-5">
                {results.matches.map((m, i) => (
                  <li key={i} className="text-gray-300">{m.name} ({m.roll}) — score: {m.score.toFixed(3)}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
