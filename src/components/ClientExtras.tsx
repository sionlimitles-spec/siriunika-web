"use client";

import { useEffect, useRef, useState } from "react";

function useFlag(key: string): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const read = (): void => {
      try {
        setOn(localStorage.getItem(key) === "on");
      } catch {
        setOn(false);
      }
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener("nexus-settings", read as EventListener);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("nexus-settings", read as EventListener);
    };
  }, [key]);
  return on;
}

function ParticleBackground(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let animationId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
    }
    const particles: Particle[] = [];

    function resize(): void {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init(): void {
      particles.length = 0;
      for (let i = 0; i < 28; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 0.6,
        });
      }
    }

    function draw(): void {
      ctx!.clearRect(0, 0, width, height);
      const accent =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accent")
          .trim() || "220 38 38";
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgb(${accent} / 0.35)`;
        ctx!.fill();
      }
      animationId = requestAnimationFrame(draw);
    }

    function onResize(): void {
      resize();
      init();
    }

    resize();
    init();
    draw();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 opacity-60"
      aria-hidden="true"
    />
  );
}

function ServiceWorkerRegister(): null {
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    const timer = window.setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW opsional; abaikan kegagalan
      });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}

function ClickSound(): null {
  const enabled = useFlag("nexus-sound");

  useEffect(() => {
    if (!enabled) return;
    let ctx: AudioContext | null = null;

    function handleClick(event: MouseEvent): void {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest("button, a[href]")) return;
      try {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return;
        if (!ctx) ctx = new Ctor();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 900;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + 0.06,
        );
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } catch {
        // abaikan
      }
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (ctx) {
        void ctx.close().catch(() => undefined);
        ctx = null;
      }
    };
  }, [enabled]);

  return null;
}

export function ClientExtras(): React.ReactElement {
  const particles = useFlag("nexus-particles");
  return (
    <>
      <ServiceWorkerRegister />
      <ClickSound />
      {particles ? <ParticleBackground /> : null}
    </>
  );
        }
