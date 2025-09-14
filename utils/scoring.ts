
import { Frame } from '../types';

export const calculateFrameScore = (frames: Frame[], frameIndex: number): number | null => {
  const frame = frames[frameIndex];
  if (frame.rolls.length === 0) return null;

  const isStrike = frame.rolls[0] === 10;
  const isSpare = !isStrike && (frame.rolls[0] ?? 0) + (frame.rolls[1] ?? 0) === 10;

  if (frameIndex === 9) { // 10th frame
    return (frame.rolls[0] ?? 0) + (frame.rolls[1] ?? 0) + (frame.rolls[2] ?? 0);
  }

  if (isStrike) {
    const nextFrame = frames[frameIndex + 1];
    const frameAfterNext = frames[frameIndex + 2];
    if (nextFrame.rolls.length === 0) return null;

    if (nextFrame.rolls[0] === 10) { // Double strike
      if (frameIndex + 1 === 9) { // Strike in 9th, then 10th
          if (nextFrame.rolls.length < 2) return null;
          return 10 + 10 + (nextFrame.rolls[1] ?? 0);
      }
      if (frameAfterNext.rolls.length === 0) return null;
      return 10 + 10 + (frameAfterNext.rolls[0] ?? 0);
    } else { // Strike followed by non-strike
      if (nextFrame.rolls.length < 2) return null;
      return 10 + (nextFrame.rolls[0] ?? 0) + (nextFrame.rolls[1] ?? 0);
    }
  }

  if (isSpare) {
    const nextFrame = frames[frameIndex + 1];
    if (nextFrame.rolls.length === 0) return null;
    return 10 + (nextFrame.rolls[0] ?? 0);
  }

  // Open frame
  return (frame.rolls[0] ?? 0) + (frame.rolls[1] ?? 0);
};


export const calculateTotalScore = (frames: Frame[]): number => {
    let totalScore = 0;
    const scoredFrames: Frame[] = JSON.parse(JSON.stringify(frames)); // Deep copy

    for (let i = 0; i < 10; i++) {
        const frameScore = calculateFrameScore(scoredFrames, i);
        if (frameScore !== null) {
            scoredFrames[i].score = (i > 0 ? (scoredFrames[i-1].score ?? 0) : 0) + frameScore;
            totalScore = scoredFrames[i].score ?? 0;
        } else {
            scoredFrames[i].score = null;
        }
    }
    return totalScore;
};
