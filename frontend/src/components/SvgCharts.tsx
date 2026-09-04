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
  size = 180,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-slate-400 dark:text-slate-500">
        No distribution data available
      </div>
    );
  }

  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full min-w-0">
      <div className="relative shrink-0" style={{ width: size, height: size, maxWidth: '100%' }}>
        <svg width={size} height={size} viewBox="0 0 200 200" className="rotate-[-90deg] w-full h-full max-w-full">
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
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {hoveredIdx !== null ? data[hoveredIdx].value : total}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {hoveredIdx !== null ? data[hoveredIdx].label : title || 'Total'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 w-full min-w-0 max-w-xs">
        {data.map((slice, i) => (
          <div
            key={slice.label}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`flex items-center gap-2.5 px-2 py-1 rounded-md transition-colors cursor-pointer text-xs min-w-0 ${
              hoveredIdx === i
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
            <span className="flex-1 truncate min-w-0 text-left" title={slice.label}>{slice.label}</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 shrink-0">{slice.value}</span>
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
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
    <div className="space-y-3 w-full min-w-0">
      {displayData.map((item) => {
        const pct = Math.round((item.value / maxValue) * 100);
        return (
          <div key={item.label} className="group w-full min-w-0">
            <div className="flex items-center justify-between text-xs mb-1 gap-2 min-w-0">
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate min-w-0 flex-1" title={item.label}>
                {item.label}
              </span>
              <div className="flex items-center gap-1.5 shrink-0 text-right">
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {item.value} {valueLabel}
                </span>
                {item.subValue !== undefined && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">({item.subValue})</span>
                )}
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color || '#0284c7',
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
        {/* Background track adapting to theme */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-800"
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
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
          {level} RISK
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">out of 100</span>
      </div>
    </div>
  );
};
