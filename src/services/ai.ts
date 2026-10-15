import { IndustryType, Page, Section, PageSEO } from '../types';
import { getIndustryConfig } from '../data/industries';
import { v4 as uuid } from 'uuid';

// AI Content Provider Interface
export interface AIContentProvider {
  name: string;
  generateProjectContent(industry: IndustryType, companyName: string): Promise<ProjectContent>;
  generatePageContent(industry: IndustryType, pageType: string, companyName: string): Promise<PageContent>;
  generateSectionContent(sectionType: string, context: string): Promise<SectionContent>;
  rewriteContent(content: string, tone: string): Promise<string>;
  generateSEO(pageTitle: string, industry: string): Promise<PageSEO>;
}

export interface ProjectContent {
  tagline: string;
  description: string;
  valuePropositions: string[];
  services: { title: string; description: string; icon: string }[];
  testimonials: { name: string; role: string; text: string }[];
  stats: { value: string; label: string }[];
  faq: { question: string; answer: string }[];
  cta: { heading: string; subtext: string; buttonText: string };
}

export interface PageContent {
  heroTitle: string;
  heroSubtitle: string;
  sections: SectionContent[];
}

export interface SectionContent {
  type: string;
  heading?: string;
  subheading?: string;
  items?: { title: string; description: string; icon?: string }[];
  content?: string;
}

