import React, { useEffect, useRef, useState } from "react";
import { Plane } from "lucide-react";
import "./Loader.css";

export default function Loader() {
  const canvasRef = useRef(null);
  const planeRef = useRef(null);
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const plane = planeRef.current;
    const ctx = canvas.getContext("2d");
    const cx = 65,
      cy = 65,
      r = 48,
      total = 18;

    function draw() {
      ctx.clearRect(0, 0, 130, 130);
      const angle = angleRef.current;

      for (let i = 0; i < total; i++) {
        const a = (i / total) * Math.PI * 2;
        const dx = cx + Math.cos(a) * r;
        const dy = cy + Math.sin(a) * r;

        let diff = angle - a;
        if (diff < 0) diff += Math.PI * 2;

        const trailArc = Math.PI * 1.6;
        let opacity, size;
        if (diff < 0.05 || diff > trailArc) {
          opacity = 0.06;
          size = 2.5;
        } else {
          const t = 1 - diff / trailArc;
          opacity = 0.1 + t * 0.9;
          size = 2.5 + t * 4;
        }

        ctx.beginPath();
        ctx.arc(dx, dy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.fill();
      }

      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;

      // PlaneTakeoff default nose = upper-right (45°)
      // Travel direction = angle*180/PI + 90
      // Offset = +45 to align nose with travel
      const deg = (angle * 180) / Math.PI + 90 + 45;

      plane.style.left = px - 19 + "px";
      plane.style.top = py - 19 + "px";
      plane.style.transform = `rotate(${deg}deg)`;

      angleRef.current += 0.04;
      if (angleRef.current > Math.PI * 2) angleRef.current -= Math.PI * 2;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();

    const t1 = setTimeout(() => setHiding(true), 2800);
    const t2 = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      setGone(true);
    }, 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`skyjet-loader ${hiding ? "skyjet-loader--hidden" : ""}`}>
      <div className="sl-wrap">
        <canvas
          ref={canvasRef}
          className="sl-canvas"
          width="130"
          height="130"
        />
        <div ref={planeRef} className="sl-plane">
          <Plane size={34} color="white" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
