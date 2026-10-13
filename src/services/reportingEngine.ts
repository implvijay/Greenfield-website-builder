// Advanced Reporting Engine Service

export interface Report {
  id: string;
  name: string;
  description: string;
  type: 'analytics' | 'conversions' | 'ab_testing' | 'funnel' | 'custom';
  config: ReportConfig;
  schedule?: ReportSchedule;
  createdAt: string;
  lastGenerated?: string;
}

export interface ReportConfig {
  dateRange: {
    type: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom';
    start?: string;
    end?: string;
  };
  sections: ReportSection[];
  format: 'pdf' | 'html' | 'json' | 'csv';
  includeCharts: boolean;
  includeInsights: boolean;
}

export interface ReportSection {
  id: string;
  type: 'summary' | 'metrics' | 'charts' | 'insights' | 'recommendations';
  title: string;
  config: any;
  order: number;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:MM format
  recipients: string[];
  enabled: boolean;
}

export interface GeneratedReport {
  id: string;
  reportId: string;
  generatedAt: string;
  data: any;
  format: string;
  size: number;
}

const REPORTS_KEY = 'greenfield_reports';
const GENERATED_REPORTS_KEY = 'greenfield_generated_reports';

// Create report configuration
export function createReport(
  name: string,
  description: string,
  type: Report['type'],
  config: ReportConfig,
  schedule?: ReportSchedule
): Report {
  const reports = getReports();
  const report: Report = {
    id: crypto.randomUUID(),
    name,
    description,
    type,
    config,
    schedule,
    createdAt: new Date().toISOString()
  };
  
  reports.push(report);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  
  return report;
}

// Get all reports
export function getReports(): Report[] {
  try {
    const data = localStorage.getItem(REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load reports:', error);
    return [];
  }
}

// Get report by ID
export function getReportById(reportId: string): Report | undefined {
  return getReports().find(r => r.id === reportId);
}

// Update report
export function updateReport(reportId: string, updates: Partial<Report>): Report | null {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  
  if (index === -1) return null;
  
  reports[index] = { ...reports[index], ...updates };
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  
  return reports[index];
}

// Delete report
export function deleteReport(reportId: string): void {
  const reports = getReports().filter(r => r.id !== reportId);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  
  // Also delete generated reports
  const generated = getGeneratedReports().filter(gr => gr.reportId !== reportId);
  localStorage.setItem(GENERATED_REPORTS_KEY, JSON.stringify(generated));
}

// Generate report
export function generateReport(reportId: string): GeneratedReport | null {
  const report = getReportById(reportId);
  if (!report) return null;
  
  // Resolve date range
  const dateRange = resolveDateRange(report.config.dateRange);
  
  // Generate report data based on type
  let reportData: any;
  
  switch (report.type) {
    case 'analytics':
      reportData = generateAnalyticsReport(dateRange, report.config);
      break;
    case 'conversions':
      reportData = generateConversionsReport(dateRange, report.config);
      break;
    case 'ab_testing':
      reportData = generateABTestingReport(dateRange, report.config);
      break;
    case 'funnel':
      reportData = generateFunnelReport(dateRange, report.config);
      break;
    default:
      reportData = generateCustomReport(dateRange, report.config);
  }
  
  // Save generated report
  const generated: GeneratedReport = {
    id: crypto.randomUUID(),
    reportId,
    generatedAt: new Date().toISOString(),
    data: reportData,
    format: report.config.format,
    size: JSON.stringify(reportData).length
  };
  
  const generatedReports = getGeneratedReports();
  generatedReports.push(generated);
  localStorage.setItem(GENERATED_REPORTS_KEY, JSON.stringify(generatedReports));
  
  // Update last generated timestamp
  updateReport(reportId, { lastGenerated: generated.generatedAt });
  
  return generated;
}

// Resolve date range
function resolveDateRange(dateRange: ReportConfig['dateRange']): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString();
  
  switch (dateRange.type) {
    case 'last_7_days':
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: sevenDaysAgo.toISOString(), end };
    case 'last_30_days':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: thirtyDaysAgo.toISOString(), end };
    case 'last_90_days':
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { start: ninetyDaysAgo.toISOString(), end };
    case 'custom':
      return { start: dateRange.start || end, end: dateRange.end || end };
    default:
      return { start: end, end };
  }
}

// Generate analytics report
function generateAnalyticsReport(dateRange: { start: string; end: string }, config: ReportConfig): any {
  // This would integrate with analyticsQuery service
  return {
    type: 'analytics',
    dateRange,
    summary: {
      totalEvents: 0,
      uniqueUsers: 0,
      averageEventsPerUser: 0
    },
    sections: config.sections
  };
}

// Generate conversions report
function generateConversionsReport(dateRange: { start: string; end: string }, config: ReportConfig): any {
  // This would integrate with conversionTracking service
  return {
    type: 'conversions',
    dateRange,
    summary: {
      totalConversions: 0,
      totalValue: 0,
      conversionRate: 0
    },
    sections: config.sections
  };
}

// Generate A/B testing report
function generateABTestingReport(dateRange: { start: string; end: string }, config: ReportConfig): any {
  // This would integrate with abTesting service
  return {
    type: 'ab_testing',
    dateRange,
    summary: {
      activeTests: 0,
      completedTests: 0,
      winners: 0
    },
    sections: config.sections
  };
}

// Generate funnel report
function generateFunnelReport(dateRange: { start: string; end: string }, config: ReportConfig): any {
  // This would integrate with conversionTracking service
  return {
    type: 'funnel',
    dateRange,
    summary: {
      totalFunnels: 0,
      averageConversionRate: 0
    },
    sections: config.sections
  };
}

