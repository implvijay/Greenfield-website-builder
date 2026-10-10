import { IndustryType, Page, PageType, Section, Menu, MenuItem, SEOSettings } from '../types';
import { v4 as uuid } from 'uuid';

export interface IndustryConfig {
  id: IndustryType;
  name: string;
  icon: string;
  description: string;
  pages: { title: string; type: PageType }[];
  menuStructure: { label: string; children?: string[] }[];
  starterContent: Record<string, any>;
}

export const industries: IndustryConfig[] = [
  { id: 'corporate', name: 'Corporate', icon: '🏢', description: 'Large enterprises and corporations', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Services', type: 'services' }, { title: 'Industries', type: 'industries' }, { title: 'Case Studies', type: 'case-studies' }, { title: 'Leadership', type: 'team' }, { title: 'Careers', type: 'careers' }, { title: 'Contact', type: 'contact' }, { title: 'Privacy Policy', type: 'privacy' }, { title: 'Terms of Service', type: 'terms' }], menuStructure: [{ label: 'Home' }, { label: 'About' }, { label: 'Services', children: ['Consulting', 'Strategy', 'Operations'] }, { label: 'Industries' }, { label: 'Insights' }, { label: 'Careers' }, { label: 'Contact' }], starterContent: { companyName: 'Apex Global Corp', tagline: 'Driving Excellence Across Industries', description: 'A Fortune 500 company delivering world-class solutions' } },
  { id: 'technology', name: 'Technology', icon: '💻', description: 'Tech companies and software firms', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Products', type: 'products' }, { title: 'Solutions', type: 'solutions' }, { title: 'Developers', type: 'service-detail' }, { title: 'Pricing', type: 'pricing' }, { title: 'Blog', type: 'blog-listing' }, { title: 'Contact', type: 'contact' }, { title: 'Privacy Policy', type: 'privacy' }, { title: 'Terms', type: 'terms' }], menuStructure: [{ label: 'Home' }, { label: 'Product' }, { label: 'Solutions' }, { label: 'Developers' }, { label: 'Pricing' }, { label: 'Blog' }, { label: 'Contact' }], starterContent: { companyName: 'NovaTech', tagline: 'Building the Future of Technology', description: 'Innovative software solutions for modern businesses' } },
  { id: 'saas', name: 'SaaS', icon: '☁️', description: 'Software as a Service platforms', pages: [{ title: 'Home', type: 'home' }, { title: 'Features', type: 'features' }, { title: 'Solutions', type: 'solutions' }, { title: 'Pricing', type: 'pricing' }, { title: 'Integrations', type: 'service-detail' }, { title: 'Case Studies', type: 'case-studies' }, { title: 'FAQ', type: 'faq' }, { title: 'Contact', type: 'contact' }, { title: 'Privacy', type: 'privacy' }, { title: 'Terms', type: 'terms' }], menuStructure: [{ label: 'Home' }, { label: 'Features' }, { label: 'Solutions' }, { label: 'Pricing' }, { label: 'Resources', children: ['Case Studies', 'Blog', 'FAQ'] }, { label: 'Contact' }], starterContent: { companyName: 'CloudFlow', tagline: 'Streamline Your Workflow', description: 'The all-in-one platform for team collaboration' } },
  { id: 'digital-agency', name: 'Digital Agency', icon: '🎨', description: 'Creative and digital marketing agencies', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Services', type: 'services' }, { title: 'Work', type: 'portfolio' }, { title: 'Process', type: 'process' }, { title: 'Team', type: 'team' }, { title: 'Blog', type: 'blog-listing' }, { title: 'Contact', type: 'contact' }], menuStructure: [{ label: 'Home' }, { label: 'About' }, { label: 'Services', children: ['Web Design', 'Development', 'Marketing', 'Branding'] }, { label: 'Work' }, { label: 'Blog' }, { label: 'Contact' }], starterContent: { companyName: 'Pixel Forge Studio', tagline: 'We Craft Digital Experiences', description: 'Award-winning digital agency creating memorable brands' } },
  { id: 'consulting', name: 'Consulting', icon: '📊', description: 'Management and strategy consulting', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Services', type: 'services' }, { title: 'Industries', type: 'industries' }, { title: 'Insights', type: 'blog-listing' }, { title: 'Team', type: 'team' }, { title: 'Contact', type: 'contact' }], menuStructure: [{ label: 'Home' }, { label: 'About' }, { label: 'Services', children: ['Strategy', 'Operations', 'Technology', 'Finance'] }, { label: 'Industries' }, { label: 'Insights' }, { label: 'Contact' }], starterContent: { companyName: 'Meridian Advisory', tagline: 'Strategic Insight. Measurable Results.', description: 'Trusted advisors to leading organizations worldwide' } },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', description: 'Medical practices and healthcare providers', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Services', type: 'services' }, { title: 'Our Doctors', type: 'team' }, { title: 'Patient Resources', type: 'service-detail' }, { title: 'Locations', type: 'locations' }, { title: 'FAQ', type: 'faq' }, { title: 'Contact', type: 'contact' }], menuStructure: [{ label: 'Home' }, { label: 'About' }, { label: 'Services' }, { label: 'Doctors' }, { label: 'Locations' }, { label: 'Patient Resources' }, { label: 'Contact' }], starterContent: { companyName: 'Wellness Medical Group', tagline: 'Compassionate Care, Exceptional Results', description: 'Comprehensive healthcare services for your whole family' } },
  { id: 'education', name: 'Education', icon: '🎓', description: 'Schools, universities, and training', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Programs', type: 'services' }, { title: 'Admissions', type: 'landing' }, { title: 'Campus Life', type: 'gallery' }, { title: 'Faculty', type: 'team' }, { title: 'News', type: 'blog-listing' }, { title: 'Contact', type: 'contact' }], menuStructure: [{ label: 'Home' }, { label: 'About' }, { label: 'Programs' }, { label: 'Admissions' }, { label: 'Campus Life' }, { label: 'News' }, { label: 'Contact' }], starterContent: { companyName: 'Brighton Academy', tagline: 'Empowering Minds, Shaping Futures', description: 'Excellence in education since 1952' } },
  { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', description: 'Manufacturing and industrial companies', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Products', type: 'products' }, { title: 'Services', type: 'services' }, { title: 'Industries', type: 'industries' }, { title: 'Capabilities', type: 'service-detail' }, { title: 'Quality', type: 'service-detail' }, { title: 'Infrastructure', type: 'service-detail' }, { title: 'Case Studies', type: 'case-studies' }, { title: 'Testimonials', type: 'testimonials' }, { title: 'FAQ', type: 'faq' }, { title: 'Contact', type: 'contact' }, { title: 'Privacy Policy', type: 'privacy' }, { title: 'Terms', type: 'terms' }], menuStructure: [{ label: 'Home' }, { label: 'About' }, { label: 'Products' }, { label: 'Services', children: ['Custom Manufacturing', 'Prototyping', 'Assembly', 'Quality Control'] }, { label: 'Industries' }, { label: 'Capabilities' }, { label: 'Quality' }, { label: 'Case Studies' }, { label: 'Contact' }], starterContent: { companyName: 'Precision Dynamics Manufacturing', tagline: 'Engineering Excellence Since 1987', description: 'Leading manufacturer of precision components and assemblies' } },
  { id: 'real-estate', name: 'Real Estate', icon: '🏠', description: 'Real estate agencies and property', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Properties', type: 'portfolio' }, { title: 'Services', type: 'services' }, { title: 'Neighborhoods', type: 'locations' }, { title: 'Agents', type: 'team' }, { title: 'Testimonials', type: 'testimonials' }, { title: 'Contact', type: 'contact' }], menuStructure: [{ label: 'Home' }, { label: 'Properties' }, { label: 'Services' }, { label: 'Neighborhoods' }, { label: 'About' }, { label: 'Contact' }], starterContent: { companyName: 'Prestige Realty Group', tagline: 'Find Your Dream Home', description: 'Premium real estate services in prime locations' } },
  { id: 'hospitality', name: 'Restaurant/Hospitality', icon: '🍽️', description: 'Restaurants, hotels, and hospitality', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Menu', type: 'services' }, { title: 'Reservations', type: 'contact' }, { title: 'Gallery', type: 'gallery' }, { title: 'Events', type: 'service-detail' }, { title: 'Private Dining', type: 'service-detail' }, { title: 'Contact', type: 'contact' }], menuStructure: [{ label: 'Home' }, { label: 'Menu' }, { label: 'Reservations' }, { label: 'Gallery' }, { label: 'Events' }, { label: 'About' }, { label: 'Contact' }], starterContent: { companyName: 'The Golden Fork', tagline: 'An Unforgettable Dining Experience', description: 'Fine dining crafted with passion and the finest ingredients' } },
  { id: 'professional-services', name: 'Professional Services', icon: '⚖️', description: 'Law firms, accountants, advisors', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Practice Areas', type: 'services' }, { title: 'Attorneys', type: 'team' }, { title: 'Case Results', type: 'case-studies' }, { title: 'Resources', type: 'blog-listing' }, { title: 'Contact', type: 'contact' }], menuStructure: [{ label: 'Home' }, { label: 'About' }, { label: 'Practice Areas', children: ['Corporate Law', 'Litigation', 'Real Estate', 'Tax'] }, { label: 'Team' }, { label: 'Results' }, { label: 'Contact' }], starterContent: { companyName: 'Sterling & Associates', tagline: 'Trusted Legal Counsel', description: 'Experienced attorneys delivering exceptional legal services' } },
  { id: 'local-business', name: 'Local Business', icon: '🏪', description: 'Small and local businesses', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Services', type: 'services' }, { title: 'Gallery', type: 'gallery' }, { title: 'Testimonials', type: 'testimonials' }, { title: 'FAQ', type: 'faq' }, { title: 'Contact', type: 'contact' }], menuStructure: [{ label: 'Home' }, { label: 'About' }, { label: 'Services' }, { label: 'Gallery' }, { label: 'Reviews' }, { label: 'Contact' }], starterContent: { companyName: 'Your Local Business', tagline: 'Quality Service You Can Trust', description: 'Proudly serving our community for over 20 years' } },
  { id: 'creative', name: 'Creative/Portfolio', icon: '✨', description: 'Designers, artists, and creatives', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Work', type: 'portfolio' }, { title: 'Services', type: 'services' }, { title: 'Process', type: 'process' }, { title: 'Testimonials', type: 'testimonials' }, { title: 'Contact', type: 'contact' }], menuStructure: [{ label: 'Home' }, { label: 'Work' }, { label: 'Services' }, { label: 'About' }, { label: 'Contact' }], starterContent: { companyName: 'Studio Creative', tagline: 'Design That Moves People', description: 'Award-winning creative direction and visual design' } },
  { id: 'construction', name: 'Construction', icon: '🏗️', description: 'Construction and building companies', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Services', type: 'services' }, { title: 'Projects', type: 'portfolio' }, { title: 'Capabilities', type: 'service-detail' }, { title: 'Safety', type: 'service-detail' }, { title: 'Contact', type: 'contact' }], menuStructure: [{ label: 'Home' }, { label: 'About' }, { label: 'Services' }, { label: 'Projects' }, { label: 'Capabilities' }, { label: 'Contact' }], starterContent: { companyName: 'Summit Construction Co.', tagline: 'Building Tomorrow, Today', description: 'Full-service construction and project management' } },
  { id: 'finance-legal', name: 'Finance/Legal', icon: '💰', description: 'Financial services and legal firms', pages: [{ title: 'Home', type: 'home' }, { title: 'About', type: 'about' }, { title: 'Services', type: 'services' }, { title: 'Team', type: 'team' }, { title: 'Insights', type: 'blog-listing' }, { title: 'Client Portal', type: 'landing' }, { title: 'Contact', type: 'contact' }], menuStructure: [{ label: 'Home' }, { label: 'About' }, { label: 'Services', children: ['Wealth Management', 'Tax Planning', 'Estate Planning', 'Business Advisory'] }, { label: 'Team' }, { label: 'Insights' }, { label: 'Contact' }], starterContent: { companyName: 'Heritage Financial Advisors', tagline: 'Your Wealth, Our Priority', description: 'Comprehensive financial planning and advisory services' } },
];

export const getIndustryConfig = (id: IndustryType): IndustryConfig => {
  return industries.find(i => i.id === id) || industries[0];
};

// Generate starter sections for pages
export const generateStarterSections = (pageType: PageType, industry: IndustryConfig): Section[] => {
  const sections: Section[] = [];

  switch (pageType) {
    case 'home':
      sections.push(createHeroSection(industry));
      sections.push(createServicesSection(industry));
      sections.push(createStatsSection(industry));
      sections.push(createTestimonialsSection(industry));
      sections.push(createCTASection(industry));
      break;
    case 'about':
      sections.push(createPageHeroSection('About Us', industry));
      sections.push(createTextImageSection(industry));
      sections.push(createTeamSection(industry));
      sections.push(createTimelineSection(industry));
      break;
    case 'services':
      sections.push(createPageHeroSection('Our Services', industry));
      sections.push(createServicesSection(industry));
      sections.push(createProcessSection(industry));
      sections.push(createCTASection(industry));
      break;
    case 'contact':
      sections.push(createPageHeroSection('Contact Us', industry));
      sections.push(createContactSection(industry));
      break;
    case 'pricing':
      sections.push(createPageHeroSection('Pricing Plans', industry));
      sections.push(createPricingSection(industry));
      sections.push(createFAQSection(industry));
      break;
    case 'faq':
      sections.push(createPageHeroSection('Frequently Asked Questions', industry));
      sections.push(createFAQSection(industry));
      break;
    case 'portfolio':
    case 'case-studies':
      sections.push(createPageHeroSection(pageType === 'portfolio' ? 'Our Work' : 'Case Studies', industry));
      sections.push(createPortfolioSection(industry));
      sections.push(createTestimonialsSection(industry));
      break;
    case 'team':
      sections.push(createPageHeroSection('Our Team', industry));
      sections.push(createTeamSection(industry));
      break;
    case 'testimonials':
      sections.push(createPageHeroSection('What Our Clients Say', industry));
      sections.push(createTestimonialsSection(industry));
      break;
    case 'gallery':
      sections.push(createPageHeroSection('Gallery', industry));
      sections.push(createGallerySection(industry));
      break;
    case 'products':
      sections.push(createPageHeroSection('Our Products', industry));
      sections.push(createCardsSection(industry));
      sections.push(createCTASection(industry));
      break;
    default:
      sections.push(createPageHeroSection('Page Title', industry));
      sections.push(createTextSection(industry));
      break;
  }

  return sections;
};

const createHeroSection = (industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'hero',
  variant: 'default',
  settings: { background: 'gradient', overlay: true, overlayOpacity: 0.7, padding: '8rem 0', textAlign: 'center', fullWidth: true },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'heading', props: { text: industry.starterContent.tagline || 'Welcome', level: 1, size: '5xl' } },
        { id: uuid(), type: 'paragraph', props: { text: industry.starterContent.description || 'We deliver exceptional results for our clients.' } },
        { id: uuid(), type: 'button-group', props: { buttons: [{ label: 'Get Started', variant: 'primary' }, { label: 'Learn More', variant: 'outline' }] } },
      ],
    }],
  }],
  animation: { type: 'fade', duration: 800, delay: 0 },
});

const createPageHeroSection = (title: string, industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'hero',
  variant: 'minimal',
  settings: { background: 'solid', padding: '5rem 0', textAlign: 'center' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'heading', props: { text: title, level: 1, size: '4xl' } },
        { id: uuid(), type: 'paragraph', props: { text: `Discover how ${industry.starterContent.companyName} can help you achieve your goals.` } },
      ],
    }],
  }],
});

