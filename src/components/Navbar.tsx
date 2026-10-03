import React from 'react';
import { Sun, Moon, Sparkles, Wifi, Play, Code2 } from 'lucide-react';
import { AppMode, NetworkSpeed } from '../types';

interface NavbarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  networkSpeed: NetworkSpeed;
  onSelectNetworkSpeed: (speed: NetworkSpeed) => void;
  onOpenBrandGuide: () => void;
  onTriggerQuickTest?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  isDarkMode,
  onToggleDarkMode,
  networkSpeed,
  onSelectNetworkSpeed,
  onOpenBrandGuide,
  onTriggerQuickTest,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-[#FBFBF9]/95 dark:bg-[#0F0F11]/95 backdrop-blur-md transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element Brand Zone */}
        <a
          href="#store"
          onClick={(e) => {
            e.preventDefault();
            onSelectMode('store');
          }}
          className="text-xl sm:text-2xl font-serif font-bold tracking-widest text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          LUMEN
        </a>

        {/* Zone 2: 4-6 Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <button
            onClick={() => onSelectMode('store')}
            className={`transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 pb-1 border-b-2 ${
              currentMode === 'store'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent'
            }`}
          >
            Storefront Login
          </button>

          <button
            onClick={() => onSelectMode('ide')}
            className={`transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 pb-1 border-b-2 flex items-center gap-1.5 ${
              currentMode === 'ide'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            IntelliJ Project
          </button>

          <button
            onClick={() => onSelectMode('split')}
            className={`transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 pb-1 border-b-2 flex items-center gap-1.5 ${
              currentMode === 'split'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-500" />
            Live E2E Runner
          </button>

          <button
            onClick={() => onSelectMode('cicd')}
            className={`transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 pb-1 border-b-2 ${
              currentMode === 'cicd'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent'
            }`}
          >
            CI/CD Pipeline
          </button>

          <button
            onClick={onOpenBrandGuide}
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 pb-1 border-b-2 border-transparent text-[#B8860B] dark:text-[#D4AF37]"
          >
            Brand Guide
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions & settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dynamic Network latency control for testing dynamic element loading */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-xs font-mono text-zinc-600 dark:text-zinc-300">
            <Wifi className="w-3 h-3 text-zinc-400" />
            <span className="hidden xl:inline text-[11px] text-zinc-400 mr-1">Latency:</span>
            <button
              onClick={() => onSelectNetworkSpeed('instant')}
              title="Instant network responses"
              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                networkSpeed === 'instant'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-medium'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              0ms
            </button>
            <button
              onClick={() => onSelectNetworkSpeed('normal')}
              title="Simulate standard 1.2s dynamic loading"
              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                networkSpeed === 'normal'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-medium'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              1.2s
            </button>
            <button
              onClick={() => onSelectNetworkSpeed('slow')}
              title="Simulate slow 3.0s dynamic loading (Wait testing)"
              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                networkSpeed === 'slow'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-medium'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              3.0s
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Runner Action */}
          <button
            onClick={() => {
              if (currentMode !== 'split') {
                onSelectMode('split');
              }
              if (onTriggerQuickTest) {
                onTriggerQuickTest();
              }
            }}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Run E2E Suite</span>
            <span className="sm:hidden">Run</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="md:hidden flex items-center justify-around border-t border-zinc-200 dark:border-zinc-800 py-2 px-3 text-xs bg-zinc-50 dark:bg-zinc-900/50">
        <button
          onClick={() => onSelectMode('store')}
          className={`py-1 px-2 rounded ${currentMode === 'store' ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}
        >
          Storefront
        </button>
        <button
          onClick={() => onSelectMode('ide')}
          className={`py-1 px-2 rounded ${currentMode === 'ide' ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}
        >
          IntelliJ Project
        </button>
        <button
          onClick={() => onSelectMode('split')}
          className={`py-1 px-2 rounded ${currentMode === 'split' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}
        >
          E2E Runner
        </button>
        <button
          onClick={() => onSelectMode('cicd')}
          className={`py-1 px-2 rounded ${currentMode === 'cicd' ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}
        >
          CI/CD
        </button>
      </div>
    </header>
  );
};
