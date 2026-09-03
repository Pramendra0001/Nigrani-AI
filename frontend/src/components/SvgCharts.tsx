import React, { useState } from 'react';

// -------------------------------------------------------------
// 1. Donut Chart
// -------------------------------------------------------------
interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export const DonutChart: React.FC<{ data: DonutSlice[]; title?: string; size?: number }> = ({
  data,
  title,
  size = 220,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-slate-400">
        No distribution data available
      </div>
    );
  }

  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 200 200" className="rotate-[-90deg]">
          {data.map((slice, i) => {
            const percent = slice.value / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            return (
              <circle
                key={slice.label}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={hoveredIdx === i ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900">
            {hoveredIdx !== null ? data[hoveredIdx].value : total}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {hoveredIdx !== null ? data[hoveredIdx].label : title || 'Total'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {data.map((slice, i) => (
          <div
            key={slice.label}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`flex items-center gap-3 px-2 py-1 rounded transition-colors cursor-pointer text-xs ${
              hoveredIdx === i ? 'bg-slate-100 font-semibold' : 'text-slate-600'
            }`}
          >
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
            <span className="flex-1 min-w-[90px]">{slice.label}</span>
            <span className="font-mono font-bold text-slate-800">{slice.value}</span>
            <span className="font-mono text-[10px] text-slate-400">
              ({total > 0 ? ((slice.value / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


// -------------------------------------------------------------
// 2. Horizontal Bar Chart
// -------------------------------------------------------------
interface BarItem {
  label: string;
  value: number;
  subValue?: string | number;
  color?: string;
}

export const HorizontalBarChart: React.FC<{
  data: BarItem[];
  maxBars?: number;
  valueLabel?: string;
}> = ({ data, maxBars = 8, valueLabel = '' }) => {
  const displayData = data.slice(0, maxBars);
  const maxValue = Math.max(...displayData.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {displayData.map((item) => {
        const pct = Math.round((item.value / maxValue) * 100);
        return (
          <div key={item.label} className="group">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-700 truncate max-w-[200px]" title={item.label}>
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">
                  {item.value} {valueLabel}
                </span>
                {item.subValue !== undefined && (
                  <span className="text-[11px] text-slate-500">({item.subValue})</span>
                )}
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color || '#1b4d89',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};


// -------------------------------------------------------------
// 3. Radial Risk Score Gauge
// -------------------------------------------------------------
export const RadialRiskGauge: React.FC<{ score: number; level: string; size?: number }> = ({
  score,
  level,
  size = 180,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const strokeDashoffset = circumference * (1 - progress * 0.75); // 270 degree arc

  const color = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  }[level] || '#64748b';

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[135deg]">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Active progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-black tracking-tight" style={{ color }}>
          {score.toFixed(1)}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
          {level} RISK
        </span>
        <span className="text-[10px] text-slate-400 font-mono">out of 100</span>
      </div>
    </div>
  );
};
