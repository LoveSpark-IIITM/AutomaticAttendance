import { useEffect, useRef, useState } from "react";
import { loadModels, getDescriptorFromVideo } from "../lib/face";
import Camera from "../components/Camera";

const API = import.meta.env.VITE_API_URL;
//const VALIDATOR_API = "http://localhost:8001"; // FastAPI face validator
const VALIDATOR_API = "https://face-detection-clok.onrender.com";

export default function Enroll() {
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [batch, setStudentClass] = useState("");  // NEW
  const [section, setSection] = useState("");            // NEW
  const [status, setStatus] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [pendingEmbedding, setPendingEmbedding] = useState(null);

  const videoRef = useRef(null);
  const captureTimer = useRef(null);

  // load face-api models once
  useEffect(() => {
    (async () => {
      await loadModels();
      setLoaded(true);
    })();
  }, []);

  function enableCamera() {
    if (!name || !roll || !batch || !section) {
      setStatus("❌ Enter all details before enabling camera.");
      return;
    }
    setCameraOn(true);
    setStatus("📷 Camera enabled. Align face in frame.");
  }

  // Watch face until valid capture
  useEffect(() => {
    if (!cameraOn || !videoRef.current) return;

    captureTimer.current = setInterval(async () => {
      const det = await getDescriptorFromVideo(videoRef.current);
      if (!det) return; // no face yet

      if (
        det.landmarks &&
        det.landmarks.getLeftEye().length > 0 &&
        det.landmarks.getRightEye().length > 0
      ) {
        const video = videoRef.current;
        if (!video || video.readyState !== 4) return;

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL("image/png");

        setPreviewImg(imageUrl);
        setPendingEmbedding(det.descriptor);
        setCameraOn(false);
        setStatus("✅ Face captured. Validating...");
        clearInterval(captureTimer.current);

        try {
          const res = await fetch(`${VALIDATOR_API}/validate-base64`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageUrl }),
          });
          const data = await res.json();
          if (!res.ok || !data.ok) {
            setStatus("❌ Validation failed: " + (data.reasons?.join("; ") || "Unknown"));
            setPreviewImg(null);
            setPendingEmbedding(null);
            setCameraOn(true);
          } else {
            
            setStatus("✅ Face validated. Review before submitting.");
          }
        } catch (err) {
          console.error(err);
          setStatus("❌ Error validating face");
          setPreviewImg(null);
          setPendingEmbedding(null);
          setCameraOn(true);
        }
      }
    }, 1000);

    return () => clearInterval(captureTimer.current);
  }, [cameraOn]);

  async function submitEnrollment() {
    setCameraOn(false);
    if (!pendingEmbedding) {
      return setStatus("❌ No captured face to submit.");
    }
    setStatus("Uploading...");

    try {
      const res = await fetch(`${API}/api/students/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll,
          name,
          batch: batch,  // NEW
          section,              // NEW
          embedding: pendingEmbedding
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("❌ " + data.error);
      } else {
        if (data.duplicate) {
          setStatus("⚠️ " + data.message);
        } else {
          setStatus("✅ " + data.message);
        }
        setPreviewImg(null);
        setPendingEmbedding(null);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Error enrolling");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
        <h2 className="text-3xl font-bold text-center mb-6">📝 Enroll Student</h2>

        {!loaded && <p className="text-gray-400 text-center">Loading models…</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student Name"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Roll</label>
            <input
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              placeholder="Roll Number"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Class</label>
            <input
              value={batch}
              onChange={(e) => setStudentClass(e.target.value)}
              placeholder="Batch (e.g., 2023)"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Section</label>
            <input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="Section (e.g., A)"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>
        </div>

        {/* Enable Camera */}
        {!cameraOn && !previewImg && (
          <button
            onClick={enableCamera}
            disabled={!name || !roll || !batch || !section}
            className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded-lg transition font-semibold"
          >
            Enable Camera
          </button>
        )}

        {/* Camera View */}
        {cameraOn && (
          <div className="mt-6 flex flex-col items-center">
            <Camera ref={videoRef} />
            <p className="text-sm text-gray-400 mt-2">
              📷 Auto-capturing when face is visible...
            </p>
          </div>
        )}

        {/* Preview */}
        {previewImg && (
          <div className="mt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <img
              src={previewImg}
              alt="Captured face"
              className="w-60 h-auto rounded-lg border border-gray-700 shadow-md mx-auto"
            />
            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={submitEnrollment}
                className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition font-semibold"
              >
                Confirm & Submit
              </button>
              <button
                onClick={() => {
                  setPreviewImg(null);
                  setPendingEmbedding(null);
                  setCameraOn(true);
                  setStatus("Camera re-enabled. Try again.");
                }}
                className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition font-semibold"
              >
                Retake
              </button>
            </div>
          </div>
        )}

        {/* Status */}
        <p
          className={`mt-6 text-center font-medium ${
            status.includes("✅")
              ? "text-green-400"
              : status.includes("⚠️")
              ? "text-yellow-400"
              : "text-red-400"
          }`}
        >
          {status}
        </p>

        <p className="text-xs text-gray-400 text-center mt-2">
          💡 Ensure good lighting. Face straight with both eyes visible.
        </p>
      </div>
    </div>
  );
}
