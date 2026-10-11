// Heatmap Tracking Service

export interface HeatmapData {
  pageId: string;
  clicks: HeatmapPoint[];
  scrolls: ScrollDepth[];
  mouseMovements: MouseMovement[];
  viewportWidth: number;
  viewportHeight: number;
  lastUpdated: string;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  timestamp: string;
  userId?: string;
}

export interface ScrollDepth {
  percentage: number;
  timestamp: string;
  userId?: string;
}

export interface MouseMovement {
  x: number;
  y: number;
  timestamp: string;
  userId?: string;
}

const HEATMAP_KEY = 'greenfield_heatmaps';

// Record click
export function recordClick(pageId: string, x: number, y: number, userId?: string): void {
  const heatmap = getHeatmapData(pageId);
  
  heatmap.clicks.push({
    x,
    y,
    timestamp: new Date().toISOString(),
    userId
  });
  
  heatmap.lastUpdated = new Date().toISOString();
  saveHeatmapData(pageId, heatmap);
}

// Record scroll depth
export function recordScrollDepth(pageId: string, percentage: number, userId?: string): void {
  const heatmap = getHeatmapData(pageId);
  
  heatmap.scrolls.push({
    percentage,
    timestamp: new Date().toISOString(),
    userId
  });
  
  heatmap.lastUpdated = new Date().toISOString();
  saveHeatmapData(pageId, heatmap);
}

// Record mouse movement
export function recordMouseMovement(pageId: string, x: number, y: number, userId?: string): void {
  const heatmap = getHeatmapData(pageId);
  
  // Limit mouse movements to prevent data bloat
  if (heatmap.mouseMovements.length < 1000) {
    heatmap.mouseMovements.push({
      x,
      y,
      timestamp: new Date().toISOString(),
      userId
    });
    
    heatmap.lastUpdated = new Date().toISOString();
    saveHeatmapData(pageId, heatmap);
  }
}

