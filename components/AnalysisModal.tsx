
import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { analyzeBowlingForm } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

interface AnalysisModalProps {
  videoSrc: string;
  onClose: () => void;
}

const PRO_VIDEO_URL = "https://videos.pexels.com/video-files/8099385/8099385-hd_720_1366_25fps.mp4"; // Placeholder

const AnalysisModal: React.FC<AnalysisModalProps> = ({ videoSrc, onClose }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const getFrameAsBase64 = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      if (!video) {
        reject('Video element not found.');
        return;
      }
      
      const captureFrame = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Could not get canvas context.');
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl.split(',')[1]);
        video.removeEventListener('seeked', captureFrame);
      };

      video.addEventListener('seeked', captureFrame);
      video.currentTime = 1; // Capture frame at 1 second
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        captureFrame();
      }
    });
  };


  const handleAnalyze = async () => {
    setIsLoading(true);
    setError('');
    setAnalysis('');
    try {
      const base64Image = await getFrameAsBase64();
      const result = await analyzeBowlingForm(base64Image);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze the form.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Allow closing with escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-brand-text">Form Analysis</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <div className="flex-grow flex flex-col md:flex-row overflow-y-auto">
          {/* Video Player Section */}
          <div className="w-full md:w-1/2 p-4 flex flex-col gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-brand-text-secondary">Your Form</h3>
              <VideoPlayer src={videoSrc} ref={videoRef} />
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-brand-text-secondary">Pro Comparison</h3>
              <VideoPlayer src={PRO_VIDEO_URL} />
            </div>
          </div>
          
          {/* AI Analysis Section */}
          <div className="w-full md:w-1/2 p-4 bg-brand-bg flex flex-col">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              <SparklesIcon className="w-5 h-5" />
              {isLoading ? 'Analyzing...' : 'Get AI Analysis'}
            </button>
            
            <div className="flex-grow overflow-y-auto pr-2">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                </div>
              )}
              {error && <p className="text-red-400">{error}</p>}
              {analysis && (
                <div className="prose prose-invert prose-sm text-brand-text-secondary" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
