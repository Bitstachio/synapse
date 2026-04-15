import React from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  width?: string | number;
  maxWidth?: string | number;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster = "",
  width = "100%",
  maxWidth = "800px",
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  className = "",
}) => {
  return (
    <video
      src={src}
      poster={poster}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      preload="metadata"
      style={{ width, maxWidth, borderRadius: 12 }}
      className={className}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