// Industry-specific content templates
const industryContent: Record<IndustryType, Partial<ProjectContent>> = {
  'corporate': {
    tagline: 'Driving Excellence Across Global Markets',
    description: 'A trusted partner for Fortune 500 companies seeking transformative business solutions.',
    valuePropositions: ['Strategic Advisory', 'Global Reach', 'Proven Results', 'Industry Expertise'],
    services: [
      { title: 'Strategic Consulting', description: 'Data-driven strategies that deliver measurable business outcomes and sustainable growth.', icon: '📊' },
      { title: 'Digital Transformation', description: 'End-to-end digital solutions that modernize operations and create competitive advantage.', icon: '🔄' },
      { title: 'Risk & Compliance', description: 'Comprehensive risk management frameworks that protect and grow your enterprise value.', icon: '🛡️' },
    ],
    testimonials: [
      { name: 'Robert Chen', role: 'CEO, Global Industries Inc.', text: 'Their strategic insight transformed our approach to market expansion. Revenue grew 40% in the first year.' },
      { name: 'Sarah Mitchell', role: 'COO, Meridian Corp', text: 'Exceptional professionalism and deep industry knowledge. They delivered beyond our expectations.' },
    ],
    stats: [
      { value: '500+', label: 'Enterprise Clients' },
      { value: '$2.5B', label: 'Value Created' },
      { value: '35+', label: 'Countries Served' },
      { value: '98%', label: 'Client Retention' },
    ],
  },
  'technology': {
    tagline: 'Building the Future of Technology',
    description: 'Innovative software solutions that empower businesses to thrive in the digital age.',
    valuePropositions: ['Cutting-Edge Innovation', 'Scalable Architecture', 'Rapid Deployment', '24/7 Support'],
    services: [
      { title: 'Custom Software Development', description: 'Tailored solutions built with modern technologies to solve your unique business challenges.', icon: '💻' },
      { title: 'Cloud Infrastructure', description: 'Scalable, secure cloud architecture that grows with your business and reduces costs.', icon: '☁️' },
      { title: 'AI & Machine Learning', description: 'Intelligent automation and predictive analytics that drive smarter decision-making.', icon: '🤖' },
    ],
    testimonials: [
      { name: 'David Park', role: 'CTO, InnovateTech', text: 'Their engineering team delivered a platform that handles 10x our expected load with zero downtime.' },
      { name: 'Lisa Wong', role: 'VP Engineering, DataFlow', text: 'Exceptional code quality and architecture. They think about scale from day one.' },
    ],
    stats: [
      { value: '200+', label: 'Projects Delivered' },
      { value: '99.9%', label: 'Uptime SLA' },
      { value: '50M+', label: 'Users Served' },
      { value: '3x', label: 'Faster Time-to-Market' },
    ],
  },
  'manufacturing': {
    tagline: 'Engineering Excellence Since 1987',
    description: 'Precision manufacturing solutions for industries that demand the highest quality standards.',
    valuePropositions: ['ISO 9001 Certified', 'Precision Engineering', 'On-Time Delivery', 'Quality Guaranteed'],
    services: [
      { title: 'CNC Machining', description: 'High-precision CNC milling and turning with tolerances down to ±0.001mm for critical components.', icon: '⚙️' },
      { title: 'Custom Fabrication', description: 'From prototype to production run, we fabricate complex assemblies to your exact specifications.', icon: '🔧' },
      { title: 'Quality Assurance', description: 'Comprehensive inspection using CMM, optical comparators, and advanced metrology equipment.', icon: '✅' },
    ],
    testimonials: [
      { name: 'Mark Thompson', role: 'Procurement Director, AeroSystems', text: 'Consistently delivers parts within tight tolerances. Their quality system is best-in-class.' },
      { name: 'Jennifer Adams', role: 'Engineering Manager, AutoTech', text: 'Reduced our defect rate by 60% after switching to their manufacturing process.' },
    ],
    stats: [
      { value: '35+', label: 'Years Experience' },
      { value: '10,000+', label: 'Parts Monthly' },
      { value: '±0.001mm', label: 'Tolerance Capability' },
      { value: '99.7%', label: 'Quality Rate' },
    ],
  },
  'saas': {
    tagline: 'Streamline Your Workflow, Amplify Your Results',
    description: 'The all-in-one platform that helps teams collaborate, automate, and scale effortlessly.',
    valuePropositions: ['No Credit Card Required', '14-Day Free Trial', 'Cancel Anytime', 'Enterprise Ready'],
    services: [
      { title: 'Project Management', description: 'Organize tasks, track progress, and hit deadlines with intuitive project boards and timelines.', icon: '📋' },
      { title: 'Team Collaboration', description: 'Real-time messaging, file sharing, and video calls keep your team connected anywhere.', icon: '👥' },
      { title: 'Automation Engine', description: 'Build custom workflows that eliminate repetitive tasks and reduce human error.', icon: '⚡' },
    ],
    testimonials: [
      { name: 'Alex Rivera', role: 'Product Lead, StartupXYZ', text: 'We replaced 5 different tools with this platform. Our team productivity increased by 35%.' },
      { name: 'Maria Santos', role: 'Operations Director, ScaleUp Co', text: 'The automation features alone saved us 20 hours per week. Game changer.' },
    ],
    stats: [
      { value: '10,000+', label: 'Teams Worldwide' },
      { value: '4.9/5', label: 'User Rating' },
      { value: '99.99%', label: 'Uptime' },
      { value: '50M+', label: 'Tasks Completed' },
    ],
  },
  'healthcare': {
    tagline: 'Compassionate Care, Exceptional Results',
    description: 'Comprehensive healthcare services delivered by board-certified physicians and caring staff.',
    valuePropositions: ['Board-Certified Doctors', 'Same-Day Appointments', 'Telehealth Available', 'Insurance Accepted'],
    services: [
      { title: 'Primary Care', description: 'Comprehensive health services for patients of all ages, from routine checkups to chronic disease management.', icon: '🏥' },
      { title: 'Specialist Referrals', description: 'Access to a network of specialists for advanced diagnostics and treatment plans.', icon: '👨‍⚕️' },
      { title: 'Preventive Wellness', description: 'Proactive health screenings, vaccinations, and lifestyle counseling to keep you healthy.', icon: '💚' },
    ],
    testimonials: [
      { name: 'Patricia Williams', role: 'Patient', text: 'The doctors truly listen and take time to explain everything. Best healthcare experience I have had.' },
      { name: 'James Rodriguez', role: 'Patient', text: 'Got a same-day appointment when I needed it most. The staff is incredibly caring.' },
    ],
    stats: [
      { value: '25+', label: 'Years Serving Community' },
      { value: '50,000+', label: 'Patients Treated' },
      { value: '30+', label: 'Specialists' },
      { value: '4.8★', label: 'Patient Rating' },
    ],
  },
  'digital-agency': {
    tagline: 'We Craft Digital Experiences That Move People',
    description: 'Award-winning creative agency specializing in brand strategy, design, and digital marketing.',
    valuePropositions: ['Award-Winning Work', 'Full-Service Agency', 'Data-Driven Creative', 'Transparent Pricing'],
    services: [
      { title: 'Brand Strategy & Identity', description: 'Compelling brand narratives and visual identities that resonate with your target audience.', icon: '🎨' },
      { title: 'Web Design & Development', description: 'Beautiful, high-performance websites that convert visitors into customers.', icon: '💻' },
      { title: 'Digital Marketing', description: 'SEO, paid media, and content marketing strategies that drive measurable growth.', icon: '📈' },
    ],
    testimonials: [
      { name: 'Tom Bradley', role: 'Founder, TechVenture', text: 'They completely transformed our brand. Website traffic increased 300% in 6 months.' },
      { name: 'Rachel Kim', role: 'CMO, Lifestyle Brand', text: 'Creative excellence meets strategic thinking. Exactly what we needed.' },
    ],
    stats: [
      { value: '150+', label: 'Brands Launched' },
      { value: '25+', label: 'Industry Awards' },
      { value: '300%', label: 'Avg Traffic Increase' },
      { value: '12', label: 'Years of Excellence' },
    ],
  },
  'consulting': {
    tagline: 'Strategic Insight. Measurable Results.',
    description: 'Trusted advisors to leading organizations, delivering transformative business outcomes.',
    valuePropositions: ['Fortune 500 Experience', 'Industry Specialists', 'Data-Driven Approach', 'Measurable ROI'],
    services: [
      { title: 'Management Consulting', description: 'Strategic planning and organizational transformation that drives sustainable competitive advantage.', icon: '📊' },
      { title: 'Technology Advisory', description: 'IT strategy, digital roadmaps, and technology implementation that align with business goals.', icon: '💡' },
      { title: 'Financial Advisory', description: 'M&A support, valuation, and financial restructuring for informed decision-making.', icon: '💰' },
    ],
    testimonials: [
      { name: 'Catherine Moore', role: 'CFO, Industrial Corp', text: 'Their financial advisory helped us navigate a complex acquisition seamlessly.' },
      { name: 'William Chang', role: 'CEO, Growth Partners', text: 'Deep expertise and pragmatic recommendations. True partners in our success.' },
    ],
    stats: [
      { value: '200+', label: 'Clients Served' },
      { value: '$5B+', label: 'Value Delivered' },
      { value: '40+', label: 'Industries' },
      { value: '95%', label: 'Repeat Clients' },
    ],
  },
  'education': {
    tagline: 'Empowering Minds, Shaping Futures',
    description: 'Excellence in education with innovative programs designed for the leaders of tomorrow.',
    valuePropositions: ['Accredited Programs', 'Expert Faculty', 'Flexible Learning', 'Career Support'],
    services: [
      { title: 'Undergraduate Programs', description: 'Rigorous academic programs across arts, sciences, business, and technology.', icon: '🎓' },
      { title: 'Graduate Studies', description: 'Advanced degrees and professional certifications to accelerate your career.', icon: '📚' },
      { title: 'Online Learning', description: 'Flexible online courses and degrees from world-class instructors.', icon: '💻' },
    ],
    testimonials: [
      { name: 'Emily Foster', role: 'Alumni, Class of 2022', text: 'The education I received opened doors I never thought possible. Forever grateful.' },
      { name: 'Dr. Michael Lee', role: 'Department Chair', text: 'Our faculty are dedicated to student success and cutting-edge research.' },
    ],
    stats: [
      { value: '15,000+', label: 'Students Enrolled' },
      { value: '95%', label: 'Graduation Rate' },
      { value: '200+', label: 'Programs Offered' },
      { value: '92%', label: 'Employment Rate' },
    ],
  },
  'real-estate': {
    tagline: 'Find Your Dream Home, Build Your Future',
    description: 'Premium real estate services with deep local expertise and personalized attention.',
    valuePropositions: ['Local Market Experts', 'Luxury Properties', 'Investment Advisory', 'Full-Service Support'],
    services: [
      { title: 'Residential Sales', description: 'Expert guidance through buying or selling your home, from listing to closing.', icon: '🏠' },
      { title: 'Commercial Real Estate', description: 'Strategic solutions for office, retail, and industrial property transactions.', icon: '🏢' },
      { title: 'Property Management', description: 'Comprehensive management services that maximize your investment returns.', icon: '🔑' },
    ],
    testimonials: [
      { name: 'John & Mary Smith', role: 'Home Buyers', text: 'Found our dream home in just two weeks. Their market knowledge is unmatched.' },
      { name: 'David Chen', role: 'Property Investor', text: 'They helped me build a portfolio that generates consistent returns.' },
    ],
    stats: [
      { value: '1,500+', label: 'Properties Sold' },
      { value: '$2B+', label: 'Transaction Volume' },
      { value: '20+', label: 'Years Experience' },
      { value: '98%', label: 'Client Satisfaction' },
    ],
  },
  'hospitality': {
    tagline: 'An Unforgettable Dining Experience',
    description: 'Where culinary artistry meets warm hospitality in an elegant atmosphere.',
    valuePropositions: ['Award-Winning Cuisine', 'Seasonal Ingredients', 'Private Events', 'Wine Collection'],
    services: [
      { title: 'Fine Dining', description: 'Exquisite multi-course menus crafted by our award-winning chef using the finest seasonal ingredients.', icon: '🍽️' },
      { title: 'Private Events', description: 'Elegant spaces for celebrations, corporate events, and intimate gatherings.', icon: '🥂' },
      { title: 'Wine & Spirits', description: 'Curated wine list featuring rare vintages and expert sommelier recommendations.', icon: '🍷' },
    ],
    testimonials: [
      { name: 'Amanda & Chris', role: 'Anniversary Dinner', text: 'The most memorable dining experience. Every dish was a work of art.' },
      { name: 'Corporate Client', role: 'Annual Gala', text: 'Flawless execution for our 200-guest event. Exceeded all expectations.' },
    ],
    stats: [
      { value: '15+', label: 'Years of Excellence' },
      { value: '4.9★', label: 'Guest Rating' },
      { value: '500+', label: 'Events Hosted' },
      { value: '2', label: 'Michelin Stars' },
    ],
  },
  'professional-services': {
    tagline: 'Trusted Counsel. Proven Results.',
    description: 'Experienced attorneys delivering exceptional legal services with integrity and dedication.',
    valuePropositions: ['Top-Rated Attorneys', 'Personalized Attention', 'Proven Track Record', 'Transparent Fees'],
    services: [
      { title: 'Corporate Law', description: 'Business formation, contracts, mergers & acquisitions, and corporate governance.', icon: '⚖️' },
      { title: 'Litigation', description: 'Aggressive representation in complex commercial disputes and trials.', icon: '🏛️' },
      { title: 'Real Estate Law', description: 'Commercial and residential transactions, development, and land use matters.', icon: '🏢' },
    ],
    testimonials: [
      { name: 'Michael Brown', role: 'Business Owner', text: 'They guided us through a complex acquisition with skill and professionalism.' },
      { name: 'Sandra Davis', role: 'CEO, Tech Startup', text: 'Our go-to legal team for everything from IP to employment law.' },
    ],
    stats: [
      { value: '30+', label: 'Years of Practice' },
      { value: '5,000+', label: 'Cases Won' },
      { value: '25+', label: 'Attorneys' },
      { value: 'AV Rated', label: 'By Peers' },
    ],
  },
  'local-business': {
    tagline: 'Quality Service You Can Trust',
    description: 'Proudly serving our community with dedication, expertise, and a personal touch.',
    valuePropositions: ['Locally Owned', 'Community Focused', 'Fair Pricing', 'Quality Guaranteed'],
    services: [
      { title: 'Our Services', description: 'Comprehensive solutions tailored to meet your specific needs with attention to detail.', icon: '⭐' },
      { title: 'Expert Team', description: 'Experienced professionals dedicated to delivering exceptional results every time.', icon: '👥' },
      { title: 'Customer Care', description: 'Personalized service that goes above and beyond to ensure your complete satisfaction.', icon: '💯' },
    ],
    testimonials: [
      { name: 'Local Customer', role: 'Long-time Client', text: 'Always reliable, always friendly. They treat you like family.' },
      { name: 'Happy Customer', role: 'New Client', text: 'Found them through a recommendation and now I recommend them to everyone.' },
    ],
    stats: [
      { value: '20+', label: 'Years in Business' },
      { value: '5,000+', label: 'Happy Customers' },
      { value: '4.9★', label: 'Google Rating' },
      { value: '100%', label: 'Locally Owned' },
    ],
  },
  'creative': {
    tagline: 'Design That Moves People',
    description: 'Award-winning creative direction and visual design for brands that dare to be different.',
    valuePropositions: ['Award-Winning Design', 'Bold Creativity', 'Strategic Thinking', 'End-to-End Service'],
    services: [
      { title: 'Brand Identity', description: 'Distinctive visual identities that capture the essence of your brand and resonate with audiences.', icon: '✨' },
      { title: 'Digital Design', description: 'Websites, apps, and digital experiences that combine beauty with functionality.', icon: '🎨' },
      { title: 'Creative Direction', description: 'Strategic creative leadership for campaigns, launches, and brand evolution.', icon: '🎯' },
    ],
    testimonials: [
      { name: 'Startup Founder', role: 'Tech Company', text: 'They captured our brand personality perfectly. The design speaks for itself.' },
      { name: 'Marketing Director', role: 'Lifestyle Brand', text: 'Creative brilliance with strategic depth. Exactly what we needed.' },
    ],
    stats: [
      { value: '100+', label: 'Brands Created' },
      { value: '15+', label: 'Design Awards' },
      { value: '8', label: 'Years of Craft' },
      { value: '50+', label: 'Happy Clients' },
    ],
  },
  'construction': {
    tagline: 'Building Tomorrow, Today',
    description: 'Full-service construction and project management delivering quality on time and on budget.',
    valuePropositions: ['Licensed & Insured', 'On-Time Delivery', 'Quality Craftsmanship', 'Safety First'],
    services: [
      { title: 'Commercial Construction', description: 'Ground-up construction and tenant improvements for offices, retail, and industrial facilities.', icon: '🏗️' },
      { title: 'Renovation & Remodeling', description: 'Transform existing spaces with expert craftsmanship and modern design.', icon: '🔨' },
      { title: 'Project Management', description: 'End-to-end project oversight ensuring quality, schedule, and budget compliance.', icon: '📋' },
    ],
    testimonials: [
      { name: 'Property Developer', role: 'Commercial Project', text: 'Delivered our 50,000 sq ft office building on time and under budget.' },
      { name: 'Business Owner', role: 'Retail Renovation', text: 'Minimal disruption to our operations. Professional from start to finish.' },
    ],
    stats: [
      { value: '25+', label: 'Years Building' },
      { value: '500+', label: 'Projects Completed' },
      { value: '$500M+', label: 'Construction Value' },
      { value: 'Zero', label: 'Safety Incidents (3yr)' },
    ],
  },
  'finance-legal': {
    tagline: 'Your Wealth, Our Priority',
    description: 'Comprehensive financial planning and advisory services for individuals and businesses.',
    valuePropositions: ['Fiduciary Standard', 'Independent Advice', 'Holistic Planning', 'Transparent Fees'],
    services: [
      { title: 'Wealth Management', description: 'Personalized investment strategies aligned with your goals, risk tolerance, and time horizon.', icon: '💰' },
      { title: 'Retirement Planning', description: 'Comprehensive retirement strategies that ensure financial security for your future.', icon: '🏖️' },
      { title: 'Estate Planning', description: 'Protect your legacy with trusts, wills, and tax-efficient wealth transfer strategies.', icon: '📜' },
    ],
    testimonials: [
      { name: 'Retired Executive', role: 'Client since 2015', text: 'Their guidance gave us confidence to retire early and enjoy life.' },
      { name: 'Business Owner', role: 'Succession Planning', text: 'Helped us navigate a complex business transition seamlessly.' },
    ],
    stats: [
      { value: '$2B+', label: 'Assets Managed' },
      { value: '30+', label: 'Years Experience' },
      { value: '1,000+', label: 'Families Served' },
      { value: 'CFP®', label: 'Certified Planners' },
    ],
  },
};

