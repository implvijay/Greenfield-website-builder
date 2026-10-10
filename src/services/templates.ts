import { Section, Page } from '../types';
import { v4 as uuid } from 'uuid';

// Reusable Section Library
export interface SavedSection {
  id: string;
  name: string;
  category: string;
  section: Section;
  createdAt: string;
}

// Page Template
export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  pageType: string;
  sections: Section[];
  createdAt: string;
}

const SECTIONS_KEY = 'greenfield_sections_library';
const TEMPLATES_KEY = 'greenfield_page_templates';

// Section Library
export function getSavedSections(): SavedSection[] {
  try {
    const data = localStorage.getItem(SECTIONS_KEY);
    return data ? JSON.parse(data) : getDefaultSections();
  } catch { return getDefaultSections(); }
}

export function saveSection(section: SavedSection) {
  const sections = getSavedSections();
  sections.push(section);
  localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
}

export function deleteSavedSection(id: string) {
  const sections = getSavedSections().filter(s => s.id !== id);
  localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
}

// Page Templates
export function getPageTemplates(): PageTemplate[] {
  try {
    const data = localStorage.getItem(TEMPLATES_KEY);
    return data ? JSON.parse(data) : getDefaultTemplates();
  } catch { return getDefaultTemplates(); }
}

export function savePageTemplate(template: PageTemplate) {
  const templates = getPageTemplates();
  templates.push(template);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function deletePageTemplate(id: string) {
  const templates = getPageTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

// Apply template to page
export function applyTemplateToPage(page: Page, template: PageTemplate): Page {
  // Deep clone sections with new IDs
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

  return {
    ...page,
    sections: template.sections.map(cloneSection),
  };
}

// Default sections library
function getDefaultSections(): SavedSection[] {
  return [
    {
      id: 'default-hero-gradient',
      name: 'Hero with Gradient',
      category: 'Hero',
      section: {
        id: uuid(),
        type: 'hero',
        variant: 'default',
        settings: { background: 'gradient', overlay: true, overlayOpacity: 0.7, padding: '8rem 0', textAlign: 'center', fullWidth: true },
        rows: [{
          id: uuid(),
          columns: [{
            id: uuid(), width: 100,
            components: [
              { id: uuid(), type: 'heading', props: { text: 'Transform Your Business Today', level: 1, size: '5xl' } },
              { id: uuid(), type: 'paragraph', props: { text: 'Join thousands of companies that trust us to deliver exceptional results.' } },
              { id: uuid(), type: 'button-group', props: { buttons: [{ label: 'Get Started', variant: 'primary' }, { label: 'Learn More', variant: 'outline' }] } },
            ],
          }],
        }],
        animation: { type: 'fade', duration: 800, delay: 0 },
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-services-cards',
      name: 'Services Cards',
      category: 'Services',
      section: {
        id: uuid(),
        type: 'services',
        variant: 'cards',
        settings: { padding: '5rem 0', textAlign: 'center' },
        rows: [{
          id: uuid(),
          columns: [{
            id: uuid(), width: 100,
            components: [
              { id: uuid(), type: 'heading', props: { text: 'What We Offer', level: 2, size: '3xl' } },
              { id: uuid(), type: 'paragraph', props: { text: 'Comprehensive solutions designed to meet your unique needs.' } },
              { id: uuid(), type: 'card', props: { cards: [
                { title: 'Strategy', description: 'Data-driven strategies for sustainable growth.', icon: '📊' },
                { title: 'Execution', description: 'Flawless implementation with attention to detail.', icon: '⚡' },
                { title: 'Support', description: 'Ongoing partnership for long-term success.', icon: '🤝' },
              ]}},
            ],
          }],
        }],
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-stats',
      name: 'Statistics Bar',
      category: 'Statistics',
      section: {
        id: uuid(),
        type: 'statistics',
        variant: 'default',
        settings: { padding: '4rem 0', background: 'solid' },
        rows: [{
          id: uuid(),
          columns: [{
            id: uuid(), width: 100,
            components: [
              { id: uuid(), type: 'stat', props: { stats: [
                { value: '500+', label: 'Happy Clients' },
                { value: '98%', label: 'Satisfaction Rate' },
                { value: '50+', label: 'Team Members' },
                { value: '15+', label: 'Years Experience' },
              ]}},
            ],
          }],
        }],
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-testimonials',
      name: 'Client Testimonials',
      category: 'Testimonials',
      section: {
        id: uuid(),
        type: 'testimonials',
        variant: 'cards',
        settings: { padding: '5rem 0' },
        rows: [{
          id: uuid(),
          columns: [{
            id: uuid(), width: 100,
            components: [
              { id: uuid(), type: 'heading', props: { text: 'What Our Clients Say', level: 2, size: '3xl' } },
              { id: uuid(), type: 'testimonial', props: { testimonials: [
                { name: 'Sarah Johnson', role: 'CEO, TechStart', text: 'Exceptional service that exceeded our expectations in every way.' },
                { name: 'Michael Chen', role: 'Director, GlobalCorp', text: 'Working with this team transformed our business completely.' },
                { name: 'Emily Rodriguez', role: 'VP, InnovateCo', text: 'The quality of work and attention to detail is remarkable.' },
              ]}},
            ],
          }],
        }],
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-cta',
      name: 'Call to Action',
      category: 'CTA',
      section: {
        id: uuid(),
        type: 'cta',
        variant: 'default',
        settings: { background: 'gradient', padding: '5rem 0', textAlign: 'center' },
        rows: [{
          id: uuid(),
          columns: [{
            id: uuid(), width: 100,
            components: [
              { id: uuid(), type: 'heading', props: { text: 'Ready to Get Started?', level: 2, size: '3xl' } },
              { id: uuid(), type: 'paragraph', props: { text: 'Contact us today and discover how we can help you achieve your goals.' } },
              { id: uuid(), type: 'button-group', props: { buttons: [{ label: 'Contact Us', variant: 'primary' }, { label: 'View Services', variant: 'outline' }] } },
            ],
          }],
        }],
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-faq',
      name: 'FAQ Accordion',
      category: 'FAQ',
      section: {
        id: uuid(),
        type: 'faq',
        variant: 'accordion',
        settings: { padding: '5rem 0' },
        rows: [{
          id: uuid(),
          columns: [{
            id: uuid(), width: 100,
            components: [
              { id: uuid(), type: 'heading', props: { text: 'Frequently Asked Questions', level: 2, size: '3xl' } },
              { id: uuid(), type: 'faq-item', props: { items: [
                { question: 'How do I get started?', answer: 'Simply contact us through our form or give us a call. We will schedule a consultation to discuss your needs.' },
                { question: 'What is your typical timeline?', answer: 'Most projects are completed within 4-8 weeks depending on scope and complexity.' },
                { question: 'Do you offer ongoing support?', answer: 'Yes, we provide comprehensive support and maintenance packages.' },
              ]}},
            ],
          }],
        }],
      },
      createdAt: new Date().toISOString(),
    },
  ];
}

// Default page templates
function getDefaultTemplates(): PageTemplate[] {
  return [
    {
      id: 'template-corporate-home',
      name: 'Corporate Home',
      description: 'Professional homepage for corporate businesses',
      industry: 'corporate',
      pageType: 'home',
      sections: getSavedSections().filter(s => ['default-hero-gradient', 'default-services-cards', 'default-stats', 'default-testimonials', 'default-cta'].includes(s.id)).map(s => s.section),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'template-saas-landing',
      name: 'SaaS Landing Page',
      description: 'Conversion-focused landing page for SaaS products',
      industry: 'saas',
      pageType: 'landing',
      sections: getSavedSections().filter(s => ['default-hero-gradient', 'default-services-cards', 'default-stats', 'default-faq', 'default-cta'].includes(s.id)).map(s => s.section),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'template-agency-home',
      name: 'Agency Home',
      description: 'Creative homepage for digital agencies',
      industry: 'digital-agency',
      pageType: 'home',
      sections: getSavedSections().filter(s => ['default-hero-gradient', 'default-services-cards', 'default-testimonials', 'default-cta'].includes(s.id)).map(s => s.section),
      createdAt: new Date().toISOString(),
    },
  ];
}
