"use client";

import { useCallback, useRef } from "react";

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback((frequency = 660, duration = 100) => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch { /* silent fail */ }
  }, []);

  const playSuccess = useCallback(() => {
    play(880, 80);
    setTimeout(() => play(1100, 100), 100);
  }, [play]);

  const playError = useCallback(() => {
    play(200, 200);
  }, [play]);

  return { playSuccess, playError };
}
