"use client"
import { useEffect, useRef } from "react";

export default function DaySkyAnimation() {
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

    // Clouds: Each has x, y, speed, w, h, opacity
    let clouds = Array.from({length: 7},(_,i) => ({
      x: Math.random()*width,
      y: 50 + Math.random()*height*0.3 + i*30,
      speed: 0.15 + Math.random()*0.12,
      w: 90 + Math.random()*50,
      h: 36 + Math.random()*20,
      opacity: 0.14 + Math.random()*0.25
    }));

    function drawCloud(cx:number,cy:number,w:number,h:number,a:number) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.ellipse(cx,cy,w,h,0,0,2*Math.PI);
      ctx.ellipse(cx-w*0.3,cy-h*0.18,w*0.7,h*0.7,0,0,2*Math.PI);
      ctx.ellipse(cx+w*0.22,cy+h*0.15,w*0.6,h*0.5,0,0,2*Math.PI);
      ctx.fillStyle = '#fff';
      ctx.shadowColor='#bce6fa';
      ctx.shadowBlur=15;
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      // Sky gradient
      let skyGrad = ctx.createLinearGradient(0,0,width,height);
      skyGrad.addColorStop(0,'#a3dbff');
      skyGrad.addColorStop(1,'#e0f2fe');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0,0,width,height);
      // Sun
      ctx.save();
      ctx.beginPath();
      ctx.arc(width*0.87, height*0.12, 56, 0, 2*Math.PI);
      var sunGr = ctx.createRadialGradient(width*0.87, height*0.12, 8, width*0.87, height*0.12, 56);
      sunGr.addColorStop(0, '#fffde4');
      sunGr.addColorStop(0.5, '#ffe966');
      sunGr.addColorStop(1, 'rgba(254,240,138,0)');
      ctx.fillStyle = sunGr;
      ctx.globalAlpha = 0.98;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
      // Clouds
      for (let cloud of clouds) {
        drawCloud(cloud.x,cloud.y,cloud.w,cloud.h,cloud.opacity);
        cloud.x += cloud.speed;
        if (cloud.x-cloud.w > width) cloud.x = -cloud.w*1.1;
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
