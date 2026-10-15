// Accessibility audit service

export interface AccessibilityIssue {
  id: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  category: string;
  message: string;
  element?: string;
  selector?: string;
  wcagCriteria?: string;
  recommendation: string;
}

export interface AccessibilityReport {
  pageId: string;
  pageTitle: string;
  timestamp: string;
  issues: AccessibilityIssue[];
  score: number;
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
}

const STORAGE_KEY = 'greenfield_accessibility_reports';

// Audit a page for accessibility issues
export function auditPageAccessibility(page: any): AccessibilityReport {
  const issues: AccessibilityIssue[] = [];
  
  // Check page title
  if (!page.title || page.title.trim() === '') {
    issues.push({
      id: generateId(),
      severity: 'critical',
      category: 'Page Title',
      message: 'Page title is missing',
      wcagCriteria: '2.4.2',
      recommendation: 'Add a descriptive title to the page'
    });
  } else if (page.title.length > 60) {
    issues.push({
      id: generateId(),
      severity: 'moderate',
      category: 'Page Title',
      message: 'Page title is too long',
      wcagCriteria: '2.4.2',
      recommendation: 'Keep page titles under 60 characters for better readability'
    });
  }
  
  // Check page description
  if (!page.description || page.description.trim() === '') {
    issues.push({
      id: generateId(),
      severity: 'serious',
      category: 'Page Description',
      message: 'Page description is missing',
      wcagCriteria: '2.4.4',
      recommendation: 'Add a descriptive summary of the page content'
    });
  }
  
  // Check sections
  page.sections?.forEach((section: any, index: number) => {
    // Check for heading hierarchy
    const headings = extractHeadings(section);
    if (headings.length > 0) {
      const firstHeading = headings[0];
      if (firstHeading.level !== 1 && index === 0) {
        issues.push({
          id: generateId(),
          severity: 'serious',
          category: 'Heading Hierarchy',
          message: 'First heading should be H1',
          element: `Section ${index + 1}`,
          wcagCriteria: '1.3.1',
          recommendation: 'Use H1 for the main heading of the page'
        });
      }
      
      // Check for skipped heading levels
      for (let i = 1; i < headings.length; i++) {
        if (headings[i].level - headings[i - 1].level > 1) {
          issues.push({
            id: generateId(),
            severity: 'moderate',
            category: 'Heading Hierarchy',
            message: `Heading level skipped from H${headings[i - 1].level} to H${headings[i].level}`,
            element: `Section ${index + 1}`,
            wcagCriteria: '1.3.1',
            recommendation: 'Use sequential heading levels (H1, H2, H3, etc.)'
          });
        }
      }
    }
    
    // Check for images without alt text
    const images = extractImages(section);
    images.forEach((img, imgIndex) => {
      if (!img.alt || img.alt.trim() === '') {
        issues.push({
          id: generateId(),
          severity: 'critical',
          category: 'Image Alt Text',
          message: 'Image is missing alt text',
          element: `Section ${index + 1}, Image ${imgIndex + 1}`,
          wcagCriteria: '1.1.1',
          recommendation: 'Add descriptive alt text to all images'
        });
      } else if (img.alt.length > 125) {
        issues.push({
          id: generateId(),
          severity: 'minor',
          category: 'Image Alt Text',
          message: 'Image alt text is too long',
          element: `Section ${index + 1}, Image ${imgIndex + 1}`,
          wcagCriteria: '1.1.1',
          recommendation: 'Keep alt text concise (under 125 characters)'
        });
      }
    });
    
    // Check for buttons without labels
    const buttons = extractButtons(section);
    buttons.forEach((btn, btnIndex) => {
      if (!btn.label || btn.label.trim() === '') {
        issues.push({
          id: generateId(),
          severity: 'critical',
          category: 'Button Labels',
          message: 'Button is missing label',
          element: `Section ${index + 1}, Button ${btnIndex + 1}`,
          wcagCriteria: '4.1.2',
          recommendation: 'Add descriptive labels to all buttons'
        });
      }
    });
    
    // Check for links without text
    const links = extractLinks(section);
    links.forEach((link, linkIndex) => {
      if (!link.text || link.text.trim() === '') {
        issues.push({
          id: generateId(),
          severity: 'critical',
          category: 'Link Text',
          message: 'Link is missing text',
          element: `Section ${index + 1}, Link ${linkIndex + 1}`,
          wcagCriteria: '2.4.4',
          recommendation: 'Add descriptive text to all links'
        });
      } else if (link.text.toLowerCase() === 'click here' || link.text.toLowerCase() === 'read more') {
        issues.push({
          id: generateId(),
          severity: 'moderate',
          category: 'Link Text',
          message: 'Link text is not descriptive',
          element: `Section ${index + 1}, Link ${linkIndex + 1}`,
          wcagCriteria: '2.4.4',
          recommendation: 'Use descriptive link text that makes sense out of context'
        });
      }
    });
    
    // Check for form fields without labels
    const formFields = extractFormFields(section);
    formFields.forEach((field, fieldIndex) => {
      if (!field.label || field.label.trim() === '') {
        issues.push({
          id: generateId(),
          severity: 'critical',
          category: 'Form Labels',
          message: 'Form field is missing label',
          element: `Section ${index + 1}, Form Field ${fieldIndex + 1}`,
          wcagCriteria: '1.3.1',
          recommendation: 'Add labels to all form fields'
        });
      }
    });
    
    // Check color contrast (simplified check)
    if (section.settings?.backgroundColor && section.settings?.textColor) {
      const contrast = calculateContrastRatio(
        section.settings.backgroundColor,
        section.settings.textColor
      );
      if (contrast < 4.5) {
        issues.push({
          id: generateId(),
          severity: 'serious',
          category: 'Color Contrast',
          message: `Insufficient color contrast ratio (${contrast.toFixed(2)}:1)`,
          element: `Section ${index + 1}`,
          wcagCriteria: '1.4.3',
          recommendation: 'Use colors with a contrast ratio of at least 4.5:1 for normal text'
        });
      }
    }
  });
  
  // Calculate score
  const score = calculateAccessibilityScore(issues);
  
  // Generate summary
  const summary = {
    critical: issues.filter(i => i.severity === 'critical').length,
    serious: issues.filter(i => i.severity === 'serious').length,
    moderate: issues.filter(i => i.severity === 'moderate').length,
    minor: issues.filter(i => i.severity === 'minor').length,
    total: issues.length
  };
  
  return {
    pageId: page.id,
    pageTitle: page.title || 'Untitled Page',
    timestamp: new Date().toISOString(),
    issues,
    score,
    summary
  };
}

