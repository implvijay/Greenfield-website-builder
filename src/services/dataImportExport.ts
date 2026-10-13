// Data Import/Export Service

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  includePages: boolean;
  includeSections: boolean;
  includeComponents: boolean;
  includeMedia: boolean;
  includeSettings: boolean;
  includeAnalytics: boolean;
  includeTemplates: boolean;
}

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includePages: true,
  includeSections: true,
  includeComponents: true,
  includeMedia: false,
  includeSettings: true,
  includeAnalytics: false,
  includeTemplates: true
};

// Export project data
export function exportProjectData(projectId: string, options: ExportOptions = DEFAULT_EXPORT_OPTIONS): string {
  const project = getProjectData(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  
  const exportData: any = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projectId: project.id,
    projectName: project.name
  };
  
  if (options.includePages) {
    exportData.pages = project.pages || [];
  }
  
  if (options.includeSettings) {
    exportData.settings = {
      theme: project.theme,
      themeVariant: project.themeVariant,
      seo: project.seo,
      analytics: project.analytics
    };
  }
  
  if (options.includeTemplates) {
    exportData.templates = {
      componentTemplates: getComponentTemplates(),
      sectionTemplates: getSectionTemplates(),
      pageTemplates: getPageTemplates()
    };
  }
  
  if (options.includeAnalytics) {
    exportData.analytics = {
      events: getAnalyticsEvents(),
      conversions: getConversions(),
      abTests: getABTests()
    };
  }
  
  return JSON.stringify(exportData, null, 2);
}

// Import project data
export function importProjectData(jsonData: string, targetProjectId: string): ImportResult {
  const result: ImportResult = {
    success: false,
    importedCount: 0,
    errors: [],
    warnings: []
  };
  
  try {
    const importData = JSON.parse(jsonData);
    
    // Validate version
    if (!importData.version) {
      result.errors.push('Invalid import file: missing version');
      return result;
    }
    
    // Import pages
    if (importData.pages && Array.isArray(importData.pages)) {
      const project = getProjectData(targetProjectId);
      if (project) {
        importData.pages.forEach((page: any) => {
          // Generate new IDs to avoid conflicts
          page.id = crypto.randomUUID();
          if (page.sections) {
            page.sections.forEach((section: any) => {
              section.id = crypto.randomUUID();
              if (section.rows) {
                section.rows.forEach((row: any) => {
                  row.id = crypto.randomUUID();
                  if (row.columns) {
                    row.columns.forEach((column: any) => {
                      column.id = crypto.randomUUID();
                      if (column.components) {
                        column.components.forEach((component: any) => {
                          component.id = crypto.randomUUID();
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
        
        project.pages = [...(project.pages || []), ...importData.pages];
        saveProjectData(targetProjectId, project);
        result.importedCount += importData.pages.length;
      }
    }
    
    // Import settings
    if (importData.settings) {
      const project = getProjectData(targetProjectId);
      if (project) {
        if (importData.settings.theme) {
          project.theme = importData.settings.theme;
        }
        if (importData.settings.themeVariant) {
          project.themeVariant = importData.settings.themeVariant;
        }
        if (importData.settings.seo) {
          project.seo = { ...project.seo, ...importData.settings.seo };
        }
        if (importData.settings.analytics) {
          project.analytics = { ...project.analytics, ...importData.settings.analytics };
        }
        saveProjectData(targetProjectId, project);
        result.importedCount++;
      }
    }
    
    // Import templates
    if (importData.templates) {
      if (importData.templates.componentTemplates) {
        const existingTemplates = getComponentTemplates();
        const newTemplates = importData.templates.componentTemplates.map((t: any) => ({
          ...t,
          id: crypto.randomUUID()
        }));
        saveComponentTemplates([...existingTemplates, ...newTemplates]);
        result.importedCount += newTemplates.length;
      }
      
      if (importData.templates.sectionTemplates) {
        const existingTemplates = getSectionTemplates();
        const newTemplates = importData.templates.sectionTemplates.map((t: any) => ({
          ...t,
          id: crypto.randomUUID()
        }));
        saveSectionTemplates([...existingTemplates, ...newTemplates]);
        result.importedCount += newTemplates.length;
      }
      
      if (importData.templates.pageTemplates) {
        const existingTemplates = getPageTemplates();
        const newTemplates = importData.templates.pageTemplates.map((t: any) => ({
          ...t,
          id: crypto.randomUUID()
        }));
        savePageTemplates([...existingTemplates, ...newTemplates]);
        result.importedCount += newTemplates.length;
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
    
  } catch (error) {
    result.errors.push(`Failed to parse import file: ${error}`);
    return result;
  }
}

// Helper functions to get/save data (these would integrate with existing services)
function getProjectData(projectId: string): any {
  try {
    const data = localStorage.getItem(`greenfield_project_${projectId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveProjectData(projectId: string,  any): void {
  localStorage.setItem(`greenfield_project_${projectId}`, JSON.stringify(data));
}

function getComponentTemplates(): any[] {
  try {
    const data = localStorage.getItem('greenfield_component_templates');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveComponentTemplates(templates: any[]): void {
  localStorage.setItem('greenfield_component_templates', JSON.stringify(templates));
}

function getSectionTemplates(): any[] {
  try {
    const data = localStorage.getItem('greenfield_section_templates');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSectionTemplates(templates: any[]): void {
  localStorage.setItem('greenfield_section_templates', JSON.stringify(templates));
}

function getPageTemplates(): any[] {
  try {
    const data = localStorage.getItem('greenfield_page_templates');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function savePageTemplates(templates: any[]): void {
  localStorage.setItem('greenfield_page_templates', JSON.stringify(templates));
}

function getAnalyticsEvents(): any[] {
  try {
    const data = localStorage.getItem('greenfield_analytics_events');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getConversions(): any[] {
  try {
    const data = localStorage.getItem('greenfield_conversions');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getABTests(): any[] {
  try {
    const data = localStorage.getItem('greenfield_ab_tests');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Export to CSV
export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        const escaped = ('' + value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to JSON
export function exportToJSON( any, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import from file
export function importFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

// Validate import data
export function validateImportData(jsonData: string): { valid: boolean; errors: string[] } {
  try {
    const data = JSON.parse(jsonData);
    const errors: string[] = [];
    
    if (!data.version) {
      errors.push('Missing version field');
    }
    
    if (data.pages && !Array.isArray(data.pages)) {
      errors.push('Pages must be an array');
    }
    
    if (data.templates) {
      if (data.templates.componentTemplates && !Array.isArray(data.templates.componentTemplates)) {
        errors.push('Component templates must be an array');
      }
      if (data.templates.sectionTemplates && !Array.isArray(data.templates.sectionTemplates)) {
        errors.push('Section templates must be an array');
      }
      if (data.templates.pageTemplates && !Array.isArray(data.templates.pageTemplates)) {
        errors.push('Page templates must be an array');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Invalid JSON: ${error}`]
    };
  }
}