// Generate custom report
function generateCustomReport(dateRange: { start: string; end: string }, config: ReportConfig): any {
  return {
    type: 'custom',
    dateRange,
    sections: config.sections
  };
}

// Get all generated reports
export function getGeneratedReports(): GeneratedReport[] {
  try {
    const data = localStorage.getItem(GENERATED_REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load generated reports:', error);
    return [];
  }
}

// Get generated reports for a specific report
export function getGeneratedReportsForReport(reportId: string): GeneratedReport[] {
  return getGeneratedReports().filter(gr => gr.reportId === reportId);
}

// Delete generated report
export function deleteGeneratedReport(generatedId: string): void {
  const reports = getGeneratedReports().filter(gr => gr.id !== generatedId);
  localStorage.setItem(GENERATED_REPORTS_KEY, JSON.stringify(reports));
}

// Export generated report
export function exportGeneratedReport(generatedId: string): string | null {
  const report = getGeneratedReports().find(gr => gr.id === generatedId);
  if (!report) return null;
  
  switch (report.format) {
    case 'json':
      return JSON.stringify(report.data, null, 2);
    case 'csv':
      return convertToCSV(report.data);
    case 'html':
      return convertToHTML(report.data);
    case 'pdf':
      return convertToPDF(report.data);
    default:
      return JSON.stringify(report.data, null, 2);
  }
}

// Convert data to CSV
function convertToCSV(data: any): string {
  // Simple CSV conversion - would need more sophisticated implementation for complex data
  if (Array.isArray(data)) {
    const headers = Object.keys(data[0] || {});
    const rows = data.map(item => headers.map(h => item[h]).join(','));
    return [headers.join(','), ...rows].join('\n');
  }
  return JSON.stringify(data);
}

// Convert data to HTML
function convertToHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
  </style>
</head>
<body>
  <h1>Report</h1>
  <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>
  `.trim();
}

// Convert data to PDF (placeholder - would need PDF library)
function convertToPDF(data: any): string {
  return 'PDF export requires a PDF generation library';
}

// Get scheduled reports
export function getScheduledReports(): Report[] {
  return getReports().filter(r => r.schedule && r.schedule.enabled);
}

// Check and run scheduled reports
export function checkAndRunScheduledReports(): void {
  const now = new Date();
  const scheduledReports = getScheduledReports();
  
  scheduledReports.forEach(report => {
    if (!report.schedule) return;
    
    const shouldRun = checkSchedule(report.schedule, now);
    
    if (shouldRun) {
      generateReport(report.id);
      // In a real implementation, this would send emails to recipients
      console.log(`Generated scheduled report: ${report.name}`);
    }
  });
}

// Check if schedule should run
function checkSchedule(schedule: ReportSchedule, now: Date): boolean {
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  if (currentTime !== schedule.time) return false;
  
  switch (schedule.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return now.getDay() === schedule.dayOfWeek;
    case 'monthly':
      return now.getDate() === schedule.dayOfMonth;
    default:
      return false;
  }
}

// Get report statistics
export function getReportStatistics(): {
  totalReports: number;
  reportsByType: Record<string, number>;
  scheduledReports: number;
  totalGenerated: number;
} {
  const reports = getReports();
  const generated = getGeneratedReports();
  
  const reportsByType: Record<string, number> = {};
  reports.forEach(report => {
    reportsByType[report.type] = (reportsByType[report.type] || 0) + 1;
  });
  
  return {
    totalReports: reports.length,
    reportsByType,
    scheduledReports: reports.filter(r => r.schedule && r.schedule.enabled).length,
    totalGenerated: generated.length
  };
}

// Create default report templates
export function createDefaultReportTemplates(): void {
  const templates = [
    {
      name: 'Weekly Analytics Summary',
      description: 'Overview of analytics metrics for the past week',
      type: 'analytics' as const,
      config: {
        dateRange: { type: 'last_7_days' as const },
        sections: [
          { id: '1', type: 'summary' as const, title: 'Summary', config: {}, order: 0 },
          { id: '2', type: 'metrics' as const, title: 'Key Metrics', config: {}, order: 1 },
          { id: '3', type: 'charts' as const, title: 'Trends', config: {}, order: 2 }
        ],
        format: 'pdf' as const,
        includeCharts: true,
        includeInsights: true
      },
      schedule: {
        frequency: 'weekly' as const,
        dayOfWeek: 1, // Monday
        time: '09:00',
        recipients: [],
        enabled: false
      }
    },
    {
      name: 'Monthly Conversion Report',
      description: 'Detailed conversion analysis for the past month',
      type: 'conversions' as const,
      config: {
        dateRange: { type: 'last_30_days' as const },
        sections: [
          { id: '1', type: 'summary' as const, title: 'Summary', config: {}, order: 0 },
          { id: '2', type: 'metrics' as const, title: 'Conversion Metrics', config: {}, order: 1 },
          { id: '3', type: 'insights' as const, title: 'Insights', config: {}, order: 2 }
        ],
        format: 'pdf' as const,
        includeCharts: true,
        includeInsights: true
      },
      schedule: {
        frequency: 'monthly' as const,
        dayOfMonth: 1,
        time: '09:00',
        recipients: [],
        enabled: false
      }
    }
  ];
  
  templates.forEach(template => {
    createReport(template.name, template.description, template.type, template.config, template.schedule);
  });
}
