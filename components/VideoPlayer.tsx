
import React, { forwardRef } from 'react';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({ src }, ref) => {
  return (
    <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
      <video
        ref={ref}
        src={src}
        controls
        loop
        playsInline
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
      />
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