const createServicesSection = (industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'services',
  variant: 'cards',
  settings: { padding: '5rem 0', textAlign: 'center' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'heading', props: { text: 'Our Services', level: 2, size: '3xl' } },
        { id: uuid(), type: 'paragraph', props: { text: 'Comprehensive solutions tailored to your needs.' } },
        { id: uuid(), type: 'card', props: { cards: generateServiceCards(industry) } },
      ],
    }],
  }],
});

const createStatsSection = (_industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'statistics',
  variant: 'default',
  settings: { padding: '4rem 0', background: 'solid' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'stat', props: { stats: [{ value: '500+', label: 'Projects Completed' }, { value: '98%', label: 'Client Satisfaction' }, { value: '50+', label: 'Team Members' }, { value: '15+', label: 'Years Experience' }] } },
      ],
    }],
  }],
});

const createTestimonialsSection = (_industry: IndustryConfig): Section => ({
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
        { id: uuid(), type: 'testimonial', props: { testimonials: [{ name: 'Sarah Johnson', role: 'CEO, TechStart', text: 'Exceptional service that exceeded our expectations. The team delivered outstanding results on time and within budget.' }, { name: 'Michael Chen', role: 'Director, GlobalCorp', text: 'Working with this team transformed our business. Their expertise and dedication are unmatched in the industry.' }, { name: 'Emily Rodriguez', role: 'VP, InnovateCo', text: 'The quality of work and attention to detail is remarkable. Highly recommend for any organization seeking top-tier solutions.' }] } },
      ],
    }],
  }],
});

