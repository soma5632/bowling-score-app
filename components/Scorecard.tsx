import React, { useState, useEffect, useMemo } from 'react';
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

  // ゲーム終了判定
  const isGameOver = useMemo(() => {
    return game.frames.every((frame, i) => {
      if (i < 9) {
        // 1〜9F: ストライク(1投)または2投入力済み
        return frame.rolls[0] === 10 || frame.rolls.length === 2;
      } else {
        // 10F: ストライク or スペアなら3投、どちらでもなければ2投
        const isStrike = frame.rolls[0] === 10;
        const isSpare = (frame.rolls[0] ?? 0) + (frame.rolls[1] ?? 0) === 10;
        return (isStrike || isSpare) ? frame.rolls.length === 3 : frame.rolls.length === 2;
      }
    });
  }, [game.frames]);

  // 訂正モード判定（選択セルに既に値が入っているか）
  const isEditing = game.frames[currentFrameIndex]?.rolls[currentRollIndex] !== undefined;

  // 自動で次の入力位置を選択（セルクリックで手動変更可）
  useEffect(() => {
    for (let i = 0; i < 10; i++) {
      const frame = game.frames[i];
      if (i < 9) {
        if (frame.rolls.length === 0 || (frame.rolls[0] !== 10 && frame.rolls.length === 1)) {
          setCurrentFrameIndex(i);
          setCurrentRollIndex(frame.rolls.length);
          return;
        }
      } else {
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
    // すべて埋まっている場合のフォールバック
    setCurrentFrameIndex(9);
    setCurrentRollIndex(3);
  }, [game.frames]);

  // ピン入力
  const handlePinEntry = (pins: number) => {
    const newFrames = JSON.parse(JSON.stringify(game.frames)) as Frame[];
    const frame = newFrames[currentFrameIndex];
    frame.rolls[currentRollIndex] = pins;

    // スコア再計算（フレーム累積）
    for (let i = 0; i < 10; i++) {
      const frameScore = calculateFrameScore(newFrames, i);
      if (frameScore !== null) {
        newFrames[i].score = (i > 0 ? (newFrames[i - 1].score ?? 0) : 0) + frameScore;
      } else {
        newFrames[i].score = null;
      }
    }

    onUpdateGame({ ...game, frames: newFrames });
  };

  // 撮影後の処理
  const handleVideoCaptured = (videoDataUrl: string, frameIndex: number) => {
    const newVideoFrames = { ...game.videoFrames, [frameIndex]: videoDataUrl };
    onUpdateGame({ ...game, videoFrames: newVideoFrames });
    setShowCamera(null);
  };

  // 入力ボタン群（合計スコア表示は削除済み）
  const PinInput: React.FC = () => {
    // 残ピン算出（訂正モードと通常モードで分岐）
    let pinsLeft = 10;

    if (isEditing) {
      // 訂正モード：その投球の直前状態から残ピンを正しく計算
      const frame = game.frames[currentFrameIndex];
      if (currentFrameIndex < 9) {
        // 1〜9F
        if (currentRollIndex === 0) {
          pinsLeft = 10; // 1投目は常に0〜10
        } else {
          pinsLeft = Math.max(0, 10 - (frame.rolls[0] ?? 0)); // 2投目は残ピンまで
        }
      } else {
        // 10F
        if (currentRollIndex === 0) {
          pinsLeft = 10;
        } else if (currentRollIndex === 1) {
          if (frame.rolls[0] === 10) {
            pinsLeft = 10; // ストライク後の2投目は0〜10
          } else {
            pinsLeft = Math.max(0, 10 - (frame.rolls[0] ?? 0)); // 通常は残ピンまで
          }
        } else {
          // 3投目
          const first = frame.rolls[0] ?? 0;
          const second = frame.rolls[1] ?? 0;
          if (first === 10 || first + second === 10) {
            pinsLeft = 10; // ストライク or スペアなら0〜10
          } else {
            pinsLeft = Math.max(0, 10 - second); // 念のため（本来到達しない）
          }
        }
      }
    } else {
      // 通常入力：現行の進行状況から残ピン算出
      pinsLeft =
        currentFrameIndex < 9
          ? 10 - (game.frames[currentFrameIndex].rolls[0] ?? 0)
          : (game.frames[9].rolls[0] === 10 ||
              (game.frames[9].rolls[0] ?? 0) + (game.frames[9].rolls[1] ?? 0) === 10) &&
            game.frames[9].rolls.length > 0
          ? 10
          : 10 - (game.frames[9].rolls[1] ?? 0);
    }

    return (
      <div>
        {/* 入力ボタンは ゲーム未終了 or 訂正モード のときだけ表示 */}
        {(!isGameOver || isEditing) && (
          <div className="grid grid-cols-6 gap-2 p-2 bg-brand-bg rounded-lg">
            {Array.from({ length: pinsLeft + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => handlePinEntry(i)}
                className="bg-brand-primary text-white font-bold py-3 rounded-md hover:bg-indigo-500 transition-colors"
              >
                {i}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // カメラモード
  if (showCamera !== null) {
    return (
      <CameraCapture
        onCapture={(video) => handleVideoCaptured(video, showCamera)}
        onCancel={() => setShowCamera(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-brand-surface rounded-lg p-4">
        {/* 見出しは ゲーム未終了 or 訂正モード のときだけ表示 */}
        {(!isGameOver || isEditing) && (
          <h3 className="text-lg font-semibold text-center mb-2">
            {currentFrameIndex + 1} フレーム目, {currentRollIndex + 1} 投目のスコアを入力
          </h3>
        )}
        <PinInput />
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-10 gap-1 min-w-[700px]">
          {game.frames.map((frame, index) => (
            <div key={index} className="bg-brand-surface rounded-md shadow-sm border border-gray-700">
              <div className="text-center text-sm font-bold bg-gray-900/50 rounded-t-md p-1">
                {index + 1}
              </div>

              {/* 1〜9Fは2投、10Fは3投を常時表示 */}
              <div className={`grid ${index === 9 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {/* 1投目セル */}
                <div
                  className="text-center p-2 text-lg font-semibold border-r border-b border-gray-700 cursor-pointer hover:bg-gray-800"
                  onClick={() => {
                    setCurrentFrameIndex(index);
                    setCurrentRollIndex(0);
                  }}
                >
                  {frame.rolls[0] === 10 && index < 9 ? 'X' : frame.rolls[0]}
                </div>

                {/* 2投目セル */}
                <div
                  className={`text-center p-2 text-lg font-semibold border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${index < 9 ? '' : 'border-r'}`}
                  onClick={() => {
                    setCurrentFrameIndex(index);
                    setCurrentRollIndex(1);
                  }}
                >
                  {(frame.rolls[0] ?? 0) + (frame.rolls[1] ?? 0) === 10 && frame.rolls[0] !== 10
                    ? '/'
                    : frame.rolls[1]}
                </div>

                {/* 10Fの3投目セル（常時表示） */}
                {index === 9 && (
                  <div
                    className="text-center p-2 text-lg font-semibold border-b border-gray-700 cursor-pointer hover:bg-gray-800"
                    onClick={() => {
                      setCurrentFrameIndex(index);
                      setCurrentRollIndex(2);
                    }}
                  >
                    {frame.rolls[2]}
                  </div>
                )}
              </div>

              {/* 累積スコア */}
              <div className="text-center py-2 text-xl font-bold h-[40px]">
                {frame.score}
              </div>

              {/* 撮影/解析ブロック */}
              <div className="p-1 border-t border-gray-700">
                {game.videoFrames[index] ? (
                  import.meta.env.VITE_API_KEY ? (
                    <button
                      onClick={() => setShowAnalysisModal(index)}
                      className="w-full text-xs bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-2 rounded-sm transition-colors"
                    >
                      Analyze
                    </button>
                  ) : (
                    <p className="text-center text-xs text-gray-400">AI機能は無効</p>
                  )
                ) : (
                  <button
                    onClick={() => setShowCamera(index)}
                    className="w-full bg-brand-primary hover:bg-indigo-500 text-white p-1 rounded-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <CameraIcon className="w-4 h-4" />
                    <span className="text-xs font-semibold">撮影</span>
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