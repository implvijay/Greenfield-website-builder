import { useState } from 'react';
import { useStore } from '../store';
import { AppLayout, Breadcrumbs } from '../components/Layout';
import { themes, getThemeTokens } from '../data/themes';
import { ThemeVariantType } from '../types';
import { Check, Eye } from 'lucide-react';

export function ThemesPage() {
  const { state } = useStore();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ThemeVariantType>('default');
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  const variants: { id: ThemeVariantType; label: string }[] = [
    { id: 'default', label: 'Default' },
    { id: 'dark', label: 'Dark' },
    { id: 'vibrant', label: 'Vibrant' },
    { id: 'soft', label: 'Soft' },
  ];

  const previewTokens = previewTheme ? getThemeTokens(previewTheme, selectedVariant) : null;

  return (
    <AppLayout>
      <div className="p-8">
        <Breadcrumbs items={[{ label: 'Dashboard', path: '/' }, { label: 'Themes' }]} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Theme Library</h1>
            <p className="text-slate-500 mt-1">{themes.length} themes × {variants.length} variants = {themes.length * variants.length} experiences</p>
          </div>
          <div className="flex items-center gap-2">
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedVariant === v.id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {themes.map(theme => {
            const tokens = getThemeTokens(theme.id, selectedVariant);
            const isSelected = selectedTheme === theme.id;

            return (
              <div
                key={theme.id}
                className={`bg-white rounded-xl border-2 overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                  isSelected ? 'border-indigo-500 shadow-lg' : 'border-slate-200'
                }`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                {/* Theme Preview */}
                <div className="relative h-32 overflow-hidden" style={{ backgroundColor: tokens.colors.background }}>
                  {/* Mini header */}
                  <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${tokens.colors.border}` }}>
                    <span style={{ fontWeight: '700', fontSize: '0.7rem', color: tokens.colors.primary }}>
                      {theme.name}
                    </span>
                    <div className="flex gap-1">
                      <span style={{ width: '12px', height: '3px', borderRadius: '2px', backgroundColor: tokens.colors.textMuted }}></span>
                      <span style={{ width: '12px', height: '3px', borderRadius: '2px', backgroundColor: tokens.colors.textMuted }}></span>
                      <span style={{ width: '12px', height: '3px', borderRadius: '2px', backgroundColor: tokens.colors.textMuted }}></span>
                    </div>
                  </div>
                  {/* Mini hero */}
                  <div className="flex flex-col items-center justify-center h-full px-3" style={{ background: `linear-gradient(135deg, ${tokens.colors.primary}20, ${tokens.colors.secondary}20)` }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: tokens.typography.headingWeight, color: tokens.colors.text, textAlign: 'center' }}>
                      {theme.description.slice(0, 40)}...
                    </span>
                    <div className="flex gap-1 mt-2">
                      <span style={{ padding: '2px 6px', fontSize: '0.5rem', borderRadius: '3px', backgroundColor: tokens.colors.primary, color: '#fff' }}>CTA</span>
                      <span style={{ padding: '2px 6px', fontSize: '0.5rem', borderRadius: '3px', border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text }}>Learn</span>
                    </div>
                  </div>

                  {/* Preview button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewTheme(theme.id); }}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-md opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Eye size={12} className="text-slate-600" />
                  </button>

                  {isSelected && (
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-slate-900 text-sm">{theme.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{theme.industry.replace('-', ' ')}</p>

                  {/* Color swatches */}
                  <div className="flex gap-1 mt-2">
                    {[tokens.colors.primary, tokens.colors.secondary, tokens.colors.accent, tokens.colors.background, tokens.colors.text].map((color, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Theme Preview Modal */}
        {previewTheme && previewTokens && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-auto">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Theme Preview - {themes.find(t => t.id === previewTheme)?.name} ({selectedVariant})</h3>
                <button onClick={() => setPreviewTheme(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
              <div className="p-6">
                {/* Full Preview */}
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  {/* Header */}
                  <header style={{ backgroundColor: previewTokens.colors.background, borderBottom: `1px solid ${previewTokens.colors.border}`, padding: '1rem 1.5rem' }}>
                    <div className="flex items-center justify-between" style={{ maxWidth: '800px', margin: '0 auto' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.1rem', color: previewTokens.colors.primary }}>
                        {themes.find(t => t.id === previewTheme)?.name}
                      </span>
                      <nav className="flex gap-4">
                        {['Home', 'About', 'Services', 'Contact'].map(item => (
                          <span key={item} style={{ fontSize: '0.8rem', color: previewTokens.colors.text, fontWeight: '500' }}>{item}</span>
                        ))}
                      </nav>
                    </div>
                  </header>

                  {/* Hero */}
                  <section style={{ background: `linear-gradient(135deg, ${previewTokens.colors.primary}, ${previewTokens.colors.primaryDark})`, padding: '3rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                      <h1 style={{ fontFamily: previewTokens.typography.headingFont, fontWeight: previewTokens.typography.headingWeight, fontSize: previewTokens.typography.headingSize, color: '#ffffff', marginBottom: '1rem' }}>
                        Welcome to Our Website
                      </h1>
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: previewTokens.typography.bodySize, marginBottom: '1.5rem' }}>
                        This is a preview of how content will look with this theme and variant.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <span style={{ padding: '0.6rem 1.25rem', backgroundColor: '#ffffff', color: previewTokens.colors.primary, borderRadius: previewTokens.borderRadius, fontWeight: '600', fontSize: '0.85rem' }}>Get Started</span>
                        <span style={{ padding: '0.6rem 1.25rem', border: '2px solid rgba(255,255,255,0.5)', color: '#ffffff', borderRadius: previewTokens.borderRadius, fontWeight: '600', fontSize: '0.85rem' }}>Learn More</span>
                      </div>
                    </div>
                  </section>

                  {/* Features */}
                  <section style={{ backgroundColor: previewTokens.colors.background, padding: '3rem 1.5rem' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                      <h2 style={{ fontFamily: previewTokens.typography.headingFont, fontWeight: previewTokens.typography.headingWeight, fontSize: '1.75rem', color: previewTokens.colors.text, marginBottom: '2rem' }}>Our Features</h2>
                      <div className="grid grid-cols-3 gap-4">
                        {['Innovation', 'Quality', 'Support'].map((feat, i) => (
                          <div key={i} style={{ backgroundColor: previewTokens.colors.surface, borderRadius: previewTokens.borderRadius, padding: '1.5rem', border: `1px solid ${previewTokens.colors.border}` }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: previewTokens.colors.primary + '20', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: previewTokens.colors.primary, fontWeight: '700' }}>{i + 1}</div>
                            <h3 style={{ fontWeight: '600', color: previewTokens.colors.text, marginBottom: '0.25rem', fontSize: '0.9rem' }}>{feat}</h3>
                            <p style={{ fontSize: '0.75rem', color: previewTokens.colors.textMuted }}>Description of this feature goes here.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* CTA */}
                  <section style={{ backgroundColor: previewTokens.colors.surface, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                    <h2 style={{ fontWeight: '700', fontSize: '1.5rem', color: previewTokens.colors.text, marginBottom: '0.5rem' }}>Ready to Start?</h2>
                    <p style={{ color: previewTokens.colors.textMuted, marginBottom: '1rem', fontSize: '0.9rem' }}>Contact us today to learn more.</p>
                    <span style={{ padding: '0.6rem 1.25rem', backgroundColor: previewTokens.colors.primary, color: '#ffffff', borderRadius: previewTokens.borderRadius, fontWeight: '600', fontSize: '0.85rem' }}>Contact Us</span>
                  </section>

                  {/* Footer */}
                  <footer style={{ backgroundColor: previewTokens.colors.background, borderTop: `1px solid ${previewTokens.colors.border}`, padding: '1.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: previewTokens.colors.textMuted }}>© 2024 {themes.find(t => t.id === previewTheme)?.name}. All rights reserved.</p>
                  </footer>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => { setSelectedTheme(previewTheme); setPreviewTheme(null); }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
                >
                  Select This Theme
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
