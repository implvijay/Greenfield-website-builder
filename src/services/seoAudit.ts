// SEO audit service

export interface SEIIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  element?: string;
  recommendation: string;
}

export interface SEOReport {
  pageId: string;
  pageTitle: string;
  timestamp: string;
  issues: SEIIssue[];
  score: number;
  summary: {
    critical: number;
    warning: number;
    info: number;
    total: number;
  };
  meta: {
    title: string;
    description: string;
    keywords: string[];
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
}

const STORAGE_KEY = 'greenfield_seo_reports';

// Audit a page for SEO issues
export function auditPageSEO(page: any): SEOReport {
  const issues: SEIIssue[] = [];
  
  // Check page title
  if (!page.title || page.title.trim() === '') {
    issues.push({
      id: generateId(),
      severity: 'critical',
      category: 'Page Title',
      message: 'Page title is missing',
      recommendation: 'Add a descriptive title (50-60 characters) that includes primary keywords'
    });
  } else {
    if (page.title.length < 30) {
      issues.push({
        id: generateId(),
        severity: 'warning',
        category: 'Page Title',
        message: 'Page title is too short',
        recommendation: 'Expand title to 50-60 characters for better SEO'
      });
    } else if (page.title.length > 60) {
      issues.push({
        id: generateId(),
        severity: 'warning',
        category: 'Page Title',
        message: 'Page title is too long',
        recommendation: 'Shorten title to 50-60 characters to avoid truncation in search results'
      });
    }
  }
  
  // Check page description
  if (!page.description || page.description.trim() === '') {
    issues.push({
      id: generateId(),
      severity: 'critical',
      category: 'Meta Description',
      message: 'Meta description is missing',
      recommendation: 'Add a compelling meta description (150-160 characters) with primary keywords'
    });
  } else {
    if (page.description.length < 120) {
      issues.push({
        id: generateId(),
        severity: 'warning',
        category: 'Meta Description',
        message: 'Meta description is too short',
        recommendation: 'Expand description to 150-160 characters for better click-through rates'
      });
    } else if (page.description.length > 160) {
      issues.push({
        id: generateId(),
        severity: 'warning',
        category: 'Meta Description',
        message: 'Meta description is too long',
        recommendation: 'Shorten description to 150-160 characters to avoid truncation'
      });
    }
  }
  
  // Check URL slug
  if (!page.slug || page.slug.trim() === '') {
    issues.push({
      id: generateId(),
      severity: 'critical',
      category: 'URL Structure',
      message: 'URL slug is missing',
      recommendation: 'Add a descriptive URL slug using lowercase letters and hyphens'
    });
  } else {
    if (!/^[a-z0-9-]+$/.test(page.slug)) {
      issues.push({
        id: generateId(),
        severity: 'warning',
        category: 'URL Structure',
        message: 'URL slug contains invalid characters',
        recommendation: 'Use only lowercase letters, numbers, and hyphens in URL slug'
      });
    }
    if (page.slug.length > 60) {
      issues.push({
        id: generateId(),
        severity: 'info',
        category: 'URL Structure',
        message: 'URL slug is very long',
        recommendation: 'Consider shortening URL slug for better readability'
      });
    }
  }
  
  // Check Open Graph tags
  if (!page.ogTitle || page.ogTitle.trim() === '') {
    issues.push({
      id: generateId(),
      severity: 'warning',
      category: 'Open Graph',
      message: 'Open Graph title is missing',
      recommendation: 'Add og:title for better social media sharing'
    });
  }
  
  if (!page.ogDescription || page.ogDescription.trim() === '') {
    issues.push({
      id: generateId(),
      severity: 'warning',
      category: 'Open Graph',
      message: 'Open Graph description is missing',
      recommendation: 'Add og:description for better social media sharing'
    });
  }
  
  if (!page.ogImage || page.ogImage.trim() === '') {
    issues.push({
      id: generateId(),
      severity: 'info',
      category: 'Open Graph',
      message: 'Open Graph image is missing',
      recommendation: 'Add og:image for rich social media previews'
    });
  }
  
  // Check canonical URL
  if (!page.canonical || page.canonical.trim() === '') {
    issues.push({
      id: generateId(),
      severity: 'info',
      category: 'Canonical URL',
      message: 'Canonical URL is not set',
      recommendation: 'Set canonical URL to prevent duplicate content issues'
    });
  }
  
  // Check content structure
  const headings = extractHeadings(page);
  if (headings.length === 0) {
    issues.push({
      id: generateId(),
      severity: 'warning',
      category: 'Content Structure',
      message: 'No headings found in content',
      recommendation: 'Add headings (H1, H2, H3) to structure content and improve SEO'
    });
  } else {
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      issues.push({
        id: generateId(),
        severity: 'critical',
        category: 'Content Structure',
        message: 'No H1 heading found',
        recommendation: 'Add exactly one H1 heading per page for proper content hierarchy'
      });
    } else if (h1Count > 1) {
      issues.push({
        id: generateId(),
        severity: 'warning',
        category: 'Content Structure',
        message: `Multiple H1 headings found (${h1Count})`,
        recommendation: 'Use only one H1 heading per page'
      });
    }
  }
  
