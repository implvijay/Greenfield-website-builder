// Advanced Visualization Service

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar';
  title: string;
  data: ChartData;
  options: ChartOptions;
  createdAt: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'left' | 'right' | 'bottom';
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: { display?: boolean; text?: string };
    };
    y?: {
      display?: boolean;
      title?: { display?: boolean; text?: string };
      beginAtZero?: boolean;
    };
  };
}

const CHARTS_KEY = 'greenfield_charts';

// Color palettes for charts
export const CHART_COLORS = {
  blue: 'rgb(54, 162, 235)',
  red: 'rgb(255, 99, 132)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  purple: 'rgb(153, 102, 255)',
  orange: 'rgb(255, 159, 64)',
  pink: 'rgb(255, 102, 178)',
  cyan: 'rgb(0, 204, 204)',
};

export const CHART_COLORS_ARRAY = Object.values(CHART_COLORS);

// Create chart configuration
export function createChart(
  type: ChartConfig['type'],
  title: string,
  data: ChartData,
  options: ChartOptions = {}
): ChartConfig {
  const charts = getCharts();
  const chart: ChartConfig = {
    id: crypto.randomUUID(),
    type,
    title,
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...options
    },
    createdAt: new Date().toISOString()
  };
  
  charts.push(chart);
  localStorage.setItem(CHARTS_KEY, JSON.stringify(charts));
  
  return chart;
}

// Get all charts
export function getCharts(): ChartConfig[] {
  try {
    const data = localStorage.getItem(CHARTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load charts:', error);
    return [];
  }
}

// Get chart by ID
export function getChartById(chartId: string): ChartConfig | undefined {
  return getCharts().find(c => c.id === chartId);
}

// Update chart
export function updateChart(chartId: string, updates: Partial<ChartConfig>): ChartConfig | null {
  const charts = getCharts();
  const index = charts.findIndex(c => c.id === chartId);
  
  if (index === -1) return null;
  
  charts[index] = { ...charts[index], ...updates };
  localStorage.setItem(CHARTS_KEY, JSON.stringify(charts));
  
  return charts[index];
}

// Delete chart
export function deleteChart(chartId: string): void {
  const charts = getCharts().filter(c => c.id !== chartId);
  localStorage.setItem(CHARTS_KEY, JSON.stringify(charts));
}

// Generate chart data from analytics events
export function generateChartDataFromEvents(
  events: any[],
  eventType: string,
  dateRange: { start: string; end: string },
  groupBy: 'day' | 'week' | 'month' = 'day'
): ChartData {
  const filteredEvents = events.filter((e: any) => {
    const eventDate = new Date(e.timestamp);
    return e.eventType === eventType &&
           eventDate >= new Date(dateRange.start) &&
           eventDate <= new Date(dateRange.end);
  });
  
  // Group by time period
  const groups: Record<string, number> = {};
  
  filteredEvents.forEach((event: any) => {
    const date = new Date(event.timestamp);
    let key: string;
    
    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    groups[key] = (groups[key] || 0) + 1;
  });
  
  // Sort by date
  const sortedKeys = Object.keys(groups).sort();
  
  return {
    labels: sortedKeys,
    datasets: [{
      label: eventType,
      data: sortedKeys.map(key => groups[key]),
      backgroundColor: CHART_COLORS.blue,
      borderColor: CHART_COLORS.blue,
      borderWidth: 2,
      fill: true
    }]
  };
}

// Generate chart data from conversions
export function generateConversionChartData(
  conversions: any[],
  goalId: string,
  dateRange: { start: string; end: string }
): ChartData {
  const filteredConversions = conversions
    .filter((c: any) => c.goalId === goalId)
    .filter((c: any) => {
      const conversionDate = new Date(c.timestamp);
      return conversionDate >= new Date(dateRange.start) &&
             conversionDate <= new Date(dateRange.end);
    });
  
  // Group by day
  const groups: Record<string, number> = {};
  
  filteredConversions.forEach((conversion: any) => {
    const key = conversion.timestamp.split('T')[0];
    groups[key] = (groups[key] || 0) + 1;
  });
  
  const sortedKeys = Object.keys(groups).sort();
  
  return {
    labels: sortedKeys,
    datasets: [{
      label: 'Conversions',
      data: sortedKeys.map(key => groups[key]),
      backgroundColor: CHART_COLORS.green,
      borderColor: CHART_COLORS.green,
      borderWidth: 2,
      fill: true
    }]
  };
}

// Generate pie chart data from categories
export function generatePieChartData(
  categories: Record<string, number>,
  title: string = 'Distribution'
): ChartData {
  const labels = Object.keys(categories);
  const data = Object.values(categories);
  
  return {
    labels,
    datasets: [{
      label: title,
      data,
      backgroundColor: CHART_COLORS_ARRAY.slice(0, labels.length),
      borderWidth: 1
    }]
  };
}

// Generate comparison chart data
export function generateComparisonChartData(
  datasets: Array<{ label: string; data: number[] }>,
  labels: string[]
): ChartData {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length],
      borderColor: CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length],
      borderWidth: 2
    }))
  };
}

// Export chart configuration
export function exportChartConfig(chartId: string, format: 'json' | 'png' = 'json'): string {
  const chart = getChartById(chartId);
  if (!chart) throw new Error('Chart not found');
  
  if (format === 'json') {
    return JSON.stringify(chart, null, 2);
  }
  
  // For PNG export, we'd need to render the chart to canvas
  // This is a placeholder - actual implementation would use chart rendering library
  return 'PNG export requires chart rendering library';
}

// Import chart configuration
export function importChartConfig(json: string): ChartConfig | null {
  try {
    const chart = JSON.parse(json);
    
    if (!chart.type || !chart.title || !chart.data) {
      return null;
    }
    
    return createChart(chart.type, chart.title, chart.data, chart.options);
  } catch (error) {
    console.error('Failed to import chart:', error);
    return null;
  }
}

// Get chart statistics
export function getChartStatistics(): {
  totalCharts: number;
  chartsByType: Record<string, number>;
  recentCharts: ChartConfig[];
} {
  const charts = getCharts();
  
  const chartsByType: Record<string, number> = {};
  charts.forEach(chart => {
    chartsByType[chart.type] = (chartsByType[chart.type] || 0) + 1;
  });
  
  const recentCharts = [...charts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
  
  return {
    totalCharts: charts.length,
    chartsByType,
    recentCharts
  };
}
