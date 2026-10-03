import React from 'react';
import { X, Check, ShieldCheck, Eye, Palette, Type } from 'lucide-react';
import { lumenBrandGuidelines } from '../data/brandGuidelines';

interface BrandGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const BrandGuideModal: React.FC<BrandGuideModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  const palette = isDarkMode ? lumenBrandGuidelines.palette.dark : lumenBrandGuidelines.palette.light;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl p-6 sm:p-8 transition-colors border shadow-2xl"
        style={{
          backgroundColor: palette.card,
          borderColor: palette.border,
          color: palette.textPrimary,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-black/10 dark:border-white/10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B8860B] dark:text-[#D4AF37] font-semibold">
              Design System & Specification
            </span>
            <h2 id="brand-guide-title" className="text-2xl sm:text-3xl font-serif font-medium mt-1">
              Lumen Atelier Brand Guidelines
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Luxury minimalist retail identity with dark mode parity and WCAG AA contrast compliance.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Brand Guide"
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 60-30-10 Color System */}
        <div className="py-6 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-[#B8860B] dark:text-[#D4AF37]" />
            <h3 className="text-sm font-semibold tracking-wide uppercase">60-30-10 Palette Allocation</h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Curated neutral surfaces with zero saturated neon slop. Champagne gold reserved strictly for focal interactive affordances.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">60% Canvas</span>
                <span className="text-xs font-mono">{palette.canvas}</span>
              </div>
              <div className="h-10 rounded border border-black/10 dark:border-white/10" style={{ backgroundColor: palette.canvas }} />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                Dominant neutral ground (Travertine ivory / Obsidian slate).
              </p>
            </div>

            <div className="p-3 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">30% Structural</span>
                <span className="text-xs font-mono">{palette.surface}</span>
              </div>
              <div className="h-10 rounded border border-black/10 dark:border-white/10" style={{ backgroundColor: palette.surface }} />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                Card surfaces, hairline dividers, subdued form containers.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">10% Accent</span>
                <span className="text-xs font-mono">{palette.accent}</span>
              </div>
              <div className="h-10 rounded border border-black/10 dark:border-white/10" style={{ backgroundColor: palette.accent }} />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                Champagne gold CTA buttons, focused focus-rings, active state markers.
              </p>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="py-6 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-[#B8860B] dark:text-[#D4AF37]" />
            <h3 className="text-sm font-semibold tracking-wide uppercase">Typography Pairing (2+1 Rule)</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-black/10 dark:border-white/10">
              <div className="text-xs text-zinc-400 mb-1">Display & Editorial Headings</div>
              <div className="text-2xl font-serif">Cormorant Garamond — Luxury Craftsmanship</div>
              <div className="text-xs text-zinc-500 font-mono mt-1">Weight: 400-600 · Used for brand wordmark, page titles & hero story</div>
            </div>
            <div className="p-3 rounded-lg border border-black/10 dark:border-white/10">
              <div className="text-xs text-zinc-400 mb-1">Interface Prose & Controls</div>
              <div className="text-sm font-sans font-medium">Plus Jakarta Sans — Optimal Digital Readability</div>
              <div className="text-xs text-zinc-500 font-mono mt-1">Weight: 400-600 · Form inputs, helper labels, buttons, dialog text</div>
            </div>
            <div className="p-3 rounded-lg border border-black/10 dark:border-white/10">
              <div className="text-xs text-zinc-400 mb-1">Automated Testing & Tabular Numerals</div>
              <div className="text-xs font-mono">JetBrains Mono — 42 items · $1,450.00 · By.id("login-email-input")</div>
              <div className="text-xs text-zinc-500 font-mono mt-1">Tabular figures for prices, countdown timers & Selenium locators</div>
            </div>
          </div>
        </div>

        {/* Brand Rules & Verification */}
        <div className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold tracking-wide uppercase">Non-Negotiable Brand Rules</h3>
          </div>
          <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            {lumenBrandGuidelines.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium rounded-lg text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
          >
            Got it, Return to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