  // Check images
  const images = extractImages(page);
  if (images.length === 0) {
    issues.push({
      id: generateId(),
      severity: 'info',
      category: 'Images',
      message: 'No images found on page',
      recommendation: 'Add relevant images to improve engagement and SEO'
    });
  } else {
    const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '');
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        id: generateId(),
        severity: 'critical',
        category: 'Images',
        message: `${imagesWithoutAlt.length} image(s) missing alt text`,
        recommendation: 'Add descriptive alt text to all images for accessibility and SEO'
      });
    }
  }
  
  // Check internal links
  const links = extractLinks(page);
  if (links.length === 0) {
    issues.push({
      id: generateId(),
      severity: 'info',
      category: 'Internal Links',
      message: 'No internal links found',
      recommendation: 'Add internal links to improve navigation and SEO'
    });
  }
  
  // Check content length
  const contentLength = extractContentLength(page);
  if (contentLength < 300) {
    issues.push({
      id: generateId(),
      severity: 'warning',
      category: 'Content Length',
      message: 'Page content is too short',
      recommendation: 'Add more content (aim for 300+ words) for better SEO performance'
    });
  }
  
  // Calculate score
  const score = calculateSEOScore(issues);
  
  // Generate summary
  const summary = {
    critical: issues.filter(i => i.severity === 'critical').length,
    warning: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length,
    total: issues.length
  };
  
  // Extract meta information
  const meta = {
    title: page.title || '',
    description: page.description || '',
    keywords: page.keywords || [],
    canonical: page.canonical || '',
    ogTitle: page.ogTitle || '',
    ogDescription: page.ogDescription || '',
    ogImage: page.ogImage || ''
  };
  
  return {
    pageId: page.id,
    pageTitle: page.title || 'Untitled Page',
    timestamp: new Date().toISOString(),
    issues,
    score,
    summary,
    meta
  };
}

// Extract headings from page
function extractHeadings(page: any): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = [];
  
  page.sections?.forEach((section: any) => {
    section.rows?.forEach((row: any) => {
      row.columns?.forEach((column: any) => {
        column.components?.forEach((component: any) => {
          if (component.type === 'heading') {
            headings.push({
              level: component.props.level || 2,
              text: component.props.text || ''
            });
          }
        });
      });
    });
  });
  
  return headings;
}

// Extract images from page
function extractImages(page: any): Array<{ alt: string; src: string }> {
  const images: Array<{ alt: string; src: string }> = [];
  
  page.sections?.forEach((section: any) => {
    section.rows?.forEach((row: any) => {
      row.columns?.forEach((column: any) => {
        column.components?.forEach((component: any) => {
          if (component.type === 'image') {
            images.push({
              alt: component.props.alt || '',
              src: component.props.src || ''
            });
          }
        });
      });
    });
  });
  
  return images;
}

// Extract links from page
function extractLinks(page: any): Array<{ text: string; href: string }> {
  const links: Array<{ text: string; href: string }> = [];
  
  page.sections?.forEach((section: any) => {
    section.rows?.forEach((row: any) => {
      row.columns?.forEach((column: any) => {
        column.components?.forEach((component: any) => {
          if (component.type === 'link') {
            links.push({
              text: component.props.text || '',
              href: component.props.href || ''
            });
          }
        });
      });
    });
  });
  
  return links;
}

// Extract content length from page
function extractContentLength(page: any): number {
  let wordCount = 0;
  
  page.sections?.forEach((section: any) => {
    section.rows?.forEach((row: any) => {
      row.columns?.forEach((column: any) => {
        column.components?.forEach((component: any) => {
          if (component.type === 'text' || component.type === 'paragraph') {
            const text = component.props.text || '';
            wordCount += text.split(/\s+/).filter((w: string) => w.length > 0).length;
          }
        });
      });
    });
  });
  
  return wordCount;
}

// Calculate SEO score
function calculateSEOScore(issues: SEIIssue[]): number {
  let score = 100;
  
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 25;
        break;
      case 'warning':
        score -= 10;
        break;
      case 'info':
        score -= 2;
        break;
    }
  });
  
  return Math.max(0, score);
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Save SEO report
export function saveSEOReport(report: SEOReport): void {
  const reports = getSEOReports();
  reports.push(report);
  
  // Keep only last 50 reports
  const trimmed = reports.slice(-50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

// Get all SEO reports
export function getSEOReports(): SEOReport[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load SEO reports:', error);
    return [];
  }
}

// Clear SEO reports
export function clearSEOReports(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Get latest report for a page
export function getLatestSEOReport(pageId: string): SEOReport | null {
  const reports = getSEOReports();
  const pageReports = reports.filter(r => r.pageId === pageId);
  return pageReports.length > 0 ? pageReports[pageReports.length - 1] : null;
}

// Get SEO score for a page
export function getSEOScore(pageId: string): number | null {
  const report = getLatestSEOReport(pageId);
  return report ? report.score : null;
}

// Get SEO recommendations for a page
export function getSEORecommendations(pageId: string): string[] {
  const report = getLatestSEOReport(pageId);
  if (!report) return [];
  
  return report.issues
    .filter(issue => issue.severity === 'critical' || issue.severity === 'warning')
    .map(issue => issue.recommendation);
}
