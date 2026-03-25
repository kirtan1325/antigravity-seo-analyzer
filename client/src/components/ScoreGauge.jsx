// client/src/components/ScoreGauge.jsx
import { useEffect, useRef, useState } from 'react';

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getColor(score) {
  if (score >= 85) return '#10B981'; // green
  if (score >= 70) return '#3B82F6'; // blue
  if (score >= 50) return '#F59E0B'; // amber
  return '#EF4444';                  // red
}

function getLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Critical';
}

export default function ScoreGauge({ score = 0, size = 160 }) {
  const [displayed, setDisplayed] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    let current = 0;
    const step  = () => {
      current = Math.min(current + 1.5, score);
      setDisplayed(Math.round(current));
      if (current < score) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [score]);

  const offset  = CIRCUMFERENCE - (displayed / 100) * CIRCUMFERENCE;
  const color   = getColor(score);
  const label   = getLabel(score);
  const cx      = size / 2;
  const cy      = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={RADIUS}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="12"
          />
          {/* Fill */}
          <circle
            cx={cx} cy={cy} r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE - (displayed / 100) * CIRCUMFERENCE}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-heading font-extrabold leading-none"
            style={{ fontSize: size * 0.28, color }}
          >
            {displayed}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {/* Grade badge */}
      <span
        className="font-mono text-xs font-medium px-3 py-1 rounded-full"
        style={{ background: color + '20', color }}
      >
        {label}
      </span>
    </div>
  );
}
