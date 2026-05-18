"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseWaveSurferOptions {
  url?: string;
  autoplay?: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

interface UseWaveSurferReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  isReady: boolean;
  currentTime: number;
  duration: number;
  togglePlayPause: () => void;
  seekForward: (seconds?: number) => void;
  seekBackward: (seconds?: number) => void;
}

export function useWaveSurfer({
  url,
  autoplay,
  onReady,
  onError,
}: UseWaveSurferOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const isMobile = useIsMobile();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    let destroyed = false;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#96999D",
      progressColor: "#4A8A9A",
      cursorColor: "#4A8A9A",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      barMinHeight: 4,
      height: "auto",
      normalize: true,
    });

    wavesurferRef.current = ws;

    ws.on("ready", () => {
      setIsReady(true);
      const rawDuration = ws.getDuration();
      
      // 🔥 FIX: Detect 30-minute offset (1800 seconds)
      let detectedOffset = 0;
      if (rawDuration >= 1800 && rawDuration <= 1860) {
        detectedOffset = 1800; // 30 minutes in seconds
        console.log(`🔵 Audio offset detected: ${detectedOffset}s, raw duration: ${rawDuration}s`);
      }
      setOffset(detectedOffset);
      
      const adjustedDuration = rawDuration - detectedOffset;
      setDuration(adjustedDuration > 0 ? adjustedDuration : rawDuration);
      
      // Seek to the actual start position
      if (detectedOffset > 0) {
        ws.seekTo(detectedOffset / rawDuration);
        setCurrentTime(0);
      } else {
        ws.seekTo(0);
        setCurrentTime(0);
      }

      if (autoplay) ws.play().catch(() => {});
      onReady?.();
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));
    ws.on("timeupdate", (time) => {
      // 🔥 FIX: Adjust current time if offset exists
      const adjustedTime = time > offset ? time - offset : time;
      setCurrentTime(adjustedTime);
    });

    ws.on("error", (error) => {
      if (destroyed) return;
      console.error("WaveSurfer error:", error);
      onError?.(new Error(String(error)));
    });

    ws.load(url).catch((error) => {
      if (destroyed) return;
      console.error("WaveSurfer load error:", error);
      onError?.(new Error(String(error)));
    });

    return () => {
      destroyed = true;
      ws.destroy();
    };
  }, [url, autoplay, onReady, onError, isMobile]);

  const togglePlayPause = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const seekForward = useCallback((seconds = 5) => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    const currentPos = ws.getCurrentTime();
    const newTime = Math.min(currentPos + seconds, ws.getDuration());
    ws.seekTo(newTime / ws.getDuration());
  }, []);

  const seekBackward = useCallback((seconds = 5) => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    const currentPos = ws.getCurrentTime();
    const newTime = Math.max(currentPos - seconds, 0);
    ws.seekTo(newTime / ws.getDuration());
  }, []);

  return {
    containerRef,
    isPlaying,
    isReady,
    currentTime,
    duration,
    togglePlayPause,
    seekForward,
    seekBackward,
  };
}