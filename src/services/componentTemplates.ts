import { ComponentInstance } from '../types';
import { v4 as uuid } from 'uuid';
import { Save, Download, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'greenfield_component_templates';

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  componentType: string;
  props: any;
  createdAt: string;
  category: string;
  tags?: string[];
}

export function getComponentTemplates(): ComponentTemplate[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultTemplates();
  } catch {
    return getDefaultTemplates();
  }
}

export function saveComponentTemplate(template: Omit<ComponentTemplate, 'id' | 'createdAt'>): ComponentTemplate {
  const templates = getComponentTemplates();
  const newTemplate: ComponentTemplate = {
    ...template,
    id: uuid(),
    createdAt: new Date().toISOString(),
  };
  templates.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return newTemplate;
}

export function deleteComponentTemplate(id: string): void {
  const templates = getComponentTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function createComponentFromTemplate(template: ComponentTemplate): ComponentInstance {
  return {
    id: uuid(),
    type: template.componentType as any,
    props: JSON.parse(JSON.stringify(template.props)),
  };
}

function getDefaultTemplates(): ComponentTemplate[] {
  return [
    {
      id: 'tpl-heading-large',
      name: 'Large Heading',
      description: 'Large centered heading with 5xl size',
      componentType: 'heading',
      props: { text: 'Your Heading Here', level: 1, size: '5xl' },
      createdAt: new Date().toISOString(),
      category: 'Headings',
    },
    {
      id: 'tpl-paragraph-intro',
      name: 'Introduction Paragraph',
      description: 'Large introductory paragraph',
      componentType: 'paragraph',
      props: { text: 'Welcome to our website. We are dedicated to providing exceptional service and innovative solutions for your business needs.' },
      createdAt: new Date().toISOString(),
      category: 'Text',
    },
    {
      id: 'tpl-cta-primary',
      name: 'Primary CTA Button',
      description: 'Primary call-to-action button',
      componentType: 'button',
      props: { text: 'Get Started', variant: 'primary', url: '#' },
      createdAt: new Date().toISOString(),
      category: 'Buttons',
    },
    {
      id: 'tpl-card-feature',
      name: 'Feature Card',
      description: 'Card with icon and description',
      componentType: 'card',
      props: { title: 'Feature Name', description: 'Describe this amazing feature and how it benefits your customers.', icon: '⭐', image: '' },
      createdAt: new Date().toISOString(),
      category: 'Cards',
    },
    {
      id: 'tpl-stat-large',
      name: 'Large Stat',
      description: 'Large statistic display',
      componentType: 'stat',
      props: { value: '100+', label: 'Happy Customers', icon: '📊' },
      createdAt: new Date().toISOString(),
      category: 'Statistics',
    },
    {
      id: 'tpl-testimonial-quote',
      name: 'Customer Testimonial',
      description: 'Customer testimonial with quote',
      componentType: 'testimonial',
      props: { text: 'This product exceeded our expectations. The team delivered outstanding results on time and within budget.', name: 'John Doe', role: 'CEO, Company Name', avatar: '' },
      createdAt: new Date().toISOString(),
      category: 'Testimonials',
    },
  ];
}

// Search templates by name, description, or tags
export function searchTemplates(query: string): ComponentTemplate[] {
  if (!query.trim()) return getComponentTemplates();
  
  const lowerQuery = query.toLowerCase();
  const templates = getComponentTemplates();
  
  return templates.filter(template => {
    // Search in name
    if (template.name.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in description
    if (template.description.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in tags
    if (template.tags && template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;
    
    // Search in category
    if (template.category.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in component type
    if (template.componentType.toLowerCase().includes(lowerQuery)) return true;
    
    return false;
  });
}

// Get all unique tags
export function getAllTags(): string[] {
  const templates = getComponentTemplates();
  const tagSet = new Set<string>();
  
  templates.forEach(template => {
    if (template.tags) {
      template.tags.forEach(tag => tagSet.add(tag));
    }
  });
  
  return Array.from(tagSet).sort();
}

// Filter templates by tags
export function filterTemplatesByTags(tags: string[]): ComponentTemplate[] {
  if (tags.length === 0) return getComponentTemplates();
  
  const templates = getComponentTemplates();
  return templates.filter(template => {
    if (!template.tags || template.tags.length === 0) return false;
    return tags.some(tag => template.tags!.includes(tag));
  });
}

// Export templates to JSON
export function exportTemplatesToJSON(): string {
  const templates = getComponentTemplates();
  return JSON.stringify(templates, null, 2);
}

// Import templates from JSON
export function importTemplatesFromJSON(json: string): { success: boolean; count: number; error?: string } {
  try {
    const imported = JSON.parse(json);
    
    if (!Array.isArray(imported)) {
      return { success: false, count: 0, error: 'Invalid format: expected an array of templates' };
    }
    
    // Validate each template
    const validTemplates = imported.filter((t: any) => {
      return t.name && t.componentType && t.props;
    }).map((t: any) => ({
      id: uuid(),
      name: t.name,
      description: t.description || '',
      componentType: t.componentType,
      props: t.props,
      createdAt: t.createdAt || new Date().toISOString(),
      category: t.category || 'Custom',
      tags: t.tags || [],
    }));
    
    // Merge with existing templates
    const existing = getComponentTemplates();
    const merged = [...existing, ...validTemplates];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    
    return { success: true, count: validTemplates.length };
  } catch (error) {
    return { success: false, count: 0, error: 'Failed to parse JSON' };
  }
}
