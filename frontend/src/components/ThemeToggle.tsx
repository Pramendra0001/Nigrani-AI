import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';

interface Props {
  variant?: 'segmented' | 'compact' | 'dropdown';
  className?: string;
}

export const ThemeToggle: React.FC<Props> = ({ variant = 'segmented', className = '' }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { id: Theme; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  // 1. Sleek Segmented Control
  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-inner ${className}`}
        role="group"
        aria-label="Theme selection"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
                isSelected
                  ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-white shadow-sm font-bold scale-[1.02]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={`Switch to ${opt.label} mode${opt.id === 'system' ? ` (currently ${resolvedTheme})` : ''}`}
              aria-pressed={isSelected}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. Compact Dropdown / Icon Trigger
  const CurrentIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition backdrop-blur-sm"
        aria-label="Toggle theme dropdown"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        <span className="capitalize text-[11px] hidden sm:inline">{theme}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-1 shadow-xl z-50 text-xs animate-in fade-in duration-100">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setDropdownOpen(false);
                }}
                className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
