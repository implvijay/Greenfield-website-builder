import { ProjectAnalytics } from './analytics';

// Export format types
export type ExportFormat = 'csv' | 'json' | 'pdf';

// Export options
export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  sections?: {
    overview?: boolean;
    pages?: boolean;
    folders?: boolean;
    tags?: boolean;
    schedule?: boolean;
  };
}

// Default export options
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'csv',
  includeMetadata: true,
  sections: {
    overview: true,
    pages: true,
    folders: true,
    tags: true,
    schedule: true
  }
};

// Export analytics to CSV
export function exportAnalyticsToCSV(
  analytics: ProjectAnalytics,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS
): string {
  const sections: string[] = [];
  
  // Metadata section
  if (options.includeMetadata) {
    sections.push('# Analytics Export');
    sections.push(`# Generated: ${new Date().toISOString()}`);
    sections.push(`# Last Updated: ${analytics.lastUpdated}`);
    sections.push('');
  }
  
  // Overview section
  if (options.sections?.overview) {
    sections.push('## Overview');
    sections.push('Metric,Value');
    sections.push(`Total Pages,${analytics.pages.totalPages}`);
    sections.push(`Published Pages,${analytics.pages.publishedPages}`);
    sections.push(`Draft Pages,${analytics.pages.draftPages}`);
    sections.push(`Archived Pages,${analytics.pages.archivedPages}`);
    sections.push(`Scheduled Pages,${analytics.pages.scheduledPages}`);
    sections.push(`Average Sections Per Page,${analytics.pages.averageSectionsPerPage.toFixed(2)}`);
    sections.push('');
  }
  
  // Pages by type section
  if (options.sections?.pages) {
    sections.push('## Pages by Type');
    sections.push('Type,Count');
    Object.entries(analytics.pages.pagesByType).forEach(([type, count]) => {
      sections.push(`${type},${count}`);
    });
    sections.push('');
    
    sections.push('## Pages by Status');
    sections.push('Status,Count');
    Object.entries(analytics.pages.pagesByStatus).forEach(([status, count]) => {
      sections.push(`${status},${count}`);
    });
    sections.push('');
  }
  
  // Folders section
  if (options.sections?.folders) {
    sections.push('## Folder Statistics');
    sections.push('Metric,Value');
    sections.push(`Total Folders,${analytics.folders.totalFolders}`);
    sections.push(`Root Folders,${analytics.folders.rootFolders}`);
    sections.push(`Nested Folders,${analytics.folders.nestedFolders}`);
    sections.push(`Empty Folders,${analytics.folders.emptyFolders.length}`);
    sections.push('');
    
    if (analytics.folders.largestFolders.length > 0) {
      sections.push('## Largest Folders');
      sections.push('Folder ID,Page Count');
      analytics.folders.largestFolders.forEach(({ folderId, count }) => {
        sections.push(`${folderId},${count}`);
      });
      sections.push('');
    }
  }
  
  // Tags section
  if (options.sections?.tags) {
    sections.push('## Tag Statistics');
    sections.push('Metric,Value');
    sections.push(`Total Tags,${analytics.tags.totalTags}`);
    sections.push(`Average Tags Per Page,${analytics.tags.averageTagsPerPage.toFixed(2)}`);
    sections.push('');
    
    if (analytics.tags.mostUsedTags.length > 0) {
      sections.push('## Most Used Tags');
      sections.push('Tag,Count');
      analytics.tags.mostUsedTags.forEach(({ tag, count }) => {
        sections.push(`${tag},${count}`);
      });
      sections.push('');
    }
  }
  
  // Schedule section
  if (options.sections?.schedule) {
    sections.push('## Schedule Statistics');
    sections.push('Metric,Value');
    sections.push(`Scheduled Publications,${analytics.schedule.scheduledPublish}`);
    sections.push(`Scheduled Expirations,${analytics.schedule.scheduledExpire}`);
    sections.push('');
    
    if (analytics.schedule.upcomingEvents.length > 0) {
      sections.push('## Upcoming Events');
      sections.push('Page Title,Event Type,Date');
      analytics.schedule.upcomingEvents.forEach(({ page, event, date }) => {
        sections.push(`"${page.title}",${event},${date.toISOString()}`);
      });
      sections.push('');
    }
  }
  
  return sections.join('\n');
}

