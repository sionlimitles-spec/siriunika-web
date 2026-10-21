"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playlist, type Track } from "@/config/config";

export type RepeatMode = "off" | "all" | "one";

const STORAGE = {
  trackId: "nexus-music-track",
  position: "nexus-music-position",
  volume: "nexus-music-volume",
  shuffle: "nexus-music-shuffle",
  repeat: "nexus-music-repeat",
} as const;

interface PersistedState {
  trackId: string | null;
  position: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
}

function readPersisted(): PersistedState {
  const fallback: PersistedState = {
    trackId: null,
    position: 0,
    volume: 0.65,
    shuffle: false,
    repeat: "off",
  };
  try {
    const trackId = localStorage.getItem(STORAGE.trackId);
    const position = Number(localStorage.getItem(STORAGE.position) ?? "0");
    const volume = Number(localStorage.getItem(STORAGE.volume) ?? "0.65");
    const shuffle = localStorage.getItem(STORAGE.shuffle) === "on";
    const repeatRaw = localStorage.getItem(STORAGE.repeat);
    const repeat: RepeatMode =
      repeatRaw === "all" || repeatRaw === "one" ? repeatRaw : "off";
    return {
      trackId,
      position: Number.isFinite(position) ? position : 0,
      volume: Number.isFinite(volume) ? Math.min(Math.max(volume, 0), 1) : 0.65,
      shuffle,
      repeat,
    };
  } catch {
    return fallback;
  }
}

export interface AudioPlayerApi {
  track: Track | null;
  index: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  tracks: readonly Track[];
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  playAt: (index: number) => void;
}

export function useAudioPlayer(): AudioPlayerApi {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const shuffleRef = useRef(false);
  const repeatRef = useRef<RepeatMode>("off");

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.65);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");

  // Init audio element + restore persisted state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const persisted = readPersisted();
    audio.volume = persisted.volume;
    setVolumeState(persisted.volume);

    setShuffle(persisted.shuffle);
    shuffleRef.current = persisted.shuffle;

    setRepeat(persisted.repeat);
    repeatRef.current = persisted.repeat;

    let startIndex = 0;
    if (persisted.trackId) {
      const found = playlist.findIndex((t) => t.id === persisted.trackId);
      if (found >= 0) startIndex = found;
    }
    if (playlist[startIndex]) {
      indexRef.current = startIndex;
      setIndex(startIndex);
      audio.src = playlist[startIndex].src;
      audio.currentTime = persisted.position;
    }

    function onLoaded(): void {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    }
    function onTime(): void {
      setCurrentTime(audio.currentTime);
    }
    function onPlay(): void {
      setIsPlaying(true);
    }
    function onPause(): void {
      setIsPlaying(false);
    }
    function onEnded(): void {
      const mode = repeatRef.current;
      const tracks = playlist;
      if (mode === "one") {
        audio.currentTime = 0;
        void audio.play().catch(() => undefined);
        return;
      }
      const isLast = indexRef.current >= tracks.length - 1;
      if (mode === "off" && isLast) {
        setIsPlaying(false);
        return;
      }
      advance(1);
    }
    function advance(direction: 1 | -1): void {
      const tracks = playlist;
      if (tracks.length === 0) return;
      if (shuffleRef.current && tracks.length > 1) {
        let nextIndex = indexRef.current;
        while (nextIndex === indexRef.current) {
          nextIndex = Math.floor(Math.random() * tracks.length);
        }
        loadIndex(nextIndex, true);
        return;
      }
      const nextIndex =
        (indexRef.current + direction + tracks.length) % tracks.length;
      loadIndex(nextIndex, true);
    }
    function loadIndex(i: number, autoplay: boolean): void {
      const track = playlist[i];
      if (!track) return;
      indexRef.current = i;
      setIndex(i);
      audio.src = track.src;
      setCurrentTime(0);
      if (autoplay) {
        void audio.play().catch(() => setIsPlaying(false));
      }
    }

    function onError(): void {
      setIsPlaying(false);
    }

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    // Expose loadIndex via ref for external callers
    loadIndexRef.current = loadIndex;

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadIndexRef = useRef<((i: number, autoplay: boolean) => void) | null>(
    null,
  );

  // Persist state changes
  useEffect(() => {
    try {
      const track = playlist[index];
      if (track) localStorage.setItem(STORAGE.trackId, track.id);
      localStorage.setItem(STORAGE.volume, String(volume));
      localStorage.setItem(STORAGE.shuffle, shuffle ? "on" : "off");
      localStorage.setItem(STORAGE.repeat, repeat);
    } catch {
      // localStorage bisa gagal; abaikan
    }
  }, [index, volume, shuffle, repeat]);

  // Persist position throttled
  useEffect(() => {
    const timer = window.setInterval(() => {
      try {
        localStorage.setItem(STORAGE.position, String(currentTime));
      } catch {
        // abaikan
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [currentTime]);

  // MediaSession API
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!("mediaSession" in navigator)) return;
    const track = playlist[index];
    if (!track) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        artwork: [
          { src: track.cover, sizes: "512x512", type: "image/jpeg" },
        ],
      });
    } catch {
      // MediaMetadata tidak didukung; abaikan
    }
  }, [index]);

  const play = useCallback((): void => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.src && playlist[index]) {
      audio.src = playlist[index].src;
    }
    void audio.play().catch(() => setIsPlaying(false));
  }, [index]);

  const pause = useCallback((): void => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback((): void => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) play();
    else pause();
  }, [play, pause]);

  const next = useCallback((): void => {
    const tracks = playlist;
    if (tracks.length === 0) return;
    if (shuffleRef.current && tracks.length > 1) {
      let nextIndex = indexRef.current;
      while (nextIndex === indexRef.current) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      }
      loadIndexRef.current?.(nextIndex, true);
      return;
    }
    const nextIndex = (indexRef.current + 1) % tracks.length;
    loadIndexRef.current?.(nextIndex, true);
  }, []);

  const prev = useCallback((): void => {
    const tracks = playlist;
    if (tracks.length === 0) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevIndex =
      (indexRef.current - 1 + tracks.length) % tracks.length;
    loadIndexRef.current?.(prevIndex, true);
  }, []);

  const seek = useCallback((time: number): void => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((v: number): void => {
    const clamped = Math.min(Math.max(v, 0), 1);
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const toggleShuffle = useCallback((): void => {
    setShuffle((prev) => {
      const nextVal = !prev;
      shuffleRef.current = nextVal;
      return nextVal;
    });
  }, []);

  const cycleRepeat = useCallback((): void => {
    setRepeat((prev) => {
      const order: RepeatMode[] = ["off", "all", "one"];
      const nextVal = order[(order.indexOf(prev) + 1) % order.length] ?? "off";
      repeatRef.current = nextVal;
      return nextVal;
    });
  }, []);

  const playAt = useCallback((i: number): void => {
    loadIndexRef.current?.(i, true);
  }, []);

  const track = playlist[index] ?? null;

  return {
    track,
    index,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    tracks: playlist,
    play,
    pause,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    playAt,
  };
}
