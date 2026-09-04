import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showSubtitle?: boolean;
}

export const NigraniLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
  showSubtitle = true,
}) => {
  const dimensions = {
    sm: { box: 'w-7 h-7', iconSize: 28, text: 'text-base', subText: 'text-[9px]' },
    md: { box: 'w-9 h-9', iconSize: 36, text: 'text-lg', subText: 'text-[10px]' },
    lg: { box: 'w-11 h-11', iconSize: 44, text: 'text-xl', subText: 'text-xs' },
    xl: { box: 'w-14 h-14', iconSize: 56, text: 'text-2xl', subText: 'text-xs' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Geometric "N" Emblem with Observation Dot */}
      <div className={`relative flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-950 dark:bg-slate-900 border border-slate-800/80 dark:border-cyan-500/20 shadow-md shadow-sky-950/20 ${dimensions.box}`}>
        <svg
          width={dimensions.iconSize * 0.72}
          height={dimensions.iconSize * 0.72}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Primary Enterprise Gradient: Deep Blue -> Cyan -> Subtle Green */}
            <linearGradient id="nigrani-grad" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="55%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Glowing dot gradient */}
            <linearGradient id="dot-grad" x1="22" y1="4" x2="27" y2="9" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Subtle glow filter for the vigilance focal dot */}
            <filter id="dot-glow" x="18" y="0" width="14" height="14" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Left Vertical Pillar */}
          <path
            d="M6 7C6 5.89543 6.89543 5 8 5C9.10457 5 10 5.89543 10 7V25C10 26.1046 9.10457 27 8 27C6.89543 27 6 26.1046 6 25V7Z"
            fill="url(#nigrani-grad)"
          />

          {/* Dynamic Diagonal Bridge */}
          <path
            d="M8.2 6.5C8.9 5.8 10 6.2 10.4 7L22 23.5C22.6 24.3 22.3 25.4 21.5 25.9C20.7 26.4 19.6 26.1 19.1 25.2L7.6 8.7C7.2 8.1 7.4 7.2 8.2 6.5Z"
            fill="url(#nigrani-grad)"
            opacity="0.95"
          />

          {/* Right Vertical Pillar */}
          <path
            d="M20 13C20 11.8954 20.8954 11 22 11C23.1046 11 24 11.8954 24 13V25C24 26.1046 23.1046 27 22 27C20.8954 27 20 26.1046 20 25V13Z"
            fill="url(#nigrani-grad)"
          />

          {/* Vigilance Sensor Dot (Observation, Intelligence, Monitoring Node) */}
          <circle
            cx="22"
            cy="6"
            r="3"
            fill="url(#dot-grad)"
            filter="url(#dot-glow)"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white ${dimensions.text}`}>
              NIGRANI
            </span>
            <span className={`font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 ${dimensions.text}`}>
              AI
            </span>
          </div>
          {showSubtitle && (
            <span className={`font-medium tracking-normal text-slate-500 dark:text-slate-400 mt-0.5 ${dimensions.subText}`}>
              Public Project Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};