// Export analytics to JSON
export function exportAnalyticsToJSON(
  analytics: ProjectAnalytics,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS
): string {
  const exportData: any = {
    metadata: {
      exportedAt: new Date().toISOString(),
      lastUpdated: analytics.lastUpdated,
      format: 'json'
    }
  };
  
  if (options.sections?.overview) {
    exportData.overview = {
      totalPages: analytics.pages.totalPages,
      publishedPages: analytics.pages.publishedPages,
      draftPages: analytics.pages.draftPages,
      archivedPages: analytics.pages.archivedPages,
      scheduledPages: analytics.pages.scheduledPages,
      averageSectionsPerPage: analytics.pages.averageSectionsPerPage
    };
  }
  
  if (options.sections?.pages) {
    exportData.pages = {
      byType: analytics.pages.pagesByType,
      byStatus: analytics.pages.pagesByStatus,
      recentPages: analytics.pages.recentPages.map(p => ({
        id: p.id,
        title: p.title,
        type: p.type,
        status: p.status,
        lastModified: p.lastModified
      }))
    };
  }
  
  if (options.sections?.folders) {
    exportData.folders = {
      totalFolders: analytics.folders.totalFolders,
      rootFolders: analytics.folders.rootFolders,
      nestedFolders: analytics.folders.nestedFolders,
      emptyFolders: analytics.folders.emptyFolders,
      largestFolders: analytics.folders.largestFolders
    };
  }
  
  if (options.sections?.tags) {
    exportData.tags = {
      totalTags: analytics.tags.totalTags,
      averageTagsPerPage: analytics.tags.averageTagsPerPage,
      mostUsedTags: analytics.tags.mostUsedTags,
      unusedTags: analytics.tags.unusedTags
    };
  }
  
  if (options.sections?.schedule) {
    exportData.schedule = {
      scheduledPublish: analytics.schedule.scheduledPublish,
      scheduledExpire: analytics.schedule.scheduledExpire,
      upcomingEvents: analytics.schedule.upcomingEvents.map(e => ({
        pageTitle: e.page.title,
        event: e.event,
        date: e.date.toISOString()
      }))
    };
  }
  
  return JSON.stringify(exportData, null, 2);
}

