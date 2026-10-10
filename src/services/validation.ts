import { Project, Page, Menu, MenuItem } from '../types';

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  pageId?: string;
  fix?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

export function validateProjectForExport(project: Project): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Validate pages
  validatePages(project, issues);

  // Validate menus
  validateMenus(project, issues);

  // Validate SEO
  validateSEO(project, issues);

  // Validate content
  validateContent(project, issues);

  // Validate forms
  validateForms(project, issues);

  const errors = issues.filter(i => i.type === 'error').length;
  const warnings = issues.filter(i => i.type === 'warning').length;
  const info = issues.filter(i => i.type === 'info').length;

  return {
    valid: errors === 0,
    issues,
    summary: { errors, warnings, info },
  };
}

function validatePages(project: Project, issues: ValidationIssue[]) {
  const publishedPages = project.pages.filter(p => p.status === 'published');

  if (publishedPages.length === 0) {
    issues.push({
      type: 'error',
      category: 'Pages',
      message: 'No published pages found. At least one page must be published for export.',
      fix: 'Publish at least one page before exporting.',
    });
    return;
  }

  // Check for home page
  const hasHome = publishedPages.some(p => p.type === 'home' || p.slug === 'home' || p.slug === 'index');
  if (!hasHome) {
    issues.push({
      type: 'warning',
      category: 'Pages',
      message: 'No home page found. Consider adding a page with type "home" or slug "home".',
      fix: 'Create a home page or change an existing page slug to "home".',
    });
  }

  // Check for duplicate slugs
  const slugs = publishedPages.map(p => p.slug);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicates.length > 0) {
    issues.push({
      type: 'error',
      category: 'Pages',
      message: `Duplicate page slugs found: ${[...new Set(duplicates)].join(', ')}. Each page must have a unique slug.`,
      fix: 'Ensure each page has a unique slug.',
    });
  }

  // Check for empty pages
  publishedPages.forEach(page => {
    if (page.sections.length === 0) {
      issues.push({
        type: 'warning',
        category: 'Pages',
        message: `Page "${page.title}" has no sections. It will export as an empty page.`,
        pageId: page.id,
        fix: `Add content to "${page.title}" or unpublish it.`,
      });
    }
  });

  // Check for invalid slug characters
  publishedPages.forEach(page => {
    if (!/^[a-z0-9-]+$/.test(page.slug)) {
      issues.push({
        type: 'error',
        category: 'Pages',
        message: `Page "${page.title}" has an invalid slug "${page.slug}". Slugs must contain only lowercase letters, numbers, and hyphens.`,
        pageId: page.id,
        fix: 'Use only lowercase letters, numbers, and hyphens in the slug.',
      });
    }
  });
}

function validateMenus(project: Project, issues: ValidationIssue[]) {
  const primaryMenu = project.menus.find(m => m.location === 'primary');

  if (!primaryMenu) {
    issues.push({
      type: 'warning',
      category: 'Menus',
      message: 'No primary navigation menu found. The exported site will have no main navigation.',
      fix: 'Create a menu with location "primary".',
    });
  } else if (primaryMenu.items.length === 0) {
    issues.push({
      type: 'warning',
      category: 'Menus',
      message: 'Primary menu has no items. Navigation will be empty.',
      fix: 'Add items to the primary menu.',
    });
  }

  // Check for broken menu links
  project.menus.forEach(menu => {
    const checkItems = (items: MenuItem[]) => {
      items.forEach(item => {
        if (item.type === 'page' && item.pageId) {
          const page = project.pages.find(p => p.id === item.pageId);
          if (!page) {
            issues.push({
              type: 'error',
              category: 'Menus',
              message: `Menu item "${item.label}" in "${menu.name}" references a deleted page.`,
              fix: 'Update the menu item to point to an existing page.',
            });
          } else if (page.status !== 'published') {
            issues.push({
              type: 'warning',
              category: 'Menus',
              message: `Menu item "${item.label}" links to unpublished page "${page.title}".`,
              fix: `Publish the page "${page.title}" or remove it from the menu.`,
            });
          }
        }
        if (item.type === 'url' && (!item.target || item.target.trim() === '')) {
          issues.push({
            type: 'warning',
            category: 'Menus',
            message: `Menu item "${item.label}" has an empty URL.`,
            fix: 'Add a valid URL or change the link type.',
          });
        }
        if (item.children.length > 0) {
          checkItems(item.children);
        }
      });
    };
    checkItems(menu.items);
  });
}