const createCTASection = (industry: IndustryConfig): Section => ({
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
        { id: uuid(), type: 'paragraph', props: { text: `Contact ${industry.starterContent.companyName} today and discover how we can help you succeed.` } },
        { id: uuid(), type: 'button-group', props: { buttons: [{ label: 'Contact Us', variant: 'primary' }, { label: 'View Services', variant: 'outline' }] } },
      ],
    }],
  }],
});

const createTextImageSection = (industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'image-text',
  variant: 'default',
  settings: { padding: '5rem 0' },
  rows: [{
    id: uuid(),
    columns: [
      { id: uuid(), width: 50, components: [{ id: uuid(), type: 'image', props: { src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600', alt: 'Our office' } }] },
      { id: uuid(), width: 50, components: [{ id: uuid(), type: 'heading', props: { text: 'About Our Company', level: 2, size: '2xl' } }, { id: uuid(), type: 'paragraph', props: { text: `${industry.starterContent.companyName} has been at the forefront of innovation, delivering exceptional value to our clients for over a decade. Our team of experienced professionals is dedicated to excellence.` } }] },
    ],
  }],
});

const createTeamSection = (_industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'team',
  variant: 'grid',
  settings: { padding: '5rem 0', textAlign: 'center' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'heading', props: { text: 'Meet Our Team', level: 2, size: '3xl' } },
        { id: uuid(), type: 'team-member', props: { members: [{ name: 'Alexandra Wright', role: 'Chief Executive Officer', image: '' }, { name: 'David Kim', role: 'Chief Technology Officer', image: '' }, { name: 'Maria Santos', role: 'Head of Design', image: '' }, { name: 'James Mitchell', role: 'Director of Operations', image: '' }] } },
      ],
    }],
  }],
});

