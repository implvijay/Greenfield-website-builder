import { useState } from 'react';
import { DesignTokens, ThemeVariantType } from '../types';
import { themes, getThemeTokens } from '../data/themes';
import { Palette, Type, Ruler, RotateCcw, Check } from 'lucide-react';

interface ThemeCustomizerProps {
  currentThemeId: string;
  currentVariant: ThemeVariantType;
  onThemeChange: (themeId: string, variant: ThemeVariantType) => void;
}

export function ThemeCustomizer({ currentThemeId, currentVariant, onThemeChange }: ThemeCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'typography' | 'spacing'>('themes');
  const tokens = getThemeTokens(currentThemeId, currentVariant);

  const variants: { id: ThemeVariantType; label: string; preview: string }[] = [
    { id: 'default', label: 'Default', preview: 'bg-white' },
    { id: 'dark', label: 'Dark', preview: 'bg-slate-900' },
    { id: 'vibrant', label: 'Vibrant', preview: 'bg-gradient-to-r from-pink-500 to-purple-500' },
    { id: 'soft', label: 'Soft', preview: 'bg-stone-100' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'themes', label: 'Themes', icon: Palette },
          { id: 'colors', label: 'Colors', icon: Palette },
          { id: 'typography', label: 'Typography', icon: Type },
          { id: 'spacing', label: 'Spacing', icon: Ruler },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'themes' && (
          <div className="space-y-6">
            {/* Theme Grid */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Theme</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => onThemeChange(theme.id, currentVariant)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      currentThemeId === theme.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-full border border-slate-200"
                        style={{ backgroundColor: theme.tokens.colors.primary }}
                      />
                      <span className="text-xs font-medium text-slate-900">{theme.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {[theme.tokens.colors.primary, theme.tokens.colors.secondary, theme.tokens.colors.accent].map((color, i) => (
                        <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    {currentThemeId === theme.id && (
                      <div className="absolute top-1 right-1">
                        <Check size={14} className="text-indigo-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Variant</h3>
              <div className="grid grid-cols-4 gap-3">
                {variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => onThemeChange(currentThemeId, variant.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      currentVariant === variant.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-full h-12 rounded-lg mb-2 ${variant.preview} border border-slate-200`} />
                    <span className="text-xs font-medium text-slate-900">{variant.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Color Palette</h3>
              <button className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <RotateCcw size={12} />
                Reset to defaults
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(tokens.colors).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm"
                    style={{ backgroundColor: value }}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Typography Settings</h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Heading Font</p>
                <p className="text-lg font-bold" style={{ fontFamily: tokens.typography.headingFont }}>
                  The quick brown fox jumps over the lazy dog
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">{tokens.typography.headingFont}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Body Font</p>
                <p style={{ fontFamily: tokens.typography.bodyFont }}>
                  The quick brown fox jumps over the lazy dog. This is how body text will appear on your website.
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">{tokens.typography.bodyFont}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Heading Size</p>
                  <p className="text-sm font-medium text-slate-900">{tokens.typography.headingSize}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Body Size</p>
                  <p className="text-sm font-medium text-slate-900">{tokens.typography.bodySize}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Heading Weight</p>
                  <p className="text-sm font-medium text-slate-900">{tokens.typography.headingWeight}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Line Height</p>
                  <p className="text-sm font-medium text-slate-900">{tokens.typography.lineHeight}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Spacing & Layout</h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-2">Section Spacing</p>
                <div className="h-8 bg-indigo-200 rounded" style={{ width: tokens.spacing.section }} />
                <p className="text-xs text-slate-500 mt-1 font-mono">{tokens.spacing.section}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-2">Container Width</p>
                <div className="h-8 bg-indigo-200 rounded" style={{ width: '100%', maxWidth: tokens.spacing.container }} />
                <p className="text-xs text-slate-500 mt-1 font-mono">{tokens.spacing.container}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-2">Gap Spacing</p>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-indigo-200 rounded" />
                  <div className="h-8 w-8 bg-indigo-200 rounded" style={{ marginLeft: tokens.spacing.gap }} />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono">{tokens.spacing.gap}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Border Radius</p>
                  <p className="text-sm font-medium text-slate-900">{tokens.borderRadius}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Shadow</p>
                  <p className="text-xs text-slate-900 truncate">{tokens.shadow}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
