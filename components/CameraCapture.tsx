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

  // 外カメラ優先で起動
  const startCamera = useCallback(async () => {
    try {
      // まず facingMode で試す（初回アクセス用）
      let constraints: MediaStreamConstraints = {
        video: { facingMode: 'environment' },
        audio: false
      };

      // すでに許可済みなら enumerateDevices で外カメラを探す
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const backCamera = videoDevices.find(d =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('environment')
      );

      if (backCamera) {
        constraints = {
          video: { deviceId: { exact: backCamera.deviceId } },
          audio: false
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("カメラにアクセスできませんでした。外カメラが存在しないか、権限が拒否されています。");
    }
  }, []);

  // カメラ停止
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // 初期化＆クリーンアップ
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // 録画開始（3秒カウントダウン → 5秒録画）
  const handleStartRecording = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => (prev !== null && prev > 1 ? prev - 1 : null));
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
            setRecordedChunks(prev => [...prev, event.data]);
          }
        };

        mediaRecorder.start();

        setTimeout(() => {
          handleStopRecording();
        }, 5000); // 5秒録画
      }
    }, 3000); // 3秒カウントダウン
  };

  // 録画停止
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 録画完了 → base64 変換 → onCapture
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
  }, [isRecording, recordedChunks, onCapture, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      {error && (
        <div className="absolute top-5 bg-red-500 text-white p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="relative w-full max-w-md aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        ></video>

        {isRecording && (
          <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        )}

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
        <button
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          className="bg-gray-700 text-white font-bold py-3 px-6 rounded-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;