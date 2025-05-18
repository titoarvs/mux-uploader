"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

import MuxPlayer from "@mux/mux-player-react";
import toast from "react-hot-toast";
interface VideoPlayerProps {
  playbackId: string;
}

export function VideoPlayer({ playbackId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const src = `https://stream.mux.com/${playbackId}.m3u8`;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = src;
    } else if (Hls.isSupported()) {
      // HLS.js for other browsers
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    } else {
      console.error("HLS is not supported in this browser");
    }
  }, [playbackId]);

  return (
    <>
      <MuxPlayer
        playbackId={playbackId}
        autoPlay
        className="w-full h-full aspect-video"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
        onLoadedMetadata={(event) => {
          if (event.target) {
            const duration = (event.target as HTMLMediaElement).duration;
            console.log("Video duration:", duration);
          }
        }}
        onTimeUpdate={(event) => {
          if (event.target) {
            const videoElement = event.target as HTMLMediaElement;
            const currentTime = videoElement.currentTime;
            console.log("🚀 ~ VideoPlayer ~ currentTime:", currentTime);
            const duration = videoElement.duration;

            if (
              currentTime >= duration * 0.8 &&
              !videoElement.dataset.notified80Percent
            ) {
              toast.success("Video is 80% complete!");
              videoElement.dataset.notified80Percent = "true";
            }
          }
        }}
        metadata={{
          video_id: "video-id-54321",
          video_title: "Test video title",
          viewer_user_id: "user-id-007",
        }}
      />
    </>
  );
}
