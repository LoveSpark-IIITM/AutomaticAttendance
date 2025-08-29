import * as faceapi from 'face-api.js'

const MODEL_URL = '/models'

export async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ])
}

export async function getDescriptorFromVideo(videoEl) {
  const det = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor()
  if (!det) return null
  return {
    descriptor: Array.from(det.descriptor),
    landmarks: det.landmarks, // for liveness
    box: det.detection.box
  }
}

// ----- Liveness (MVP): Blink + head movement over ~2s -----
// Uses Eye Aspect Ratio (EAR) from 68 landmarks. Indexes per dlib:
// Left eye: 36-41, Right eye: 42-47
function eyeAspectRatio(pts) {
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
  const p = pts
  const A = dist(p[1], p[5])
  const B = dist(p[2], p[4])
  const C = dist(p[0], p[3])
  return (A + B) / (2.0 * C)
}

function extractEyePoints(landmarks) {
  const all = landmarks.positions // length 68
  const L = all.slice(36, 42)
  const R = all.slice(42, 48)
  return { L, R }
}

export async function livenessCheck(videoEl, durationMs = 2000) {
  const start = performance.now()
  let frames = 0
  let blinkEvents = 0
  let lastEAR = null
  let yawMotion = 0 // crude: track horizontal nose movement
  let lastNoseX = null

  while (performance.now() - start < durationMs) {
    const det = await faceapi
      .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
    if (det) {
      const { L, R } = extractEyePoints(det.landmarks)
      const ear = (eyeAspectRatio(L) + eyeAspectRatio(R)) / 2
      if (lastEAR && lastEAR > 0.24 && ear < 0.20) blinkEvents++ // crude blink dip
      lastEAR = ear

      const nose = det.landmarks.positions[30] // nose tip
      if (lastNoseX !== null) yawMotion += Math.abs(nose.x - lastNoseX)
      lastNoseX = nose.x
    }
    frames++
    await new Promise(r => setTimeout(r, 60)) // ~16 fps
  }

  const blinkOk = blinkEvents >= 1
  const moveOk = yawMotion > 6 // slight head movement
  return { ok: blinkOk && moveOk, blinkEvents, yawMotion }
}

export function euclidean(a, b) {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i]
    s += d * d
  }
  return Math.sqrt(s)
}