// Default content for industries not specifically defined
const defaultContent: ProjectContent = {
  tagline: 'Excellence in Every Detail',
  description: 'Professional services delivering exceptional results for discerning clients.',
  valuePropositions: ['Quality Assured', 'Expert Team', 'Proven Results', 'Client Focused'],
  services: [
    { title: 'Our Services', description: 'Comprehensive solutions tailored to your unique needs and goals.', icon: '⭐' },
    { title: 'Expert Team', description: 'Experienced professionals dedicated to delivering outstanding results.', icon: '👥' },
    { title: 'Client Success', description: 'Your success is our priority. We go above and beyond every time.', icon: '🎯' },
  ],
  testimonials: [
    { name: 'Satisfied Client', role: 'Long-term Partner', text: 'Exceptional service that consistently exceeds expectations. Highly recommended.' },
    { name: 'Happy Customer', role: 'New Client', text: 'From start to finish, the experience was professional and seamless.' },
  ],
  stats: [
    { value: '100+', label: 'Clients Served' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '10+', label: 'Years Experience' },
    { value: '5★', label: 'Client Rating' },
  ],
  faq: [
    { question: 'How do I get started?', answer: 'Simply contact us through our form or give us a call. We will schedule a consultation to discuss your needs and develop a tailored plan.' },
    { question: 'What is your typical timeline?', answer: 'Most projects are completed within 4-8 weeks depending on scope and complexity. We will provide a detailed timeline during our initial consultation.' },
    { question: 'Do you offer ongoing support?', answer: 'Yes, we provide comprehensive support and maintenance packages to ensure your continued success long after project completion.' },
    { question: 'What industries do you serve?', answer: 'We work with clients across multiple industries, bringing cross-sector insights and best practices to every engagement.' },
  ],
  cta: {
    heading: 'Ready to Get Started?',
    subtext: 'Contact us today to discuss how we can help you achieve your goals.',
    buttonText: 'Contact Us',
  },
};

