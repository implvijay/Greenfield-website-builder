import { Section } from '../types';
import { v4 as uuid } from 'uuid';

const STORAGE_KEY = 'greenfield_section_templates';

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  section: Section;
  createdAt: string;
  category: string;
  tags?: string[];
  previewColor?: string;
}

export function getSectionTemplates(): SectionTemplate[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDefaultSectionTemplates();
    return JSON.parse(data);
  } catch {
    return getDefaultSectionTemplates();
  }
}

export function saveSectionTemplate(template: Omit<SectionTemplate, 'id' | 'createdAt'>): SectionTemplate {
  const templates = getSectionTemplates();
  const newTemplate: SectionTemplate = {
    ...template,
    id: uuid(),
    createdAt: new Date().toISOString(),
  };
  templates.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return newTemplate;
}

export function updateSectionTemplate(id: string, updates: Partial<SectionTemplate>): SectionTemplate | null {
  const templates = getSectionTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  templates[index] = { ...templates[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return templates[index];
}

export function deleteSectionTemplate(id: string): void {
  const templates = getSectionTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function createSectionFromTemplate(template: SectionTemplate): Section {
  // Deep clone and regenerate all IDs
  const cloneSection = (s: Section): Section => ({
    ...s,
    id: uuid(),
    rows: s.rows.map(r => ({
      ...r,
      id: uuid(),
      columns: r.columns.map(c => ({
        ...c,
        id: uuid(),
        components: c.components.map(comp => ({ ...comp, id: uuid() })),
      })),
    })),
  });
  
  return cloneSection(template.section);
}

export function searchSectionTemplates(query: string): SectionTemplate[] {
  if (!query.trim()) return getSectionTemplates();
  
  const lowerQuery = query.toLowerCase();
  const templates = getSectionTemplates();
  
  return templates.filter(template => {
    if (template.name.toLowerCase().includes(lowerQuery)) return true;
    if (template.description.toLowerCase().includes(lowerQuery)) return true;
    if (template.tags && template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;
    if (template.category.toLowerCase().includes(lowerQuery)) return true;
    if (template.section.type.toLowerCase().includes(lowerQuery)) return true;
    return false;
  });
}

export function getAllSectionTags(): string[] {
  const templates = getSectionTemplates();
  const tagSet = new Set<string>();
  
  templates.forEach(template => {
    if (template.tags) {
      template.tags.forEach(tag => tagSet.add(tag));
    }
  });
  
  return Array.from(tagSet).sort();
}

export function exportSectionTemplatesToJSON(): string {
  const templates = getSectionTemplates();
  return JSON.stringify(templates, null, 2);
}

export function importSectionTemplatesFromJSON(json: string): { success: boolean; count: number; error?: string } {
  try {
    const imported = JSON.parse(json);
    
    if (!Array.isArray(imported)) {
      return { success: false, count: 0, error: 'Invalid format: expected an array of templates' };
    }
    
    const validTemplates = imported.filter((t: any) => {
      return t.name && t.section && t.section.rows;
    }).map((t: any) => ({
      id: uuid(),
      name: t.name,
      description: t.description || '',
      section: t.section,
      createdAt: t.createdAt || new Date().toISOString(),
      category: t.category || 'Custom',
      tags: t.tags || [],
      previewColor: t.previewColor,
    }));
    
    const existing = getSectionTemplates();
    const merged = [...existing, ...validTemplates];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    
    return { success: true, count: validTemplates.length };
  } catch (error) {
    return { success: false, count: 0, error: 'Failed to parse JSON' };
  }
}

function getDefaultSectionTemplates(): SectionTemplate[] {
  const now = new Date().toISOString();
  
  return [
    {
      id: 'sec-hero-gradient',
      name: 'Hero with Gradient Background',
      description: 'Full-width hero section with gradient background, heading, subheading, and CTA buttons',
      category: 'Hero',
      tags: ['hero', 'gradient', 'cta'],
      previewColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      createdAt: now,
      section: {
        id: uuid(),
        type: 'hero',
        variant: 'default',
        settings: { background: 'gradient', padding: '6rem 0', textAlign: 'center', fullWidth: true },
        rows: [{
          id: uuid(),
          columns: [{
            id: uuid(),
            width: 100,
            components: [
              { id: uuid(), type: 'heading', props: { text: 'Welcome to Our Website', level: 1, size: '5xl' } },
              { id: uuid(), type: 'paragraph', props: { text: 'We help businesses grow with innovative solutions and expert guidance.' } },
              { id: uuid(), type: 'button-group', props: { buttons: [
                { label: 'Get Started', variant: 'primary' },
                { label: 'Learn More', variant: 'outline' }
              ]}},
            ],
          }],
        }],
        animation: { type: 'fade', duration: 800, delay: 0 },
      },
    },
    {
      id: 'sec-features-grid',
      name: 'Features Grid',
      description: 'Three-column grid of feature cards with icons',
      category: 'Features',
      tags: ['features', 'grid', 'cards'],
      previewColor: '#f8fafc',
      createdAt: now,
      section: {
        id: uuid(),
        type: 'features',
        variant: 'grid',
        settings: { padding: '5rem 0', textAlign: 'center' },
        rows: [{
          id: uuid(),
          columns: [{
            id: uuid(),
            width: 100,
            components: [
              { id: uuid(), type: 'heading', props: { text: 'Our Features', level: 2, size: '3xl' } },
              { id: uuid(), type: 'paragraph', props: { text: 'Everything you need to succeed, all in one place.' } },
              { id: uuid(), type: 'card', props: { cards: [
                { title: 'Fast Performance', description: 'Lightning-fast load times and smooth interactions.', icon: '⚡' },
                { title: 'Secure & Reliable', description: 'Enterprise-grade security you can trust.', icon: '🔒' },
                { title: '24/7 Support', description: 'Our team is here to help whenever you need.', icon: '💬' },
              ]}},
            ],
          }],
        }],
      },
    },
    {
      id: 'sec-stats-bar',
      name: 'Statistics Bar',
      description: 'Four-column statistics display with large numbers',
      category: 'Statistics',
      tags: ['stats', 'numbers', 'metrics'],
      previewColor: '#ffffff',
      createdAt: now,
      section: {
        id: uuid(),
        type: 'statistics',
        variant: 'default',
        settings: { padding: '4rem 0' },
        rows: [{
          id: uuid(),
          columns: [{
            id: uuid(),
            width: 100,
            components: [
              { id: uuid(), type: 'stat', props: { stats: [
                { value: '500+', label: 'Happy Clients' },
                { value: '98%', label: 'Satisfaction Rate' },
                { value: '24/7', label: 'Support Available' },
                { value: '15+', label: 'Years Experience' },
              ]}},
            ],
          }],
        }],
      },
    },
    {
      id: 'sec-testimonials',
      name: 'Testimonials Grid',
      description: 'Three-column testimonials with quotes and author info',
      category: 'Testimonials',
      tags: ['testimonials', 'reviews', 'social-proof'],
      previewColor: '#f1f5f9',
      createdAt: now,
      section: {
        id: uuid(),
        type: 'testimonials',
        variant: 'cards',
        settings: { padding: '5rem 0' },
        rows: [{
          id: uuid(),
          columns: [{
            id: uuid(),
            width: 100,
            components: [
              { id: uuid(), type: 'heading', props: { text: 'What Our Clients Say', level: 2, size: '3xl' } },
              { id: uuid(), type: 'testimonial', props: { testimonials: [
                { name: 'Sarah Johnson', role: 'CEO, TechCorp', text: 'This service transformed our business. Highly recommended!' },
                { name: 'Michael Chen', role: 'Director, InnovateCo', text: 'Exceptional quality and support. Worth every penny.' },
                { name: 'Emily Rodriguez', role: 'VP, GrowthLabs', text: 'The team delivered beyond our expectations. Amazing work!' },
              ]}},
            ],
          }],
        }],
      },
    },
    {
      id: 'sec-cta-banner',
      name: 'CTA Banner',
      description: 'Call-to-action section with gradient background',
      category: 'CTA',
      tags: ['cta', 'conversion', 'banner'],
      previewColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      createdAt: now,
      section: {
        id: uuid(),
        type: 'cta',
        variant: 'default',
        settings: { background: 'gradient', padding: '5rem 0', textAlign: 'center' },
        rows: [{
          id: uuid(),
          columns: [{
            id: uuid(),
            width: 100,
            components: [
              { id: uuid(), type: 'heading', props: { text: 'Ready to Get Started?', level: 2, size: '3xl' } },
              { id: uuid(), type: 'paragraph', props: { text: 'Join thousands of satisfied customers today.' } },
              { id: uuid(), type: 'button-group', props: { buttons: [
                { label: 'Start Free Trial', variant: 'primary' },
                { label: 'Contact Sales', variant: 'outline' }
              ]}},
            ],
          }],
        }],
      },
    },
  ];
}
