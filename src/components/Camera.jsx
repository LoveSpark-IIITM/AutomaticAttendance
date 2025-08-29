import { useEffect, forwardRef } from 'react';

const Camera = forwardRef(({ width = 480, height = 360 }, ref) => {
  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (ref.current) {
          ref.current.srcObject = stream;
          await ref.current.play();
        }
      } catch (e) {
        console.error('Camera error:', e);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <video
      ref={ref}
      width={width}
      height={height}
      autoPlay
      playsInline
      style={{ borderRadius: 12, border: '1px solid #e5e7eb' }}
    />
  );
});

export default Camera;
