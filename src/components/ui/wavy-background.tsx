"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  blur = 10,
  speed = "slow",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: unknown;
}) => {
  const noise = useRef(createNoise3D()).current;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number>(0);
  const ntRef = useRef(0);

  const getSpeed = useCallback(() => {
    return speed === "fast" ? 0.002 : 0.001;
  }, [speed]);

  const waveColors = colors ?? [
    "#22c55e", // emerald-500
    "#10b981", // emerald-500 alt
    "#059669", // emerald-600
    "#34d399", // emerald-400
    "#6ee7b7", // emerald-300
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    ctx.filter = `blur(${blur}px)`;

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };
    window.addEventListener("resize", handleResize);

    const drawWave = (n: number) => {
      ntRef.current += getSpeed();
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];
        for (let x = 0; x < w; x += 5) {
          const y = noise(x / 800, 0.3 * i, ntRef.current) * 100;
          ctx.lineTo(x, y + h * 0.5);
        }
        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      ctx.fillStyle = "transparent";
      ctx.globalAlpha = waveOpacity;
      ctx.clearRect(0, 0, w, h);
      drawWave(5);
      animationId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [blur, waveOpacity, getSpeed, waveColors, waveWidth, noise]);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div className={cn("relative", containerClassName)}>
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      />
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
