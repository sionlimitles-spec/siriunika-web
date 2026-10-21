"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Maximize,
  Minimize,
  Pause,
  PictureInPicture,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  onEnded?: () => void;
}

export function VideoPlayer({ src, poster, title, onEnded }: VideoPlayerProps): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPiP, setIsPiP] = useState(false);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      void videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, []);

  const skip = useCallback((amount: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += amount;
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      void document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch {
      // PiP tidak didukung
    }
  }, []);

  const changeSpeed = useCallback(() => {
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2, 0.5];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length] ?? 1;
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackRate(nextSpeed);
  }, [playbackRate]);

  // Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case " ": e.preventDefault(); togglePlay(); break;
        case "arrowright": skip(10); break;
        case "arrowleft": skip(-10); break;
        case "f": toggleFullscreen(); break;
        case "m": toggleMute(); break;
        case "n": onEnded?.(); break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skip, toggleFullscreen, toggleMute, onEnded]);

  // Hide controls after 3s of no mouse movement
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    function handleMouseMove(): void {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    const el = containerRef.current;
    el?.addEventListener("mousemove", handleMouseMove);
    return () => {
      el?.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black"
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full object-contain"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={onEnded}
      />

      {/* Overlay Controls */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/20 to-black/60 p-4 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between text-white">
          <p className="font-display text-sm font-semibold sm:text-base">{title}</p>
          <button onClick={togglePiP} aria-label="Picture in Picture" className="p-2 hover:text-accent">
            <PictureInPicture className={cn("h-5 w-5", isPiP && "text-accent")} />
          </button>
        </div>

        {/* Center Play/Pause */}
        <div className="absolute inset-0 flex items-center justify-center gap-6 pointer-events-none">
          <button onClick={() => skip(-10)} aria-label="Mundur 10 detik" className="pointer-events-auto rounded-full bg-black/50 p-3 text-white backdrop-blur-md hover:bg-accent hover:text-white">
            <RotateCcw className="h-6 w-6" />
          </button>
          <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"} className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-[0_0_30px_rgba(220,38,38,0.6)]">
            {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current ml-1" />}
          </button>
          <button onClick={() => skip(10)} aria-label="Maju 10 detik" className="pointer-events-auto rounded-full bg-black/50 p-3 text-white backdrop-blur-md hover:bg-accent hover:text-white">
            <RotateCw className="h-6 w-6" />
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="space-y-2">
          {/* Progress Bar */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={(e) => {
              const time = Number(e.target.value);
              if (videoRef.current) videoRef.current.currentTime = time;
              setProgress(time);
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-accent"
            style={{
              background: `linear-gradient(to right, rgb(var(--accent)) ${(progress / (duration || 1)) * 100}%, rgba(255,255,255,0.3) ${(progress / (duration || 1)) * 100}%)`,
            }}
          />
          
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} aria-label="Play/Pause" className="hover:text-accent">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              
              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} aria-label="Mute" className="hover:text-accent">
                  {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min={0} max={1} step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setVolume(val);
                    setIsMuted(val === 0);
                    if (videoRef.current) {
                      videoRef.current.volume = val;
                      videoRef.current.muted = val === 0;
                    }
                  }}
                  className="w-0 overflow-hidden transition-all group-hover/vol:w-20 accent-accent"
                />
              </div>
              
              <span className="text-xs tabular-nums text-white/80">
                {Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, "0")} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={changeSpeed} className="flex items-center gap-1 text-xs font-bold hover:text-accent">
                <Settings className="h-4 w-4" /> {playbackRate}x
              </button>
              <button onClick={toggleFullscreen} aria-label="Fullscreen" className="hover:text-accent">
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