// Extract headings from section
function extractHeadings(section: any): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = [];
  
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
  
  return headings;
}

// Extract images from section
function extractImages(section: any): Array<{ alt: string; src: string }> {
  const images: Array<{ alt: string; src: string }> = [];
  
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
  
  return images;
}

// Extract buttons from section
function extractButtons(section: any): Array<{ label: string }> {
  const buttons: Array<{ label: string }> = [];
  
  section.rows?.forEach((row: any) => {
    row.columns?.forEach((column: any) => {
      column.components?.forEach((component: any) => {
        if (component.type === 'button') {
          buttons.push({
            label: component.props.label || ''
          });
        }
      });
    });
  });
  
  return buttons;
}

// Extract links from section
function extractLinks(section: any): Array<{ text: string; href: string }> {
  const links: Array<{ text: string; href: string }> = [];
  
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
  
  return links;
}

// Extract form fields from section
function extractFormFields(section: any): Array<{ label: string; type: string }> {
  const fields: Array<{ label: string; type: string }> = [];
  
  section.rows?.forEach((row: any) => {
    row.columns?.forEach((column: any) => {
      column.components?.forEach((component: any) => {
        if (component.type === 'formField') {
          fields.push({
            label: component.props.label || '',
            type: component.props.type || 'text'
          });
        }
      });
    });
  });
  
  return fields;
}

// Calculate color contrast ratio (simplified)
function calculateContrastRatio(bgColor: string, textColor: string): number {
  // Simplified contrast calculation
  // In a real implementation, this would use proper WCAG contrast formula
  const bgLuminance = getLuminance(bgColor);
  const textLuminance = getLuminance(textColor);
  
  const lighter = Math.max(bgLuminance, textLuminance);
  const darker = Math.min(bgLuminance, textLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Get relative luminance (simplified)
function getLuminance(color: string): number {
  // Simplified luminance calculation
  // In a real implementation, this would parse hex/rgb colors properly
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  return 0.5; // Default middle luminance
}

// Calculate accessibility score
function calculateAccessibilityScore(issues: AccessibilityIssue[]): number {
  let score = 100;
  
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 20;
        break;
      case 'serious':
        score -= 10;
        break;
      case 'moderate':
        score -= 5;
        break;
      case 'minor':
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

// Save accessibility report
export function saveAccessibilityReport(report: AccessibilityReport): void {
  const reports = getAccessibilityReports();
  reports.push(report);
  
  // Keep only last 50 reports
  const trimmed = reports.slice(-50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

// Get all accessibility reports
export function getAccessibilityReports(): AccessibilityReport[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load accessibility reports:', error);
    return [];
  }
}

// Clear accessibility reports
export function clearAccessibilityReports(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Get latest report for a page
export function getLatestAccessibilityReport(pageId: string): AccessibilityReport | null {
  const reports = getAccessibilityReports();
  const pageReports = reports.filter(r => r.pageId === pageId);
  return pageReports.length > 0 ? pageReports[pageReports.length - 1] : null;
}

// Get accessibility score for a page
export function getAccessibilityScore(pageId: string): number | null {
  const report = getLatestAccessibilityReport(pageId);
  return report ? report.score : null;
}