function validateSEO(project: Project, issues: ValidationIssue[]) {
  // Global SEO
  if (!project.seo.siteTitle || project.seo.siteTitle.trim() === '') {
    issues.push({
      type: 'error',
      category: 'SEO',
      message: 'Site title is missing. This is required for proper page titles and branding.',
      fix: 'Add a site title in SEO settings.',
    });
  }

  if (!project.seo.description || project.seo.description.trim() === '') {
    issues.push({
      type: 'warning',
      category: 'SEO',
      message: 'Site meta description is missing. This affects search engine results.',
      fix: 'Add a meta description in SEO settings.',
    });
  }

  if (project.seo.description && project.seo.description.length > 160) {
    issues.push({
      type: 'warning',
      category: 'SEO',
      message: `Site meta description is ${project.seo.description.length} characters. Recommended maximum is 160 characters.`,
      fix: 'Shorten the meta description to 160 characters or less.',
    });
  }

  // Per-page SEO
  project.pages.filter(p => p.status === 'published').forEach(page => {
    if (!page.seo.title || page.seo.title.trim() === '') {
      issues.push({
        type: 'warning',
        category: 'SEO',
        message: `Page "${page.title}" has no SEO title. It will use the default format.`,
        pageId: page.id,
        fix: `Add an SEO title to "${page.title}".`,
      });
    }

    if (!page.seo.description || page.seo.description.trim() === '') {
      issues.push({
        type: 'info',
        category: 'SEO',
        message: `Page "${page.title}" has no meta description.`,
        pageId: page.id,
        fix: `Add a meta description to "${page.title}" for better SEO.`,
      });
    }
  });
}

function validateContent(project: Project, issues: ValidationIssue[]) {
  // Check for missing images (alt text)
  let missingAltCount = 0;
  project.pages.forEach(page => {
    page.sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(col => {
          col.components.forEach(comp => {
            if (comp.type === 'image' && (!comp.props.alt || comp.props.alt.trim() === '')) {
              missingAltCount++;
            }
          });
        });
      });
    });
  });

  if (missingAltCount > 0) {
    issues.push({
      type: 'warning',
      category: 'Content',
      message: `${missingAltCount} image(s) missing alt text. This affects accessibility and SEO.`,
      fix: 'Add descriptive alt text to all images.',
    });
  }
}

function validateForms(project: Project, issues: ValidationIssue[]) {
  project.forms.forEach(form => {
    if (form.fields.length === 0) {
      issues.push({
        type: 'warning',
        category: 'Forms',
        message: `Form "${form.name}" has no fields.`,
        fix: `Add fields to "${form.name}" or delete the form.`,
      });
    }

    if (form.submitAction.type === 'email' && (!form.submitAction.emailTo || form.submitAction.emailTo.trim() === '')) {
      issues.push({
        type: 'warning',
        category: 'Forms',
        message: `Form "${form.name}" is configured to send email but has no recipient address.`,
        fix: `Add an email address to form "${form.name}" or change the submit action.`,
      });
    }

    if ((form.submitAction.type === 'webhook' || form.submitAction.type === 'formspree') && (!form.submitAction.endpoint || form.submitAction.endpoint.trim() === '')) {
      issues.push({
        type: 'warning',
        category: 'Forms',
        message: `Form "${form.name}" has a ${form.submitAction.type} action but no endpoint URL.`,
        fix: `Add an endpoint URL to form "${form.name}".`,
      });
    }
  });
}