// Export analytics to PDF (HTML-based)
export function exportAnalyticsToPDF(
  analytics: ProjectAnalytics,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS
): string {
  const html: string[] = [];
  
  html.push('<!DOCTYPE html>');
  html.push('<html>');
  html.push('<head>');
  html.push('<meta charset="UTF-8">');
  html.push('<title>Analytics Report</title>');
  html.push('<style>');
  html.push('body { font-family: Arial, sans-serif; margin: 40px; }');
  html.push('h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }');
  html.push('h2 { color: #374151; margin-top: 30px; }');
  html.push('table { width: 100%; border-collapse: collapse; margin: 20px 0; }');
  html.push('th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }');
  html.push('th { background-color: #f3f4f6; font-weight: 600; }');
  html.push('.metric { display: inline-block; margin: 10px 20px 10px 0; }');
  html.push('.metric-value { font-size: 24px; font-weight: bold; color: #1e40af; }');
  html.push('.metric-label { font-size: 14px; color: #6b7280; }');
  html.push('</style>');
  html.push('</head>');
  html.push('<body>');
  
  // Title
  html.push('<h1>Analytics Report</h1>');
  html.push(`<p>Generated: ${new Date().toLocaleString()}</p>`);
  
  // Overview
  if (options.sections?.overview) {
    html.push('<h2>Overview</h2>');
    html.push('<div>');
    html.push(`<div class="metric"><div class="metric-value">${analytics.pages.totalPages}</div><div class="metric-label">Total Pages</div></div>`);
    html.push(`<div class="metric"><div class="metric-value">${analytics.pages.publishedPages}</div><div class="metric-label">Published</div></div>`);
    html.push(`<div class="metric"><div class="metric-value">${analytics.pages.draftPages}</div><div class="metric-label">Drafts</div></div>`);
    html.push(`<div class="metric"><div class="metric-value">${analytics.folders.totalFolders}</div><div class="metric-label">Folders</div></div>`);
    html.push(`<div class="metric"><div class="metric-value">${analytics.tags.totalTags}</div><div class="metric-label">Tags</div></div>`);
    html.push('</div>');
  }
  
  // Pages by type
  if (options.sections?.pages) {
    html.push('<h2>Pages by Type</h2>');
    html.push('<table>');
    html.push('<tr><th>Type</th><th>Count</th></tr>');
    Object.entries(analytics.pages.pagesByType).forEach(([type, count]) => {
      html.push(`<tr><td>${type}</td><td>${count}</td></tr>`);
    });
    html.push('</table>');
  }
  
  // Folders
  if (options.sections?.folders) {
    html.push('<h2>Folder Statistics</h2>');
    html.push('<table>');
    html.push('<tr><th>Metric</th><th>Value</th></tr>');
    html.push(`<tr><td>Total Folders</td><td>${analytics.folders.totalFolders}</td></tr>`);
    html.push(`<tr><td>Root Folders</td><td>${analytics.folders.rootFolders}</td></tr>`);
    html.push(`<tr><td>Nested Folders</td><td>${analytics.folders.nestedFolders}</td></tr>`);
    html.push(`<tr><td>Empty Folders</td><td>${analytics.folders.emptyFolders.length}</td></tr>`);
    html.push('</table>');
  }
  
  // Tags
  if (options.sections?.tags) {
    html.push('<h2>Tag Statistics</h2>');
    html.push('<table>');
    html.push('<tr><th>Metric</th><th>Value</th></tr>');
    html.push(`<tr><td>Total Tags</td><td>${analytics.tags.totalTags}</td></tr>`);
    html.push(`<tr><td>Average Tags Per Page</td><td>${analytics.tags.averageTagsPerPage.toFixed(2)}</td></tr>`);
    html.push('</table>');
    
    if (analytics.tags.mostUsedTags.length > 0) {
      html.push('<h3>Most Used Tags</h3>');
      html.push('<table>');
      html.push('<tr><th>Tag</th><th>Count</th></tr>');
      analytics.tags.mostUsedTags.forEach(({ tag, count }) => {
        html.push(`<tr><td>${tag}</td><td>${count}</td></tr>`);
      });
      html.push('</table>');
    }
  }
  
  // Schedule
  if (options.sections?.schedule) {
    html.push('<h2>Schedule Overview</h2>');
    html.push('<table>');
    html.push('<tr><th>Metric</th><th>Value</th></tr>');
    html.push(`<tr><td>Scheduled Publications</td><td>${analytics.schedule.scheduledPublish}</td></tr>`);
    html.push(`<tr><td>Scheduled Expirations</td><td>${analytics.schedule.scheduledExpire}</td></tr>`);
    html.push('</table>');
    
    if (analytics.schedule.upcomingEvents.length > 0) {
      html.push('<h3>Upcoming Events</h3>');
      html.push('<table>');
      html.push('<tr><th>Page</th><th>Event</th><th>Date</th></tr>');
      analytics.schedule.upcomingEvents.forEach(({ page, event, date }) => {
        html.push(`<tr><td>${page.title}</td><td>${event}</td><td>${date.toLocaleString()}</td></tr>`);
      });
      html.push('</table>');
    }
  }
  
  html.push('</body>');
  html.push('</html>');
  
  return html.join('\n');
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export analytics with format detection
export function exportAnalytics(
  analytics: ProjectAnalytics,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (options.format) {
    case 'csv': {
      const content = exportAnalyticsToCSV(analytics, options);
      downloadFile(content, `analytics-${timestamp}.csv`, 'text/csv');
      break;
    }
    case 'json': {
      const content = exportAnalyticsToJSON(analytics, options);
      downloadFile(content, `analytics-${timestamp}.json`, 'application/json');
      break;
    }
    case 'pdf': {
      const content = exportAnalyticsToPDF(analytics, options);
      // For PDF, we'll open in new window for printing
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(content);
        newWindow.document.close();
        // Trigger print dialog
        setTimeout(() => {
          newWindow.print();
        }, 500);
      }
      break;
    }
  }
}

// Export change log to CSV
export function exportChangeLogToCSV(
  records: any[],
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS
): string {
  const sections: string[] = [];
  
  if (options.includeMetadata) {
    sections.push('# Change Log Export');
    sections.push(`# Generated: ${new Date().toISOString()}`);
    sections.push(`# Total Records: ${records.length}`);
    sections.push('');
  }
  
  sections.push('Timestamp,User,Action,Entity Type,Entity Name,Changes');
  
  records.forEach(record => {
    const changes = record.changes
      .map((c: any) => `${c.field}: ${c.oldValue} → ${c.newValue}`)
      .join('; ');
    
    sections.push([
      `"${new Date(record.timestamp).toLocaleString()}"`,
      `"${record.userName}"`,
      `"${record.action}"`,
      `"${record.entityType}"`,
      `"${record.entityName}"`,
      `"${changes}"`
    ].join(','));
  });
  
  return sections.join('\n');
}

// Get export file size estimate
export function getExportSizeEstimate(
  analytics: ProjectAnalytics,
  format: ExportFormat
): string {
  let content: string;
  
  switch (format) {
    case 'csv':
      content = exportAnalyticsToCSV(analytics);
      break;
    case 'json':
      content = exportAnalyticsToJSON(analytics);
      break;
    case 'pdf':
      content = exportAnalyticsToPDF(analytics);
      break;
  }
  
  const bytes = new Blob([content]).size;
  
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
