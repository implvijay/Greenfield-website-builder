// Performance monitoring service

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  category: 'load' | 'interaction' | 'render' | 'network';
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  bundleSize: {
    total: number;
    javascript: number;
    css: number;
    images: number;
  };
  loadTimes: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    timeToInteractive: number;
    domContentLoaded: number;
    loadComplete: number;
  };
  memoryUsage: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
  recommendations: string[];
}

const STORAGE_KEY = 'greenfield_performance_metrics';

// Record performance metric
export function recordPerformanceMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
  const metrics = getPerformanceMetrics();
  metrics.push({
    ...metric,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 1000 metrics
  const trimmed = metrics.slice(-1000);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

// Get all performance metrics
export function getPerformanceMetrics(): PerformanceMetric[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load performance metrics:', error);
    return [];
  }
}

// Clear performance metrics
export function clearPerformanceMetrics(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Collect current performance data
export function collectPerformanceData(): PerformanceReport {
  const metrics = getPerformanceMetrics();
  
  // Get bundle size from performance entries
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const bundleSize = {
    total: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
    javascript: resources.filter(r => r.initiatorType === 'script').reduce((sum, r) => sum + (r.transferSize || 0), 0),
    css: resources.filter(r => r.initiatorType === 'link' || r.name.endsWith('.css')).reduce((sum, r) => sum + (r.transferSize || 0), 0),
    images: resources.filter(r => r.initiatorType === 'img').reduce((sum, r) => sum + (r.transferSize || 0), 0),
  };
  
  // Get load times from navigation timing
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const loadTimes = {
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    timeToInteractive: navigation?.domInteractive || 0,
    domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
    loadComplete: navigation?.loadEventEnd || 0,
  };
  
  // Try to get paint timing
  const paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach(entry => {
    if (entry.name === 'first-contentful-paint') {
      loadTimes.firstContentfulPaint = entry.startTime;
    }
  });
  
  // Get memory usage (Chrome only)
  const memoryUsage = {
    jsHeapSizeLimit: 0,
    totalJSHeapSize: 0,
    usedJSHeapSize: 0,
  };
  
  if ((performance as any).memory) {
    memoryUsage.jsHeapSizeLimit = (performance as any).memory.jsHeapSizeLimit;
    memoryUsage.totalJSHeapSize = (performance as any).memory.totalJSHeapSize;
    memoryUsage.usedJSHeapSize = (performance as any).memory.usedJSHeapSize;
  }
  
  // Generate recommendations
  const recommendations = generateRecommendations(bundleSize, loadTimes, memoryUsage);
  
  return {
    metrics,
    bundleSize,
    loadTimes,
    memoryUsage,
    recommendations
  };
}

// Generate performance recommendations
function generateRecommendations(
  bundleSize: PerformanceReport['bundleSize'],
  loadTimes: PerformanceReport['loadTimes'],
  memoryUsage: PerformanceReport['memoryUsage']
): string[] {
  const recommendations: string[] = [];
  
  // Bundle size recommendations
  if (bundleSize.total > 5 * 1024 * 1024) { // 5MB
    recommendations.push('Bundle size is very large (>5MB). Consider code splitting and lazy loading.');
  } else if (bundleSize.total > 2 * 1024 * 1024) { // 2MB
    recommendations.push('Bundle size is large (>2MB). Consider optimizing assets and removing unused code.');
  }
  
  if (bundleSize.javascript > 1 * 1024 * 1024) { // 1MB
    recommendations.push('JavaScript bundle is large (>1MB). Consider tree shaking and code splitting.');
  }
  
  // Load time recommendations
  if (loadTimes.firstContentfulPaint > 2000) { // 2s
    recommendations.push('First Contentful Paint is slow (>2s). Optimize critical rendering path.');
  }
  
  if (loadTimes.timeToInteractive > 5000) { // 5s
    recommendations.push('Time to Interactive is slow (>5s). Reduce JavaScript execution time.');
  }
  
  // Memory recommendations
  if (memoryUsage.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
    recommendations.push('Memory usage is high (>100MB). Check for memory leaks.');
  }
  
  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('Performance looks good! Keep monitoring for regressions.');
  }
  
  return recommendations;
}

// Monitor long tasks
export function monitorLongTasks(callback: (task: PerformanceEntry) => void): () => void {
  if (!('PerformanceObserver' in window)) {
    return () => {};
  }
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      callback(entry);
    });
  });
  
  observer.observe({ entryTypes: ['longtask'] });
  
  return () => observer.disconnect();
}

// Monitor layout shifts
export function monitorLayoutShifts(callback: (shift: PerformanceEntry) => void): () => void {
  if (!('PerformanceObserver' in window)) {
    return () => {};
  }
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      callback(entry);
    });
  });
  
  observer.observe({ entryTypes: ['layout-shift'] });
  
  return () => observer.disconnect();
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// Format milliseconds to human readable
export function formatMilliseconds(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

// Get performance score (0-100)
export function getPerformanceScore(report: PerformanceReport): number {
  let score = 100;
  
  // Deduct for bundle size
  if (report.bundleSize.total > 5 * 1024 * 1024) score -= 30;
  else if (report.bundleSize.total > 2 * 1024 * 1024) score -= 15;
  else if (report.bundleSize.total > 1 * 1024 * 1024) score -= 5;
  
  // Deduct for load times
  if (report.loadTimes.firstContentfulPaint > 3000) score -= 20;
  else if (report.loadTimes.firstContentfulPaint > 2000) score -= 10;
  
  if (report.loadTimes.timeToInteractive > 7000) score -= 20;
  else if (report.loadTimes.timeToInteractive > 5000) score -= 10;
  
  // Deduct for memory
  if (report.memoryUsage.usedJSHeapSize > 200 * 1024 * 1024) score -= 20;
  else if (report.memoryUsage.usedJSHeapSize > 100 * 1024 * 1024) score -= 10;
  
  return Math.max(0, score);
}
