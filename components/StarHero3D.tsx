"use client"
import { useEffect, useRef } from "react";

export default function StarHero3D() {
  // Option 1: SVG animation (animated cosmic/finance chart)
  // Option 2: Lightweight canvas starfield moving gently upward
  // We'll use SVG for scalability & performance.
  return (
    <svg width="320" height="140" viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-fade-in">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="320" y2="140" gradientUnits="userSpaceOnUse">
          <stop stopColor="#059df9" />
          <stop offset="1" stopColor="#001325" />
        </linearGradient>
        <radialGradient id="glow" cx="70%" cy="25%" r="60%">
          <stop stopColor="#56eaff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#059df9" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="320" height="140" fill="url(#sky)" />
      {/* Animated stars */}
      <g>
        <circle cx="50" cy="40" r="2.8" fill="url(#glow)">
          <animate attributeName="cx" from="50" to="290" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="25" r="2" fill="#fff">
          <animate attributeName="cx" from="100" to="300" dur="5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="200" cy="80" r="1.6" fill="#fff"/>
        <circle cx="130" cy="65" r="2.1" fill="#bae6fd">
          <animate attributeName="cy" from="65" to="35" dur="4s" repeatCount="indefinite"/>
        </circle>
      </g>
      {/* Finance line chart curve with arrow (animated upward) */}
      <polyline points="40,120 70,80 120,100 160,70 220,85 270,35 300,45" fill="none" stroke="#6ee7b7" strokeWidth="3"/>
      <circle cx="70" cy="80" r="4" fill="#6ee7b7" />
      <circle cx="160" cy="70" r="4" fill="#6ee7b7" />
      <circle cx="270" cy="35" r="4" fill="#6ee7b7" />
      <polygon points="290,40 300,45 287,53" fill="#6ee7b7">
        <animateTransform attributeName="transform" type="translate" from="0 0" to="0 -5" dur="2s" repeatCount="indefinite"/>
      </polygon>
    </svg>
  );
}
