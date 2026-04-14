"use client";

import { useEffect, useRef } from "react";

// ─── Ayarlar ──────────────────────────────────────────────────────────────────
const GAP_X = 38;          // Sütunlar arası piksel
const GAP_Y = 38;          // Satırlar arası piksel
const SEG_W = 2;           // Kapsül genişliği (px)
const SEG_H = 18;          // Kapsül yüksekliği (px)
const SEG_R = 1;           // Köşe yuvarlaklığı

const HOVER_RADIUS = 180;  // Farenin etki alanı (px)
const ACTIVATE_SPEED = 0.14; // Her frame ne kadar hızlı yanar
const FADE_SPEED = 0.014;    // Her frame ne kadar yavaş söner

// Varsayılan opaklık (neredeyse görünmez)
const OPACITY_MIN = 0.03;
// Saf beyaz
const R = 255, G = 255, B = 255;

// ─── Tip ─────────────────────────────────────────────────────────────────────
interface Capsule {
  x: number;
  y: number;
  brightness: number; // 0 → 1
}

// ─── Bileşen ─────────────────────────────────────────────────────────────────
export function HologramBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const gridRef   = useRef<Capsule[]>([]);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Izgara oluştur ──────────────────────────────────────────────────────
    function buildGrid() {
      const cols = Math.ceil(canvas!.width  / GAP_X) + 2;
      const rows = Math.ceil(canvas!.height / GAP_Y) + 2;
      const caps: Capsule[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          caps.push({ x: c * GAP_X, y: r * GAP_Y, brightness: 0 });
        }
      }
      gridRef.current = caps;
    }

    // ── Canvas boyutlandır ──────────────────────────────────────────────────
    function resize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
      buildGrid();
    }

    // ── Animasyon döngüsü ───────────────────────────────────────────────────
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const { x: mx, y: my } = mouseRef.current;
      const caps = gridRef.current;

      for (const cap of caps) {
        const dx   = cap.x - mx;
        const dy   = cap.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Brightness hedefi: fare yakınsa mesafeye göre 0–1, uzaksa 0
        const target = dist < HOVER_RADIUS
          ? (1 - dist / HOVER_RADIUS)
          : 0;

        if (target > cap.brightness) {
          // Hızlı yanma
          cap.brightness = Math.min(target, cap.brightness + ACTIVATE_SPEED);
        } else {
          // Yavaş sönme
          cap.brightness = Math.max(0, cap.brightness - FADE_SPEED);
        }

        if (cap.brightness < 0.001) continue; // görünmez kapsülleri atla

        const opacity = OPACITY_MIN + cap.brightness * (0.55 - OPACITY_MIN);

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${R},${G},${B},${opacity.toFixed(4)})`;
        ctx!.roundRect(
          cap.x - SEG_W / 2,
          cap.y - SEG_H / 2,
          SEG_W,
          SEG_H,
          SEG_R
        );
        ctx!.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    // ── Eventler ────────────────────────────────────────────────────────────
    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", resize);

    resize();
    draw();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
      aria-hidden="true"
    />
  );
}
