
import React, { useRef, useState, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (videoDataUrl: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions.");
    }
  }, []);
  
  const stopCamera = useCallback(() => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
    }
  }, [stream]);
  
  useEffect(() => {
    startCamera();
    return () => {
        stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCamera]);

  const handleStartRecording = () => {
    setCountdown(3);
    const timer = setInterval(() => {
        setCountdown(prev => (prev !== null && prev > 1) ? prev - 1 : null);
    }, 1000);

    setTimeout(() => {
        clearInterval(timer);
        if (stream && videoRef.current) {
            setIsRecording(true);
            const options = { mimeType: 'video/webm; codecs=vp9' };
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                setRecordedChunks((prev) => [...prev, event.data]);
              }
            };
            mediaRecorder.start();

            setTimeout(() => {
                handleStopRecording();
            }, 5000); // Record for 5 seconds
        }
    }, 3000);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  useEffect(() => {
    if (!isRecording && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
          onCapture(reader.result as string);
      };
      reader.readAsDataURL(blob);
      setRecordedChunks([]);
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, recordedChunks, onCapture]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      {error && <div className="absolute top-5 bg-red-500 text-white p-4 rounded-md">{error}</div>}
      <div className="relative w-full max-w-md aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
        {isRecording && <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>}
        {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-9xl font-bold">{countdown}</div>
            </div>
        )}
      </div>
      <div className="mt-4 flex gap-4">
        {!isRecording && countdown === null && (
            <button
              onClick={handleStartRecording}
              disabled={!stream || isRecording}
              className="bg-red-600 text-white font-bold py-3 px-6 rounded-full disabled:bg-gray-500"
            >
              Record Form (5s)
            </button>
        )}
        <button onClick={()=>{stopCamera(); onCancel();}} className="bg-gray-700 text-white font-bold py-3 px-6 rounded-full">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
