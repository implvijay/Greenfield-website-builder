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