// Get heatmap data for a page
export function getHeatmapData(pageId: string): HeatmapData {
  try {
    const data = localStorage.getItem(`${HEATMAP_KEY}_${pageId}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load heatmap data:', error);
  }
  
  return {
    pageId,
    clicks: [],
    scrolls: [],
    mouseMovements: [],
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    lastUpdated: new Date().toISOString()
  };
}

// Save heatmap data
export function saveHeatmapData(pageId: string, data: HeatmapData): void {
  try {
    localStorage.setItem(`${HEATMAP_KEY}_${pageId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save heatmap data:', error);
  }
}

// Clear heatmap data for a page
export function clearHeatmapData(pageId: string): void {
  localStorage.removeItem(`${HEATMAP_KEY}_${pageId}`);
}

// Clear all heatmap data
export function clearAllHeatmapData(): void {
  const keys = Object.keys(localStorage).filter(key => key.startsWith(HEATMAP_KEY));
  keys.forEach(key => localStorage.removeItem(key));
}

// Get heatmap statistics
export function getHeatmapStatistics(pageId: string): {
  totalClicks: number;
  totalScrolls: number;
  totalMouseMovements: number;
  averageScrollDepth: number;
  maxScrollDepth: number;
  hotspots: Array<{ x: number; y: number; intensity: number }>;
} {
  const heatmap = getHeatmapData(pageId);
  
  // Calculate average and max scroll depth
  const scrollDepths = heatmap.scrolls.map(s => s.percentage);
  const averageScrollDepth = scrollDepths.length > 0
    ? scrollDepths.reduce((sum, depth) => sum + depth, 0) / scrollDepths.length
    : 0;
  const maxScrollDepth = scrollDepths.length > 0 ? Math.max(...scrollDepths) : 0;
  
  // Calculate hotspots (areas with most clicks)
  const hotspots = calculateHotspots(heatmap.clicks);
  
  return {
    totalClicks: heatmap.clicks.length,
    totalScrolls: heatmap.scrolls.length,
    totalMouseMovements: heatmap.mouseMovements.length,
    averageScrollDepth,
    maxScrollDepth,
    hotspots
  };
}

// Calculate hotspots using grid-based clustering
function calculateHotspots(clicks: HeatmapPoint[], gridSize: number = 50): Array<{ x: number; y: number; intensity: number }> {
  if (clicks.length === 0) return [];
  
  // Create grid
  const grid: Record<string, number> = {};
  
  clicks.forEach(click => {
    const gridX = Math.floor(click.x / gridSize);
    const gridY = Math.floor(click.y / gridSize);
    const key = `${gridX},${gridY}`;
    
    grid[key] = (grid[key] || 0) + 1;
  });
  
  // Convert to hotspots
  const hotspots = Object.entries(grid)
    .map(([key, count]) => {
      const [gridX, gridY] = key.split(',').map(Number);
      return {
        x: (gridX + 0.5) * gridSize,
        y: (gridY + 0.5) * gridSize,
        intensity: count
      };
    })
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 20); // Top 20 hotspots
  
  // Normalize intensity
  const maxIntensity = hotspots.length > 0 ? hotspots[0].intensity : 1;
  return hotspots.map(h => ({
    ...h,
    intensity: h.intensity / maxIntensity
  }));
}

// Export heatmap data
export function exportHeatmapData(pageId: string, format: 'json' | 'csv'): string {
  const heatmap = getHeatmapData(pageId);
  
  if (format === 'json') {
    return JSON.stringify(heatmap, null, 2);
  }
  
  // CSV format for clicks
  const headers = ['x', 'y', 'timestamp', 'userId'];
  const rows = heatmap.clicks.map(click => [
    click.x,
    click.y,
    click.timestamp,
    click.userId || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

// Generate heatmap visualization data
export function generateHeatmapVisualization(
  pageId: string,
  width: number,
  height: number,
  type: 'click' | 'scroll' | 'mouse' = 'click'
): Array<{ x: number; y: number; intensity: number }> {
  const heatmap = getHeatmapData(pageId);
  
  let points: Array<{ x: number; y: number; timestamp: string }> = [];
  
  switch (type) {
    case 'click':
      points = heatmap.clicks;
      break;
    case 'scroll':
      // For scroll, we'll create points along the y-axis
      points = heatmap.scrolls.map(s => ({
        x: width / 2,
        y: (s.percentage / 100) * height,
        timestamp: s.timestamp
      }));
      break;
    case 'mouse':
      points = heatmap.mouseMovements;
      break;
  }
  
  if (points.length === 0) return [];
  
  // Create grid
  const gridSize = 20;
  const grid: Record<string, number> = {};
  
  points.forEach(point => {
    const gridX = Math.floor(point.x / gridSize);
    const gridY = Math.floor(point.y / gridSize);
    const key = `${gridX},${gridY}`;
    
    grid[key] = (grid[key] || 0) + 1;
  });
  
  // Convert to visualization data
  const visualization = Object.entries(grid)
    .map(([key, count]) => {
      const [gridX, gridY] = key.split(',').map(Number);
      return {
        x: (gridX + 0.5) * gridSize,
        y: (gridY + 0.5) * gridSize,
        intensity: count
      };
    });
  
  // Normalize intensity
  const maxIntensity = Math.max(...visualization.map(v => v.intensity));
  return visualization.map(v => ({
    ...v,
    intensity: maxIntensity > 0 ? v.intensity / maxIntensity : 0
  }));
}

// Get heatmap summary for all pages
export function getAllHeatmapSummaries(): Array<{
  pageId: string;
  totalClicks: number;
  totalScrolls: number;
  lastUpdated: string;
}> {
  const keys = Object.keys(localStorage).filter(key => key.startsWith(HEATMAP_KEY));
  
  return keys.map(key => {
    const pageId = key.replace(`${HEATMAP_KEY}_`, '');
    const heatmap = getHeatmapData(pageId);
    
    return {
      pageId,
      totalClicks: heatmap.clicks.length,
      totalScrolls: heatmap.scrolls.length,
      lastUpdated: heatmap.lastUpdated
    };
  }).sort((a, b) => b.totalClicks - a.totalClicks);
}

// Setup heatmap tracking for a page
export function setupHeatmapTracking(pageId: string): () => void {
  const handleClick = (e: MouseEvent) => {
    recordClick(pageId, e.clientX, e.clientY);
  };
  
  const handleScroll = () => {
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    recordScrollDepth(pageId, scrollPercentage);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    // Throttle mouse movements
    if (Math.random() < 0.1) { // Record 10% of movements
      recordMouseMovement(pageId, e.clientX, e.clientY);
    }
  };
  
  document.addEventListener('click', handleClick);
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('mousemove', handleMouseMove);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('click', handleClick);
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('mousemove', handleMouseMove);
  };
}
