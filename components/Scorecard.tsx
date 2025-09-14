{game.videoFrames[index] && import.meta.env.VITE_API_KEY ? (
  <button
    onClick={() => setShowAnalysisModal(index)}
    className="w-full text-xs bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-2 rounded-sm transition-colors"
  >
    Analyze
  </button>
) : (
  <button
    onClick={() => setShowCamera(index)}
    className="w-full bg-brand-primary hover:bg-indigo-500 text-white p-1 rounded-sm transition-colors flex items-center justify-center gap-1"
  >
    <CameraIcon className="w-4 h-4" />
    <span className="text-xs font-semibold">Rec</span>
  </button>
)}