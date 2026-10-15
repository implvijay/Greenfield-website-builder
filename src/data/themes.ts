import { Theme, DesignTokens, ThemeVariantType, IndustryType } from '../types';

const createVariant = (base: DesignTokens, variant: ThemeVariantType): DesignTokens => {
  switch (variant) {
    case 'dark':
      return {
        ...base,
        colors: {
          ...base.colors,
          background: '#0f172a',
          surface: '#1e293b',
          surfaceAlt: '#334155',
          text: '#f1f5f9',
          textMuted: '#94a3b8',
          textLight: '#cbd5e1',
          border: '#334155',
        },
      };
    case 'vibrant':
      return {
        ...base,
        colors: {
          ...base.colors,
          primary: base.colors.accent || base.colors.primary,
          background: '#ffffff',
          surface: '#f8fafc',
        },
      };
    case 'soft':
      return {
        ...base,
        colors: {
          ...base.colors,
          primary: base.colors.primaryLight || base.colors.primary,
          background: '#fafaf9',
          surface: '#f5f5f4',
          surfaceAlt: '#e7e5e4',
          text: '#292524',
          textMuted: '#78716c',
          border: '#e7e5e4',
        },
      };
    default:
      return base;
  }
};

export const themes: Theme[] = [
  {
    id: 'corporate',
    name: 'Corporate',
    industry: 'corporate',
    description: 'Professional and authoritative design for corporate businesses',
    tokens: {
      colors: { primary: '#1e40af', primaryLight: '#3b82f6', primaryDark: '#1e3a8a', secondary: '#0f766e', secondaryLight: '#14b8a6', accent: '#f59e0b', background: '#ffffff', surface: '#f8fafc', surfaceAlt: '#f1f5f9', text: '#0f172a', textMuted: '#64748b', textLight: '#94a3b8', border: '#e2e8f0', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Inter, sans-serif', bodyFont: 'Inter, sans-serif', headingWeight: '700', bodyWeight: '400', headingSize: '2.5rem', bodySize: '1rem', lineHeight: '1.6' },
      spacing: { section: '5rem', container: '1200px', gap: '2rem' },
      borderRadius: '0.5rem',
      shadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    },
    variants: {} as any,
  },
  {
    id: 'technology',
    name: 'Technology',
    industry: 'technology',
    description: 'Modern and innovative design for tech companies',
    tokens: {
      colors: { primary: '#6366f1', primaryLight: '#818cf8', primaryDark: '#4338ca', secondary: '#8b5cf6', secondaryLight: '#a78bfa', accent: '#06b6d4', background: '#ffffff', surface: '#f8fafc', surfaceAlt: '#eef2ff', text: '#0f172a', textMuted: '#64748b', textLight: '#94a3b8', border: '#e2e8f0', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Inter, sans-serif', bodyFont: 'Inter, sans-serif', headingWeight: '800', bodyWeight: '400', headingSize: '3rem', bodySize: '1rem', lineHeight: '1.6' },
      spacing: { section: '6rem', container: '1200px', gap: '2rem' },
      borderRadius: '0.75rem',
      shadow: '0 10px 15px -3px rgba(99,102,241,0.1), 0 4px 6px -4px rgba(99,102,241,0.1)',
    },
    variants: {} as any,
  },
  {
    id: 'saas',
    name: 'SaaS',
    industry: 'saas',
    description: 'Clean and conversion-focused design for SaaS products',
    tokens: {
      colors: { primary: '#7c3aed', primaryLight: '#a78bfa', primaryDark: '#5b21b6', secondary: '#2563eb', secondaryLight: '#60a5fa', accent: '#f97316', background: '#ffffff', surface: '#faf5ff', surfaceAlt: '#f3e8ff', text: '#1e1b4b', textMuted: '#6b7280', textLight: '#9ca3af', border: '#e5e7eb', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Inter, sans-serif', bodyFont: 'Inter, sans-serif', headingWeight: '700', bodyWeight: '400', headingSize: '2.75rem', bodySize: '1rem', lineHeight: '1.7' },
      spacing: { section: '5rem', container: '1100px', gap: '1.5rem' },
      borderRadius: '1rem',
      shadow: '0 4px 6px -1px rgba(124,58,237,0.1)',
    },
    variants: {} as any,
  },
  {
    id: 'digital-agency',
    name: 'Digital Agency',
    industry: 'digital-agency',
    description: 'Bold and creative design for digital agencies',
    tokens: {
      colors: { primary: '#ec4899', primaryLight: '#f472b6', primaryDark: '#be185d', secondary: '#8b5cf6', secondaryLight: '#a78bfa', accent: '#fbbf24', background: '#ffffff', surface: '#fdf2f8', surfaceAlt: '#fce7f3', text: '#0f172a', textMuted: '#64748b', textLight: '#94a3b8', border: '#e2e8f0', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Inter, sans-serif', bodyFont: 'Inter, sans-serif', headingWeight: '800', bodyWeight: '400', headingSize: '3.5rem', bodySize: '1.05rem', lineHeight: '1.6' },
      spacing: { section: '6rem', container: '1200px', gap: '2.5rem' },
      borderRadius: '1rem',
      shadow: '0 20px 25px -5px rgba(236,72,153,0.1)',
    },
    variants: {} as any,
  },
  {
    id: 'consulting',
    name: 'Consulting',
    industry: 'consulting',
    description: 'Trustworthy and professional design for consulting firms',
    tokens: {
      colors: { primary: '#0369a1', primaryLight: '#0ea5e9', primaryDark: '#075985', secondary: '#0d9488', secondaryLight: '#2dd4bf', accent: '#ca8a04', background: '#ffffff', surface: '#f0f9ff', surfaceAlt: '#e0f2fe', text: '#0c4a6e', textMuted: '#64748b', textLight: '#94a3b8', border: '#e2e8f0', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Georgia, serif', bodyFont: 'Inter, sans-serif', headingWeight: '700', bodyWeight: '400', headingSize: '2.5rem', bodySize: '1rem', lineHeight: '1.7' },
      spacing: { section: '5rem', container: '1100px', gap: '2rem' },
      borderRadius: '0.375rem',
      shadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
    },
    variants: {} as any,
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    industry: 'healthcare',
    description: 'Clean and caring design for healthcare providers',
    tokens: {
      colors: { primary: '#059669', primaryLight: '#34d399', primaryDark: '#047857', secondary: '#0284c7', secondaryLight: '#38bdf8', accent: '#f59e0b', background: '#ffffff', surface: '#f0fdf4', surfaceAlt: '#dcfce7', text: '#064e3b', textMuted: '#64748b', textLight: '#94a3b8', border: '#d1fae5', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Inter, sans-serif', bodyFont: 'Inter, sans-serif', headingWeight: '600', bodyWeight: '400', headingSize: '2.25rem', bodySize: '1rem', lineHeight: '1.7' },
      spacing: { section: '4rem', container: '1100px', gap: '1.5rem' },
      borderRadius: '0.75rem',
      shadow: '0 4px 6px -1px rgba(5,150,105,0.08)',
    },
    variants: {} as any,
  },
  {
    id: 'education',
    name: 'Education',
    industry: 'education',
    description: 'Friendly and engaging design for educational institutions',
    tokens: {
      colors: { primary: '#2563eb', primaryLight: '#60a5fa', primaryDark: '#1d4ed8', secondary: '#7c3aed', secondaryLight: '#a78bfa', accent: '#f97316', background: '#ffffff', surface: '#eff6ff', surfaceAlt: '#dbeafe', text: '#1e293b', textMuted: '#64748b', textLight: '#94a3b8', border: '#bfdbfe', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Inter, sans-serif', bodyFont: 'Inter, sans-serif', headingWeight: '700', bodyWeight: '400', headingSize: '2.5rem', bodySize: '1rem', lineHeight: '1.7' },
      spacing: { section: '4.5rem', container: '1100px', gap: '2rem' },
      borderRadius: '0.5rem',
      shadow: '0 4px 6px -1px rgba(37,99,235,0.08)',
    },
    variants: {} as any,
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    industry: 'manufacturing',
    description: 'Strong and industrial design for manufacturing companies',
    tokens: {
      colors: { primary: '#dc2626', primaryLight: '#f87171', primaryDark: '#991b1b', secondary: '#1d4ed8', secondaryLight: '#60a5fa', accent: '#f59e0b', background: '#ffffff', surface: '#fef2f2', surfaceAlt: '#fee2e2', text: '#1c1917', textMuted: '#57534e', textLight: '#a8a29e', border: '#e7e5e4', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Inter, sans-serif', bodyFont: 'Inter, sans-serif', headingWeight: '800', bodyWeight: '400', headingSize: '2.75rem', bodySize: '1rem', lineHeight: '1.6' },
      spacing: { section: '5rem', container: '1200px', gap: '2rem' },
      borderRadius: '0.25rem',
      shadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    },
    variants: {} as any,
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    industry: 'real-estate',
    description: 'Elegant and property-focused design for real estate',
    tokens: {
      colors: { primary: '#1e3a5f', primaryLight: '#2563eb', primaryDark: '#1e3a8a', secondary: '#b45309', secondaryLight: '#f59e0b', accent: '#059669', background: '#ffffff', surface: '#f8fafc', surfaceAlt: '#f1f5f9', text: '#0f172a', textMuted: '#64748b', textLight: '#94a3b8', border: '#e2e8f0', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Georgia, serif', bodyFont: 'Inter, sans-serif', headingWeight: '700', bodyWeight: '400', headingSize: '2.5rem', bodySize: '1rem', lineHeight: '1.6' },
      spacing: { section: '5rem', container: '1200px', gap: '2rem' },
      borderRadius: '0.5rem',
      shadow: '0 4px 6px -1px rgba(30,58,95,0.1)',
    },
    variants: {} as any,
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    industry: 'hospitality',
    description: 'Warm and inviting design for restaurants and hospitality',
    tokens: {
      colors: { primary: '#92400e', primaryLight: '#d97706', primaryDark: '#78350f', secondary: '#065f46', secondaryLight: '#059669', accent: '#be185d', background: '#fffbeb', surface: '#fef3c7', surfaceAlt: '#fde68a', text: '#1c1917', textMuted: '#78716c', textLight: '#a8a29e', border: '#fde68a', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Georgia, serif', bodyFont: 'Inter, sans-serif', headingWeight: '600', bodyWeight: '400', headingSize: '2.5rem', bodySize: '1.05rem', lineHeight: '1.7' },
      spacing: { section: '4.5rem', container: '1100px', gap: '2rem' },
      borderRadius: '0.75rem',
      shadow: '0 4px 6px -1px rgba(146,64,14,0.08)',
    },
    variants: {} as any,
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    industry: 'professional-services',
    description: 'Sophisticated design for law firms, accountants, and advisors',
    tokens: {
      colors: { primary: '#1e3a5f', primaryLight: '#3b82f6', primaryDark: '#1e3a8a', secondary: '#7c3aed', secondaryLight: '#a78bfa', accent: '#b45309', background: '#ffffff', surface: '#f8fafc', surfaceAlt: '#f1f5f9', text: '#0f172a', textMuted: '#475569', textLight: '#94a3b8', border: '#e2e8f0', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Georgia, serif', bodyFont: 'Inter, sans-serif', headingWeight: '700', bodyWeight: '400', headingSize: '2.25rem', bodySize: '1rem', lineHeight: '1.7' },
      spacing: { section: '5rem', container: '1000px', gap: '2rem' },
      borderRadius: '0.375rem',
      shadow: '0 2px 4px -1px rgba(0,0,0,0.06)',
    },
    variants: {} as any,
  },
  {
    id: 'creative',
    name: 'Creative',
    industry: 'creative',
    description: 'Bold and expressive design for creative portfolios',
    tokens: {
      colors: { primary: '#0f172a', primaryLight: '#334155', primaryDark: '#020617', secondary: '#f97316', secondaryLight: '#fb923c', accent: '#ec4899', background: '#ffffff', surface: '#f8fafc', surfaceAlt: '#f1f5f9', text: '#0f172a', textMuted: '#64748b', textLight: '#94a3b8', border: '#e2e8f0', error: '#dc2626', success: '#16a34a', warning: '#d97706' },
      typography: { headingFont: 'Inter, sans-serif', bodyFont: 'Inter, sans-serif', headingWeight: '900', bodyWeight: '400', headingSize: '3.5rem', bodySize: '1.05rem', lineHeight: '1.5' },
      spacing: { section: '6rem', container: '1200px', gap: '3rem' },
      borderRadius: '1.5rem',
      shadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
    },
    variants: {} as any,
  },
];

// Generate variants for each theme
themes.forEach(theme => {
  theme.variants = {
    default: theme.tokens,
    dark: createVariant(theme.tokens, 'dark'),
    vibrant: createVariant(theme.tokens, 'vibrant'),
    soft: createVariant(theme.tokens, 'soft'),
  };
});

export const getTheme = (id: string): Theme | undefined => themes.find(t => t.id === id);
export const getThemeTokens = (themeId: string, variant: ThemeVariantType): DesignTokens => {
  const theme = getTheme(themeId);
  if (!theme) return themes[0].tokens;
  return theme.variants[variant] || theme.tokens;
};

export const industryThemes: Record<IndustryType, string> = {
  'corporate': 'corporate',
  'technology': 'technology',
  'saas': 'saas',
  'digital-agency': 'digital-agency',
  'consulting': 'consulting',
  'healthcare': 'healthcare',
  'education': 'education',
  'manufacturing': 'manufacturing',
  'real-estate': 'real-estate',
  'hospitality': 'hospitality',
  'professional-services': 'professional-services',
  'creative': 'creative',
  'local-business': 'corporate',
  'construction': 'manufacturing',
  'finance-legal': 'professional-services',
};
