// GREENFIELD Website Factory - Type Definitions

export type Role = 'admin' | 'developer' | 'designer' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export type ProjectStatus = 'draft' | 'in-progress' | 'review' | 'published' | 'archived';

export interface Project {
  id: string;
  name: string;
  customer: string;
  industry: IndustryType;
  description: string;
  domain: string;
  location: string;
  contact: ContactInfo;
  status: ProjectStatus;
  themeId: string;
  themeVariant: ThemeVariantType;
  pages: Page[];
  menus: Menu[];
  forms: Form[];
  seo: SEOSettings;
  analytics: AnalyticsSettings;
  media: MediaAsset[];
  versions: Version[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

export type IndustryType =
  | 'corporate' | 'technology' | 'saas' | 'digital-agency'
  | 'consulting' | 'healthcare' | 'education' | 'manufacturing'
  | 'real-estate' | 'hospitality' | 'professional-services'
  | 'local-business' | 'creative' | 'construction' | 'finance-legal';

export type ThemeVariantType = 'default' | 'dark' | 'vibrant' | 'soft';

export interface Theme {
  id: string;
  name: string;
  industry: IndustryType;
  description: string;
  tokens: DesignTokens;
  variants: Record<ThemeVariantType, DesignTokens>;
}

export interface DesignTokens {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    accent: string;
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    textLight: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
    bodyWeight: string;
    headingSize: string;
    bodySize: string;
    lineHeight: string;
  };
  spacing: {
    section: string;
    container: string;
    gap: string;
  };
  borderRadius: string;
  shadow: string;
}

export type PageType =
  | 'home' | 'about' | 'services' | 'service-detail' | 'products'
  | 'solutions' | 'industries' | 'portfolio' | 'case-studies'
  | 'pricing' | 'team' | 'careers' | 'contact' | 'faq'
  | 'testimonials' | 'gallery' | 'locations' | 'landing'
  | 'lead-generation' | 'thank-you' | 'privacy' | 'terms'
  | 'blog-listing' | 'blog-detail' | 'features' | 'process';

export interface Page {
  id: string;
  title: string;
  slug: string;
  type: PageType;
  parentId?: string;
  status: 'draft' | 'published';
  sections: Section[];
  seo: PageSEO;
  order: number;
}

export interface PageSEO {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: string;
  schema?: string;
}

export interface Section {
  id: string;
  type: SectionType;
  variant: string;
  settings: SectionSettings;
  rows: Row[];
  animation?: AnimationSettings;
}

export type SectionType =
  | 'hero' | 'text' | 'image-text' | 'services' | 'features'
  | 'testimonials' | 'statistics' | 'faq' | 'cta' | 'team'
  | 'pricing' | 'gallery' | 'contact' | 'logo-cloud'
  | 'timeline' | 'process' | 'newsletter' | 'video'
  | 'cards' | 'comparison' | 'accordion' | 'blog-cards'
  | 'portfolio' | 'case-studies' | 'map' | 'footer'
  | 'header' | 'announcement-bar' | 'social-links'
  | 'floating-buttons' | 'cookie-notice' | 'breadcrumb';

export interface SectionSettings {
  background?: string;
  backgroundImage?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  padding?: string;
  maxWidth?: string;
  fullWidth?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  customClass?: string;
  visible?: boolean;
}

export interface Row {
  id: string;
  columns: Column[];
  gap?: string;
  alignItems?: string;
}

export interface Column {
  id: string;
  width: number; // percentage
  components: ComponentInstance[];
}

export interface ComponentInstance {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  animation?: AnimationSettings;
}

export type ComponentType =
  | 'heading' | 'paragraph' | 'text' | 'image' | 'button'
  | 'button-group' | 'icon' | 'divider' | 'spacer'
  | 'video' | 'list' | 'badge' | 'tag' | 'stat'
  | 'card' | 'testimonial' | 'team-member' | 'pricing-card'
  | 'faq-item' | 'social-icon' | 'input' | 'textarea'
  | 'select' | 'checkbox' | 'radio' | 'form-field';

export interface AnimationSettings {
  type: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'zoom-in' | 'zoom-out' | 'bounce' | 'shake';
  duration: number;
  delay: number;
}

export interface Menu {
  id: string;
  name: string;
  location: MenuLocation;
  items: MenuItem[];
}

export type MenuLocation = 'primary' | 'utility' | 'mobile' | 'footer' | 'legal' | 'sidebar' | 'custom';

export interface MenuItem {
  id: string;
  label: string;
  type: 'page' | 'url' | 'anchor' | 'email' | 'phone';
  target?: string;
  pageId?: string;
  children: MenuItem[];
  enabled: boolean;
  order: number;
  openInNewTab?: boolean;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  alt: string;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
  uploadedAt: string;
}

export interface Form {
  id: string;
  name: string;
  fields: FormField[];
  submitAction: FormAction;
  successMessage: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'hidden';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
  helpText?: string;
  validation?: string;
}

export interface FormAction {
  type: 'email' | 'webhook' | 'formspree' | 'none';
  endpoint?: string;
  emailTo?: string;
  redirectUrl?: string;
}

export interface SEOSettings {
  siteTitle: string;
  description: string;
  business: string;
  industry: string;
  location: string;
  phone: string;
  email: string;
  social: SocialLinks;
  favicon?: string;
  ogImage?: string;
  schema?: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
}

export interface AnalyticsSettings {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  metaPixelId?: string;
  customScripts?: string;
}

export interface Version {
  id: string;
  name: string;
  description: string;
  snapshot: string; // JSON string of project state
  createdAt: string;
}

export interface ExportJob {
  id: string;
  projectId: string;
  type: 'static' | 'laravel' | 'react';
  status: 'pending' | 'processing' | 'complete' | 'error';
  createdAt: string;
  completedAt?: string;
  outputPath?: string;
  errors?: string[];
}

export interface AIRequest {
  type: 'project-content' | 'page-content' | 'section-content' | 'rewrite' | 'seo';
  projectId: string;
  pageId?: string;
  sectionId?: string;
  prompt?: string;
  provider: 'openai' | 'gemini' | 'deepseek';
}