const createTimelineSection = (_industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'timeline',
  variant: 'default',
  settings: { padding: '5rem 0' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'heading', props: { text: 'Our Journey', level: 2, size: '3xl' } },
        { id: uuid(), type: 'text', props: { text: '2010 - Founded with a vision to transform the industry\n2015 - Expanded to international markets\n2020 - Launched innovative product line\n2024 - Serving 500+ clients worldwide' } },
      ],
    }],
  }],
});

const createContactSection = (industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'contact',
  variant: 'default',
  settings: { padding: '5rem 0' },
  rows: [{
    id: uuid(),
    columns: [
      { id: uuid(), width: 50, components: [{ id: uuid(), type: 'heading', props: { text: 'Get in Touch', level: 2, size: '2xl' } }, { id: uuid(), type: 'paragraph', props: { text: `Have questions? We'd love to hear from you. Reach out to ${industry.starterContent.companyName} and we'll respond within 24 hours.` } }] },
      { id: uuid(), width: 50, components: [{ id: uuid(), type: 'form-field', props: { formId: 'contact' } }] },
    ],
  }],
});

const createPricingSection = (_industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'pricing',
  variant: 'cards',
  settings: { padding: '5rem 0', textAlign: 'center' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'pricing-card', props: { plans: [{ name: 'Starter', price: '$29', period: '/month', features: ['5 Projects', '10GB Storage', 'Email Support', 'Basic Analytics'] }, { name: 'Professional', price: '$79', period: '/month', features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Advanced Analytics', 'API Access'], popular: true }, { name: 'Enterprise', price: '$199', period: '/month', features: ['Everything in Pro', 'Unlimited Storage', '24/7 Support', 'Custom Integrations', 'Dedicated Manager'] }] } },
      ],
    }],
  }],
});

