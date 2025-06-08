
import { useEffect, useRef } from "react";

interface MediaEffectsProps {
  audioUrl?: string;
  videoUrl?: string;
  trigger: boolean;
  onComplete?: () => void;
}

export function MediaEffects({ audioUrl, videoUrl, trigger, onComplete }: MediaEffectsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (trigger) {
      // Play audio if provided
      if (audioUrl && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }

      // Show and play video if provided
      if (videoUrl && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.style.display = 'block';
        videoRef.current.play().catch(console.error);
      }
    }
  }, [trigger, audioUrl, videoUrl]);

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.style.display = 'none';
    }
    onComplete?.();
  };

  const handleAudioEnded = () => {
    onComplete?.();
  };

  return (
    <>
      {audioUrl && (
        <audio
          ref={audioRef}
          preload="auto"
          onEnded={handleAudioEnded}
        >
          <source src={audioUrl} type="audio/mpeg" />
          <source src={audioUrl} type="audio/wav" />
          <source src={audioUrl} type="audio/ogg" />
        </audio>
      )}
      
      {videoUrl && (
        <video
          ref={videoRef}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md max-h-md rounded-lg shadow-2xl"
          style={{ display: 'none' }}
          autoPlay
          muted={false}
          onEnded={handleVideoEnded}
          onClick={handleVideoEnded}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
        </video>
      )}
    </>
  );
}
