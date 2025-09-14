
import React, { useState, useEffect } from 'react';
import { Game, Frame } from '../types';
import { calculateFrameScore } from '../utils/scoring';
import AnalysisModal from './AnalysisModal';
import { CameraIcon } from './icons/CameraIcon';
import CameraCapture from './CameraCapture';

interface ScorecardProps {
  game: Game;
  onUpdateGame: (game: Game) => void;
}

const Scorecard: React.FC<ScorecardProps> = ({ game, onUpdateGame }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [currentRollIndex, setCurrentRollIndex] = useState(0);
  const [showAnalysisModal, setShowAnalysisModal] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState<number | null>(null);

  useEffect(() => {
    // Logic to determine current frame/roll
    for (let i = 0; i < 10; i++) {
      const frame = game.frames[i];
      if (i < 9) {
        if (frame.rolls.length === 0 || (frame.rolls[0] !== 10 && frame.rolls.length === 1)) {
          setCurrentFrameIndex(i);
          setCurrentRollIndex(frame.rolls.length);
          return;
        }
      } else { // 10th frame
        const isStrike = frame.rolls[0] === 10;
        const isSpare = (frame.rolls[0] ?? 0) + (frame.rolls[1] ?? 0) === 10;
        if (frame.rolls.length < 3 && (isStrike || isSpare)) {
           setCurrentFrameIndex(i);
           setCurrentRollIndex(frame.rolls.length);
           return;
        }
        if (frame.rolls.length < 2 && !isStrike && !isSpare) {
           setCurrentFrameIndex(i);
           setCurrentRollIndex(frame.rolls.length);
           return;
        }
      }
    }
    // If all frames are full
    setCurrentFrameIndex(9);
    setCurrentRollIndex(3);
  }, [game.frames]);

  const handlePinEntry = (pins: number) => {
    const newFrames = JSON.parse(JSON.stringify(game.frames)) as Frame[];
    const frame = newFrames[currentFrameIndex];
    frame.rolls[currentRollIndex] = pins;

    // Recalculate all scores
    let runningTotal = 0;
    for (let i = 0; i < 10; i++) {
        const frameScore = calculateFrameScore(newFrames, i);
        if(frameScore !== null) {
            newFrames[i].score = (i > 0 ? (newFrames[i-1].score ?? 0) : 0) + frameScore;
            runningTotal = newFrames[i].score ?? 0;
        } else {
            newFrames[i].score = null;
        }
    }

    onUpdateGame({ ...game, frames: newFrames });
  };
  
  const handleVideoCaptured = (videoDataUrl: string, frameIndex: number) => {
      const newVideoFrames = {...game.videoFrames, [frameIndex]: videoDataUrl};
      onUpdateGame({ ...game, videoFrames: newVideoFrames });
      setShowCamera(null);
  };
  
  const PinInput: React.FC = () => {
    const pinsLeft = currentFrameIndex < 9 
      ? 10 - (game.frames[currentFrameIndex].rolls[0] ?? 0)
      : (
          (game.frames[9].rolls[0] === 10 || (game.frames[9].rolls[0] ?? 0) + (game.frames[9].rolls[1] ?? 0) === 10) && game.frames[9].rolls.length > 0
          ? 10 
          : 10 - (game.frames[9].rolls[1] ?? 0)
        );
    
    if (currentFrameIndex > 9 || (currentFrameIndex === 9 && game.frames[9].rolls.length >= 3) || (currentFrameIndex === 9 && (game.frames[9].rolls[0] ?? 0) + (game.frames[9].rolls[1] ?? 0) < 10 && game.frames[9].rolls.length === 2) ) {
        return <p className="text-center font-bold text-lg text-green-400">Game Over!</p>;
    }

    return (
        <div className="grid grid-cols-6 gap-2 p-2 bg-brand-bg rounded-lg">
            {Array.from({ length: Math.min(pinsLeft, 10) + 1 }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => handlePinEntry(i)}
                    className="bg-brand-primary text-white font-bold py-3 rounded-md hover:bg-indigo-500 transition-colors"
                >
                    {i}
                </button>
            ))}
        </div>
    );
  };


  if (showCamera !== null) {
      return <CameraCapture onCapture={(video) => handleVideoCaptured(video, showCamera)} onCancel={() => setShowCamera(null)} />
  }

  return (
    <div className="space-y-4">
      <div className="bg-brand-surface rounded-lg p-4">
        <h3 className="text-lg font-semibold text-center mb-2">Enter Pins for Frame {currentFrameIndex + 1}, Roll {currentRollIndex + 1}</h3>
        <PinInput />
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-10 gap-1 min-w-[700px]">
          {game.frames.map((frame, index) => (
            <div key={index} className="bg-brand-surface rounded-md shadow-sm border border-gray-700">
              <div className="text-center text-sm font-bold bg-gray-900/50 rounded-t-md p-1">
                {index + 1}
              </div>
              <div className="grid grid-cols-2">
                <div className="text-center p-2 text-lg font-semibold border-r border-b border-gray-700">
                  {frame.rolls[0] === 10 && index < 9 ? 'X' : frame.rolls[0]}
                </div>
                <div className="text-center p-2 text-lg font-semibold border-b border-gray-700">
                  {(frame.rolls[0] ?? 0) + (frame.rolls[1] ?? 0) === 10 && frame.rolls[0] !== 10 ? '/' : frame.rolls[1]}
                </div>
              </div>
               <div className="text-center py-2 text-xl font-bold h-[40px]">
                {frame.score}
               </div>
               <div className="p-1 border-t border-gray-700">
                 {game.videoFrames[index] ? (
                    <button onClick={() => setShowAnalysisModal(index)} className="w-full text-xs bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-2 rounded-sm transition-colors">
                      Analyze
                    </button>
                 ) : (
                    <button onClick={() => setShowCamera(index)} className="w-full bg-brand-primary hover:bg-indigo-500 text-white p-1 rounded-sm transition-colors flex items-center justify-center gap-1">
                       <CameraIcon className="w-4 h-4" />
                       <span className="text-xs font-semibold">Rec</span>
                    </button>
                 )}
               </div>
            </div>
          ))}
        </div>
      </div>
      {showAnalysisModal !== null && game.videoFrames[showAnalysisModal] && (
        <AnalysisModal 
          videoSrc={game.videoFrames[showAnalysisModal]} 
          onClose={() => setShowAnalysisModal(null)}
        />
      )}
    </div>
  );
};


export default Scorecard;