const createFAQSection = (_industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'faq',
  variant: 'accordion',
  settings: { padding: '5rem 0' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'heading', props: { text: 'Frequently Asked Questions', level: 2, size: '3xl' } },
        { id: uuid(), type: 'faq-item', props: { items: [{ question: 'How do I get started?', answer: 'Simply contact us through our form or give us a call. We will schedule a consultation to discuss your needs.' }, { question: 'What is your typical timeline?', answer: 'Most projects are completed within 4-8 weeks depending on scope and complexity.' }, { question: 'Do you offer ongoing support?', answer: 'Yes, we provide comprehensive support and maintenance packages to ensure your continued success.' }, { question: 'What industries do you serve?', answer: 'We work with clients across multiple industries including technology, healthcare, finance, and manufacturing.' }] } },
      ],
    }],
  }],
});

const createPortfolioSection = (_industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'portfolio',
  variant: 'grid',
  settings: { padding: '5rem 0' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'heading', props: { text: 'Featured Work', level: 2, size: '3xl' } },
        { id: uuid(), type: 'card', props: { cards: [{ title: 'Project Alpha', description: 'A comprehensive digital transformation project', image: '' }, { title: 'Project Beta', description: 'Enterprise platform development', image: '' }, { title: 'Project Gamma', description: 'Brand identity and marketing campaign', image: '' }] } },
      ],
    }],
  }],
});

