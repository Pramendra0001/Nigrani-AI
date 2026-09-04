import React from 'react';

export interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'stacked' | 'icon' | 'app-icon';
  showWordmark?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
}

/**
 * Official Nigrani AI Brand Emblem & Wordmark
 * Faithful vector recreation of the official brand identity guide.
 * Features:
 * - Dimensional folded ribbon "N" with continuous Blue -> Cyan -> Green gradient flow
 * - Precision observation / intelligence dot node at upper right
 * - Enterprise typography with dual-theme contrast
 */
export const NigraniLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  showWordmark = true,
  showSubtitle = true,
  subtitleText,
}) => {
  const isStacked = variant === 'stacked';
  const isAppIcon = variant === 'app-icon';
  const isIconOnly = variant === 'icon';

  const config = {
    sm: {
      box: 'w-7 h-7',
      svgPx: 26,
      wordmark: 'text-base',
      aiText: 'text-base',
      subText: 'text-[8px] tracking-wider',
      gap: 'gap-2',
    },
    md: {
      box: 'w-9 h-9',
      svgPx: 34,
      wordmark: 'text-lg',
      aiText: 'text-lg',
      subText: 'text-[9.5px] tracking-wider',
      gap: 'gap-2.5',
    },
    lg: {
      box: 'w-12 h-12',
      svgPx: 46,
      wordmark: 'text-2xl',
      aiText: 'text-2xl',
      subText: 'text-[11px] tracking-widest',
      gap: 'gap-3',
    },
    xl: {
      box: 'w-16 h-16',
      svgPx: 60,
      wordmark: 'text-3xl',
      aiText: 'text-3xl',
      subText: 'text-xs tracking-widest',
      gap: 'gap-4',
    },
  }[size];

  // SVG Emblem Mark (100x100 viewBox coordinate space)
  const emblemSvg = (
    <svg
      viewBox="0 0 100 100"
      width={config.svgPx}
      height={config.svgPx}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible select-none flex-shrink-0"
      aria-label="Nigrani AI Official Mark"
    >
      <defs>
        {/* Continuous Flow Gradient: Deep Blue -> Trust Blue -> Cyan -> Green */}
        <linearGradient id="n-flow-grad-comp" x1="14" y1="84" x2="82" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="25%" stopColor="#2563EB" />
          <stop offset="65%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Foreground Diagonal Ribbon */}
        <linearGradient id="n-front-ribbon-comp" x1="32" y1="18" x2="82" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="45%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Background Left Pillar */}
        <linearGradient id="n-back-leg-comp" x1="14" y1="84" x2="38" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Observation / Intelligence Dot Node */}
        <linearGradient id="n-dot-grad-comp" x1="66" y1="12" x2="86" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="60%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Upper Shimmer Arch */}
        <linearGradient id="n-top-shimmer-comp" x1="28" y1="14" x2="56" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </linearGradient>

        {/* Glow for observation node */}
        <filter id="n-node-glow-comp" x="60" y="6" width="32" height="32" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Layer 1: Left Vertical Stem & Inner Sweep */}
      <path
        d="M 17 81 C 17 84 21 86 25 86 C 29 86 33 84 33 81 L 33 38 C 33 30 38 24 45 22 C 37 20 28 24 22 32 C 18 38 17 48 17 58 Z"
        fill="url(#n-back-leg-comp)"
      />

      {/* Layer 2: Main Arch & Descending Ribbon */}
      <path
        d="M 17 58 C 17 38 28 17 46 15 C 57 14 67 19 72 28 C 74 32 72 38 67 46 L 47 77 C 44 82 39 85 33 85 L 25 85 C 21 85 17 83 17 81 Z"
        fill="url(#n-flow-grad-comp)"
      />

      {/* Layer 3: Foreground Front Diagonal Fold */}
      <path
        d="M 44 16 C 53 14 64 18 70 28 C 73 33 71 39 66 47 L 46 78 C 43 83 37 86 31 86 L 25 86 C 22 86 20 85 19 83 C 25 83 33 79 38 71 L 58 41 C 61 36 62 31 59 27 C 55 21 47 18 38 20 C 40 18 42 17 44 16 Z"
        fill="url(#n-front-ribbon-comp)"
        opacity="0.95"
      />

      {/* Layer 4: Right Downward Foot Terminal */}
      <path
        d="M 58 41 L 76 72 C 79 77 78 83 74 85 C 70 86 65 85 62 80 L 45 52 Z"
        fill="url(#n-front-ribbon-comp)"
      />

      {/* Layer 5: Top Curve Shimmer Highlight */}
      <path
        d="M 28 26 C 33 19 41 15 50 16 C 59 17 66 22 69 29 C 64 22 55 18 46 19 C 38 20 32 23 28 26 Z"
        fill="url(#n-top-shimmer-comp)"
      />

      {/* Layer 6: Observation / Intelligence Sensor Dot */}
      <circle
        cx="76"
        cy="22"
        r="9.5"
        fill="url(#n-dot-grad-comp)"
        filter="url(#n-node-glow-comp)"
      />
    </svg>
  );

  // If icon-only
  if (isIconOnly) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {emblemSvg}
      </div>
    );
  }

  // If app icon (enclosed squircle)
  if (isAppIcon) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-2xl bg-slate-900 border border-cyan-500/20 shadow-lg shadow-sky-950/30 p-2.5 ${className}`}
      >
        {emblemSvg}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex ${isStacked ? 'flex-col items-center text-center' : 'flex-row items-center'} ${config.gap} select-none ${className}`}
    >
      {/* Emblem Container */}
      <div
        className={`relative flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-900/80 dark:bg-slate-900 border border-slate-700/60 dark:border-cyan-500/20 shadow-sm shadow-sky-950/20 ${config.box}`}
      >
        {emblemSvg}
      </div>

      {/* Official Wordmark */}
      {showWordmark && (
        <div className={`flex flex-col ${isStacked ? 'items-center mt-1' : 'items-start'}`}>
          <div className="flex items-center leading-none">
            <span
              className={`font-black tracking-tight text-slate-900 dark:text-white ${config.wordmark}`}
            >
              Nigrani
            </span>
            <span
              className={`font-black tracking-tight ml-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 bg-clip-text text-transparent ${config.aiText}`}
            >
              AI
            </span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold self-start -mt-0.5 ml-0.5">
              ™
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`font-semibold uppercase text-slate-500 dark:text-slate-400 mt-1 ${config.subText}`}
            >
              {subtitleText || (size === 'xl' ? 'Public Project Intelligence for a Transparent India' : 'Public Project Intelligence')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
