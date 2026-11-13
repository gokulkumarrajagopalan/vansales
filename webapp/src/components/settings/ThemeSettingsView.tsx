import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { themePresets } from '../../data/initialData';
import {
  Palette,
  Check,
  Sparkles,
  Eye,
  CheckCircle2,
  Sliders,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

export const ThemeSettingsView: React.FC = () => {
  const { themeColor, setThemeColor } = useErp();
  const [customColor, setCustomColor] = useState(themeColor);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSelectPreset = (color: string) => {
    setCustomColor(color);
    setThemeColor(color);
    triggerSaved();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
      setThemeColor(customColor);
      triggerSaved();
    }
  };

  const triggerSaved = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="p-6 max-w-5xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <span className="p-2 rounded-xl text-white shadow-sm" style={{ backgroundColor: themeColor }}>
            <Palette className="w-5 h-5" />
          </span>
          Theme & Dynamic Branding Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize the enterprise portal branding, primary actions, and badge colors to match your distribution identity.
        </p>
      </div>

      {savedNotification && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 shadow-xs transition-all animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Theme color updated and applied across all views!</span>
        </div>
      )}

      {/* 1. Curated Color Palettes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Curated Color Palettes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select one of our meticulously crafted high-contrast corporate palettes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {themePresets.map(preset => {
            const isSelected = themeColor.toLowerCase() === preset.primaryColor.toLowerCase();
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.primaryColor)}
                className={`p-4 rounded-xl border text-left transition flex items-center justify-between group ${
                  isSelected
                    ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/10 dark:ring-white/20 shadow-sm bg-slate-50 dark:bg-slate-800/60'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl shadow-xs flex items-center justify-center text-white"
                    style={{ backgroundColor: preset.primaryColor }}
                  >
                    {isSelected && <Check className="w-5 h-5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {preset.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {preset.primaryColor}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Custom Hex Picker */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            Custom Hex Color Picker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter your exact corporate brand hex code or use the native color wheel.
          </p>
        </div>

        <form onSubmit={handleCustomSubmit} className="flex flex-wrap items-center gap-4 pt-2">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="color"
              value={customColor}
              onChange={e => setCustomColor(e.target.value)}
              className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={customColor}
              onChange={e => setCustomColor(e.target.value)}
              placeholder="#059669"
              maxLength={7}
              className="w-28 font-mono text-xs uppercase bg-transparent text-slate-900 dark:text-white focus:outline-none font-bold"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm transition flex items-center gap-2"
            style={{ backgroundColor: customColor }}
          >
            <Check className="w-4 h-4" />
            <span>Apply & Save Theme Color</span>
          </button>
        </form>
      </div>

      {/* 3. Live Interactive Preview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            Live UI Preview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test how buttons, badges, and cards will render in the portal in real time.
          </p>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-wrap items-center gap-4">
          <button
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition"
            style={{ backgroundColor: themeColor }}
          >
            Primary Action Button
          </button>

          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
          >
            Active Nav Pill
          </span>

          <div
            className="p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold"
            style={{ borderColor: `${themeColor}60`, color: themeColor }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Border Highlighted Item</span>
          </div>
        </div>
      </div>
    </div>
  );
};