// Mock AI Provider - generates realistic content based on industry
export class MockAIProvider implements AIContentProvider {
  name = 'GREENFIELD AI';

  async generateProjectContent(industry: IndustryType, companyName: string): Promise<ProjectContent> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const industryData = industryContent[industry] || {};
    return {
      ...defaultContent,
      ...industryData,
      tagline: industryData.tagline || `${companyName} - Excellence Redefined`,
      description: industryData.description || `${companyName} delivers professional services with unmatched quality and dedication.`,
    };
  }

  async generatePageContent(industry: IndustryType, pageType: string, companyName: string): Promise<PageContent> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const config = getIndustryConfig(industry);
    const content = industryContent[industry] || defaultContent;

    switch (pageType) {
      case 'home':
        return {
          heroTitle: content.tagline || `Welcome to ${companyName}`,
          heroSubtitle: content.description || '',
          sections: [
            { type: 'services', heading: 'What We Offer', items: content.services },
            { type: 'statistics', heading: 'Our Impact', items: content.stats?.map(s => ({ title: s.value, description: s.label })) },
            { type: 'testimonials', heading: 'Client Stories', items: content.testimonials?.map(t => ({ title: t.name, description: `"${t.text}" — ${t.role}` })) },
            { type: 'cta', heading: content.cta?.heading || 'Ready to Start?', content: content.cta?.subtext || '' },
          ],
        };
      case 'about':
        return {
          heroTitle: `About ${companyName}`,
          heroSubtitle: `Learn about our mission, values, and the team behind ${companyName}.`,
          sections: [
            { type: 'text', heading: 'Our Story', content: `${companyName} was founded with a clear vision: to deliver exceptional value to our clients through innovative solutions and unwavering commitment to quality.` },
            { type: 'text', heading: 'Our Mission', content: `To empower businesses and individuals with the tools, expertise, and support they need to achieve their goals and reach their full potential.` },
            { type: 'text', heading: 'Our Values', content: 'Integrity, Excellence, Innovation, Collaboration, and Client Success guide everything we do.' },
          ],
        };
      case 'services':
        return {
          heroTitle: 'Our Services',
          heroSubtitle: `Comprehensive solutions from ${companyName} tailored to your needs.`,
          sections: [
            { type: 'services', heading: 'What We Offer', items: content.services },
            { type: 'process', heading: 'Our Process', content: '1. Discovery\n2. Strategy\n3. Execution\n4. Optimization\n5. Support' },
            { type: 'cta', heading: 'Let\'s Work Together', content: 'Contact us to discuss how we can help you succeed.' },
          ],
        };
      case 'contact':
        return {
          heroTitle: 'Get in Touch',
          heroSubtitle: `We'd love to hear from you. Reach out to ${companyName} today.`,
          sections: [
            { type: 'contact', heading: 'Contact Us', content: 'Fill out the form below and we\'ll respond within 24 hours.' },
          ],
        };
      default:
        return {
          heroTitle: pageType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          heroSubtitle: `Content for ${companyName}`,
          sections: [{ type: 'text', content: 'This page is ready for your content.' }],
        };
    }
  }

  async generateSectionContent(sectionType: string, context: string): Promise<SectionContent> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      type: sectionType,
      heading: `${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} Section`,
      content: context || 'Generated content based on your context.',
    };
  }

  async rewriteContent(content: string, tone: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Simple tone-based rewriting simulation
    const prefixes: Record<string, string> = {
      'professional': 'We are pleased to present ',
      'friendly': 'Hey there! ',
      'formal': 'It is with great pleasure that we ',
      'casual': 'So here\'s the deal — ',
      'persuasive': 'Discover how ',
    };
    return (prefixes[tone] || '') + content;
  }

  async generateSEO(pageTitle: string, industry: string): Promise<PageSEO> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      title: `${pageTitle} | Professional ${industry} Services`,
      description: `Discover top-quality ${pageTitle.toLowerCase()} services. Expert team, proven results, and dedicated support. Contact us today for a free consultation.`,
      robots: 'index, follow',
    };
  }
}

// Singleton instance
export const aiProvider = new MockAIProvider();
