// components/VideoPlayer.tsx
"use client"
import React, { useRef, useState } from 'react';

interface VideoSource {
  label: string; // Quality label
  url: string;   // Video source URL
}

interface VideoPlayerProps {
  sources: VideoSource[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ sources }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSource, setCurrentSource] = useState(sources[0].url);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [remarkTimestamp, setRemarkTimestamp] = useState<number | null>(null);

  const handleQualityChange = (url: string) => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setCurrentSource(url);
      videoRef.current.load();
      videoRef.current.currentTime = currentTime;
      videoRef.current.play();
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleAddRemark = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setRemarkTimestamp(videoRef.current.currentTime);
    }
  };
  console.log("remark at ==> ", remarkTimestamp);
  return (
    <div className="flex flex-col items-center">
      <video
        ref={videoRef}
        controls
        className="w-full max-w-lg"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        playbackRate={playbackSpeed}
        key={currentSource} // Re-render video when source changes
      >
        <source src={currentSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="flex gap-2 mt-4">
        {/* Quality Control */}
        <label htmlFor="quality" className="text-sm font-semibold">Quality:</label>
        <select
          id="quality"
          onChange={(e) => handleQualityChange(e.target.value)}
          className="border border-gray-300 rounded p-1"
        >
          {sources.map((source, index) => (
            <option key={index} value={source.url}>
              {source.label}
            </option>
          ))}
        </select>

        {/* Playback Speed Control */}
        <label htmlFor="speed" className="text-sm font-semibold">Speed:</label>
        <select
          id="speed"
          value={playbackSpeed}
          onChange={(e) => handleSpeedChange(Number(e.target.value))}
          className="border border-gray-300 rounded p-1"
        >
          {[0.5, 1, 1.25, 1.5, 2].map((speed, index) => (
            <option key={index} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>

      {/* Add Remark Button */}
      <button
        onClick={handleAddRemark}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Add Remark
      </button>

      {/* Display Remark Timestamp */}
      {remarkTimestamp !== null && (
        <p className="mt-2 text-sm text-gray-600">
          Remark added at: {remarkTimestamp.toFixed(2)} seconds
        </p>
      )}
    </div>
  );
};

export default VideoPlayer;