const createProcessSection = (_industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'process',
  variant: 'steps',
  settings: { padding: '5rem 0', textAlign: 'center' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'heading', props: { text: 'Our Process', level: 2, size: '3xl' } },
        { id: uuid(), type: 'text', props: { text: '1. Discovery - We learn about your goals and challenges\n2. Strategy - We develop a tailored approach\n3. Design - We create compelling solutions\n4. Development - We build with precision\n5. Launch - We deploy and optimize\n6. Support - We ensure ongoing success' } },
      ],
    }],
  }],
});

const createTextSection = (_industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'text',
  variant: 'default',
  settings: { padding: '5rem 0' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'paragraph', props: { text: 'This is a content section. Edit this text to add your own content here.' } },
      ],
    }],
  }],
});

const createCardsSection = (industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'cards',
  variant: 'grid',
  settings: { padding: '5rem 0' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'heading', props: { text: 'Featured Items', level: 2, size: '3xl' } },
        { id: uuid(), type: 'card', props: { cards: [{ title: 'Item One', description: 'Description of the first item', image: '' }, { title: 'Item Two', description: 'Description of the second item', image: '' }, { title: 'Item Three', description: 'Description of the third item', image: '' }] } },
      ],
    }],
  }],
});

const createGallerySection = (_industry: IndustryConfig): Section => ({
  id: uuid(),
  type: 'gallery',
  variant: 'grid',
  settings: { padding: '5rem 0' },
  rows: [{
    id: uuid(),
    columns: [{
      id: uuid(),
      width: 100,
      components: [
        { id: uuid(), type: 'heading', props: { text: 'Gallery', level: 2, size: '3xl' } },
        { id: uuid(), type: 'image', props: { src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', alt: 'Gallery image 1' } },
      ],
    }],
  }],
});

const generateServiceCards = (industry: IndustryConfig) => {
  const serviceMap: Record<string, { title: string; description: string; icon: string }[]> = {
    'corporate': [{ title: 'Strategic Consulting', description: 'Data-driven strategies for sustainable growth', icon: '📊' }, { title: 'Digital Transformation', description: 'Modernize operations with cutting-edge technology', icon: '🔄' }, { title: 'Risk Management', description: 'Comprehensive risk assessment and mitigation', icon: '🛡️' }],
    'technology': [{ title: 'Software Development', description: 'Custom solutions built with modern technologies', icon: '💻' }, { title: 'Cloud Infrastructure', description: 'Scalable and secure cloud architecture', icon: '☁️' }, { title: 'AI & Machine Learning', description: 'Intelligent automation and predictive analytics', icon: '🤖' }],
    'manufacturing': [{ title: 'Precision Manufacturing', description: 'High-tolerance components with ISO certification', icon: '⚙️' }, { title: 'Prototyping', description: 'Rapid prototyping from concept to production', icon: '🔧' }, { title: 'Quality Assurance', description: 'Rigorous testing and quality control processes', icon: '✅' }],
  };
  return serviceMap[industry.id] || [{ title: 'Service One', description: 'Professional service tailored to your needs', icon: '⭐' }, { title: 'Service Two', description: 'Expert solutions with proven results', icon: '🎯' }, { title: 'Service Three', description: 'Comprehensive support from start to finish', icon: '🚀' }];
};

export const generateStarterPages = (industry: IndustryConfig): Page[] => {
  return industry.pages.map((p, index) => ({
    id: uuid(),
    title: p.title,
    slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    type: p.type,
    status: 'published' as const,
    sections: generateStarterSections(p.type, industry),
    seo: {
      title: `${p.title} | ${industry.starterContent.companyName}`,
      description: `${p.title} page for ${industry.starterContent.companyName}. ${industry.starterContent.description}`,
    },
    order: index,
  }));
};

export const generateStarterMenus = (industry: IndustryConfig, pages: Page[]): Menu[] => {
  const primaryItems: MenuItem[] = industry.menuStructure.map((item, index) => {
    const page = pages.find(p => p.title.toLowerCase() === item.label.toLowerCase());
    const menuItem: MenuItem = {
      id: uuid(),
      label: item.label,
      type: 'page',
      pageId: page?.id,
      children: [],
      enabled: true,
      order: index,
    };
    if (item.children) {
      menuItem.children = item.children.map((child, ci) => ({
        id: uuid(),
        label: child,
        type: 'page' as const,
        pageId: pages.find(p => p.title.toLowerCase() === child.toLowerCase())?.id,
        children: [],
        enabled: true,
        order: ci,
      }));
    }
    return menuItem;
  });

  const footerItems: MenuItem[] = [
    { id: uuid(), label: 'About', type: 'page', pageId: pages.find(p => p.type === 'about')?.id, children: [], enabled: true, order: 0 },
    { id: uuid(), label: 'Services', type: 'page', pageId: pages.find(p => p.type === 'services')?.id, children: [], enabled: true, order: 1 },
    { id: uuid(), label: 'Contact', type: 'page', pageId: pages.find(p => p.type === 'contact')?.id, children: [], enabled: true, order: 2 },
    { id: uuid(), label: 'Privacy Policy', type: 'page', pageId: pages.find(p => p.type === 'privacy')?.id, children: [], enabled: true, order: 3 },
  ];

  return [
    { id: uuid(), name: 'Primary Navigation', location: 'primary', items: primaryItems },
    { id: uuid(), name: 'Footer Navigation', location: 'footer', items: footerItems },
    { id: uuid(), name: 'Mobile Navigation', location: 'mobile', items: primaryItems },
  ];
};

export const generateStarterSEO = (industry: IndustryConfig): SEOSettings => ({
  siteTitle: industry.starterContent.companyName,
  description: industry.starterContent.description,
  business: industry.starterContent.companyName,
  industry: industry.name,
  location: '',
  phone: '',
  email: '',
  social: {},
});
