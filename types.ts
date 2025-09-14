
export interface Frame {
  rolls: (number | null)[];
  score: number | null;
}

export interface Game {
  id: string;
  date: string;
  frames: Frame[];
  totalScore: number;
  videoFrames: {
    [frameIndex: number]: string; // URL or base64 data of the video
  };
}
