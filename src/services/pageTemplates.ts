import { Page } from '../types';
import { v4 as uuid } from 'uuid';

const STORAGE_KEY = 'greenfield_page_templates';

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  page: Page;
  createdAt: string;
  category: string;
  tags?: string[];
  industry?: string;
}

export function getPageTemplates(): PageTemplate[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDefaultPageTemplates();
    return JSON.parse(data);
  } catch {
    return getDefaultPageTemplates();
  }
}

export function savePageTemplate(template: Omit<PageTemplate, 'id' | 'createdAt'>): PageTemplate {
  const templates = getPageTemplates();
  const newTemplate: PageTemplate = {
    ...template,
    id: uuid(),
    createdAt: new Date().toISOString(),
  };
  templates.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return newTemplate;
}

export function updatePageTemplate(id: string, updates: Partial<PageTemplate>): PageTemplate | null {
  const templates = getPageTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  templates[index] = { ...templates[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return templates[index];
}

export function deletePageTemplate(id: string): void {
  const templates = getPageTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function createPageFromTemplate(template: PageTemplate): Page {
  // Deep clone and regenerate all IDs
  const clonePage = (p: Page): Page => ({
    ...p,
    id: uuid(),
    sections: p.sections.map(s => ({
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
    })),
  });
  
  return clonePage(template.page);
}

export function searchPageTemplates(query: string): PageTemplate[] {
  if (!query.trim()) return getPageTemplates();
  
  const lowerQuery = query.toLowerCase();
  const templates = getPageTemplates();
  
  return templates.filter(template => {
    if (template.name.toLowerCase().includes(lowerQuery)) return true;
    if (template.description.toLowerCase().includes(lowerQuery)) return true;
    if (template.tags && template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;
    if (template.category.toLowerCase().includes(lowerQuery)) return true;
    if (template.industry && template.industry.toLowerCase().includes(lowerQuery)) return true;
    if (template.page.type.toLowerCase().includes(lowerQuery)) return true;
    return false;
  });
}

export function getAllPageTags(): string[] {
  const templates = getPageTemplates();
  const tagSet = new Set<string>();
  
  templates.forEach(template => {
    if (template.tags) {
      template.tags.forEach(tag => tagSet.add(tag));
    }
  });
  
  return Array.from(tagSet).sort();
}

export function exportPageTemplatesToJSON(): string {
  const templates = getPageTemplates();
  return JSON.stringify(templates, null, 2);
}

export function importPageTemplatesFromJSON(json: string): { success: boolean; count: number; error?: string } {
  try {
    const imported = JSON.parse(json);
    
    if (!Array.isArray(imported)) {
      return { success: false, count: 0, error: 'Invalid format: expected an array of templates' };
    }
    
    const validTemplates = imported.filter((t: any) => {
      return t.name && t.page && t.page.sections;
    }).map((t: any) => ({
      id: uuid(),
      name: t.name,
      description: t.description || '',
      page: t.page,
      createdAt: t.createdAt || new Date().toISOString(),
      category: t.category || 'Custom',
      tags: t.tags || [],
      industry: t.industry,
    }));
    
    const existing = getPageTemplates();
    const merged = [...existing, ...validTemplates];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    
    return { success: true, count: validTemplates.length };
  } catch (error) {
    return { success: false, count: 0, error: 'Failed to parse JSON' };
  }
}

// Duplicate a page with options
export function duplicatePage(page: Page, options: {
  newName?: string;
  newSlug?: string;
  copyContent?: boolean;
  copySEO?: boolean;
}): Page {
  const newPage: Page = {
    ...page,
    id: uuid(),
    title: options.newName || `${page.title} (Copy)`,
    slug: options.newSlug || `${page.slug}-copy`,
    sections: options.copyContent !== false ? page.sections.map(s => ({
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
    })) : [],
    seo: options.copySEO !== false ? { ...page.seo } : { title: '', description: '' },
  };
  
  return newPage;
}

// Compare two pages and return differences
export function comparePages(page1: Page, page2: Page): {
  titleDiff: boolean;
  slugDiff: boolean;
  typeDiff: boolean;
  statusDiff: boolean;
  sectionsCountDiff: number;
  seoDiff: boolean;
} {
  return {
    titleDiff: page1.title !== page2.title,
    slugDiff: page1.slug !== page2.slug,
    typeDiff: page1.type !== page2.type,
    statusDiff: page1.status !== page2.status,
    sectionsCountDiff: page1.sections.length - page2.sections.length,
    seoDiff: JSON.stringify(page1.seo) !== JSON.stringify(page2.seo),
  };
}

function getDefaultPageTemplates(): PageTemplate[] {
  const now = new Date().toISOString();
  
  return [
    {
      id: 'page-home-corporate',
      name: 'Corporate Home Page',
      description: 'Professional home page for corporate websites with hero, features, and CTA',
      category: 'Home',
      tags: ['corporate', 'professional', 'business'],
      industry: 'corporate',
      createdAt: now,
      page: {
        id: uuid(),
        title: 'Home',
        slug: 'home',
        type: 'home',
        status: 'published',
        order: 0,
        seo: { title: 'Welcome | Corporate Website', description: 'Professional corporate website' },
        sections: [],
      },
    },
    {
      id: 'page-about-standard',
      name: 'About Page',
      description: 'Standard about page with company story and team',
      category: 'About',
      tags: ['about', 'company', 'team'],
      industry: 'general',
      createdAt: now,
      page: {
        id: uuid(),
        title: 'About Us',
        slug: 'about',
        type: 'about',
        status: 'published',
        order: 1,
        seo: { title: 'About Us | Company', description: 'Learn about our company' },
        sections: [],
      },
    },
    {
      id: 'page-services-grid',
      name: 'Services Page',
      description: 'Services page with grid layout',
      category: 'Services',
      tags: ['services', 'offerings', 'grid'],
      industry: 'general',
      createdAt: now,
      page: {
        id: uuid(),
        title: 'Our Services',
        slug: 'services',
        type: 'services',
        status: 'published',
        order: 2,
        seo: { title: 'Services | Company', description: 'Our professional services' },
        sections: [],
      },
    },
    {
      id: 'page-contact-form',
      name: 'Contact Page',
      description: 'Contact page with form and information',
      category: 'Contact',
      tags: ['contact', 'form', 'information'],
      industry: 'general',
      createdAt: now,
      page: {
        id: uuid(),
        title: 'Contact Us',
        slug: 'contact',
        type: 'contact',
        status: 'published',
        order: 3,
        seo: { title: 'Contact | Company', description: 'Get in touch with us' },
        sections: [],
      },
    },
  ];
}
