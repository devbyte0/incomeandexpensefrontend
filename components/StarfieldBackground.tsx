"use client"
import { useEffect, useRef } from "react";

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;
    let animationId: number;
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    // Generate and animate multiple small stars
    const STAR_COUNT = Math.floor(width/5) + 90;
    let stars = Array.from({length: STAR_COUNT}, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 0.8 + 0.3,
      speed: Math.random() * 0.13 + 0.03,
      alpha: Math.random() * 0.55 + 0.4,
    }));

    function animate() {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      // Cosmic gradient background
      const grad = ctx.createLinearGradient(0,0,width,height);
      grad.addColorStop(0, '#05203a');
      grad.addColorStop(1, '#0b0d21');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,width,height);
      ctx.restore();
      // Draw stars
      for (let star of stars) {
        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#88e1ff';
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.restore();
        // Animate stars (drift slowly)
        star.y += star.speed;
        if (star.y > height+2) star.y = -2;
      }
      animationId = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        background: "transparent",
      }}
    />
  );
}
