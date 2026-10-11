// Advanced Analytics Query Service

export interface AnalyticsQuery {
  id: string;
  name: string;
  description: string;
  metric: string;
  dimensions: string[];
  filters: AnalyticsFilter[];
  dateRange: {
    start: string;
    end: string;
  };
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
}

export interface AnalyticsFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in';
  value: any;
}

export interface AnalyticsResult {
  queryId: string;
  data: any[];
  total: number;
  timestamp: string;
  executionTime: number;
}

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  eventType: string;
  pageId: string;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
}

const STORAGE_KEY = 'greenfield_analytics_events';
const QUERIES_KEY = 'greenfield_analytics_queries';

// Record analytics event
export function recordAnalyticsEvent(
  eventType: string,
  pageId: string,
  properties: Record<string, any> = {},
  userId?: string
): AnalyticsEvent {
  const events = getAnalyticsEvents();
  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    eventType,
    pageId,
    userId,
    sessionId: getSessionId(),
    properties
  };
  
  events.push(event);
  
  // Keep only last 10000 events
  const trimmed = events.slice(-10000);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  
  return event;
}

// Get all analytics events
export function getAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load analytics events:', error);
    return [];
  }
}

// Clear analytics events
export function clearAnalyticsEvents(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Get session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('greenfield_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('greenfield_session_id', sessionId);
  }
  return sessionId;
}

// Execute analytics query
export function executeAnalyticsQuery(query: AnalyticsQuery): AnalyticsResult {
  const startTime = performance.now();
  const events = getAnalyticsEvents();
  
  // Filter by date range
  let filtered = events.filter(event => {
    const eventDate = new Date(event.timestamp);
    const startDate = new Date(query.dateRange.start);
    const endDate = new Date(query.dateRange.end);
    return eventDate >= startDate && eventDate <= endDate;
  });
  
  // Apply filters
  filtered = applyFilters(filtered, query.filters);
  
  // Group by dimensions
  const grouped = groupByDimensions(filtered, query.dimensions);
  
  // Aggregate
  const aggregated = aggregate(grouped, query.metric, query.aggregation);
  
  // Order
  if (query.orderBy) {
    aggregated.sort((a, b) => {
      const aVal = a[query.orderBy!.field];
      const bVal = b[query.orderBy!.field];
      const modifier = query.orderBy!.direction === 'asc' ? 1 : -1;
      return aVal < bVal ? -1 * modifier : aVal > bVal ? 1 * modifier : 0;
    });
  }
  
  // Limit
  const limited = query.limit ? aggregated.slice(0, query.limit) : aggregated;
  
  const executionTime = performance.now() - startTime;
  
  return {
    queryId: query.id,
    data: limited,
    total: aggregated.length,
    timestamp: new Date().toISOString(),
    executionTime
  };
}

// Apply filters to events
function applyFilters(events: AnalyticsEvent[], filters: AnalyticsFilter[]): AnalyticsEvent[] {
  return events.filter(event => {
    return filters.every(filter => {
      const value = event.properties[filter.field] || event[filter.field as keyof AnalyticsEvent];
      
      switch (filter.operator) {
        case 'equals':
          return value === filter.value;
        case 'not_equals':
          return value !== filter.value;
        case 'contains':
          return String(value).includes(filter.value);
        case 'gt':
          return value > filter.value;
        case 'lt':
          return value < filter.value;
        case 'gte':
          return value >= filter.value;
        case 'lte':
          return value <= filter.value;
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value);
        case 'not_in':
          return Array.isArray(filter.value) && !filter.value.includes(value);
        default:
          return true;
      }
    });
  });
}

// Group events by dimensions
function groupByDimensions(events: AnalyticsEvent[], dimensions: string[]): Record<string, AnalyticsEvent[]> {
  if (dimensions.length === 0) {
    return { 'all': events };
  }
  
  const groups: Record<string, AnalyticsEvent[]> = {};
  
  events.forEach(event => {
    const key = dimensions.map(dim => {
      return event.properties[dim] || event[dim as keyof AnalyticsEvent] || 'unknown';
    }).join('|');
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(event);
  });
  
  return groups;
}

// Aggregate grouped data
function aggregate(
  groups: Record<string, AnalyticsEvent[]>,
  metric: string,
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max'
): any[] {
  return Object.entries(groups).map(([key, events]) => {
    const values = events.map(e => e.properties[metric] || 0);
    const dimensions = key.split('|');
    
    let result: any;
    switch (aggregation) {
      case 'sum':
        result = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'avg':
        result = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
        break;
      case 'count':
        result = events.length;
        break;
      case 'min':
        result = values.length > 0 ? Math.min(...values) : 0;
        break;
      case 'max':
        result = values.length > 0 ? Math.max(...values) : 0;
        break;
    }
    
    const row: any = { value: result, count: events.length };
    dimensions.forEach((dim, index) => {
      row[`dim_${index}`] = dim;
    });
    
    return row;
  });
}

// Save custom query
export function saveAnalyticsQuery(query: Omit<AnalyticsQuery, 'id'>): AnalyticsQuery {
  const queries = getAnalyticsQueries();
  const newQuery: AnalyticsQuery = {
    ...query,
    id: crypto.randomUUID()
  };
  
  queries.push(newQuery);
  localStorage.setItem(QUERIES_KEY, JSON.stringify(queries));
  
  return newQuery;
}

// Get all saved queries
export function getAnalyticsQueries(): AnalyticsQuery[] {
  try {
    const data = localStorage.getItem(QUERIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load analytics queries:', error);
    return [];
  }
}

// Delete saved query
export function deleteAnalyticsQuery(queryId: string): void {
  const queries = getAnalyticsQueries().filter(q => q.id !== queryId);
  localStorage.setItem(QUERIES_KEY, JSON.stringify(queries));
}

// Get common event types
export function getCommonEventTypes(): string[] {
  const events = getAnalyticsEvents();
  const types = new Set(events.map(e => e.eventType));
  return Array.from(types);
}

// Get event statistics
export function getEventStatistics(): {
  totalEvents: number;
  eventTypes: Record<string, number>;
  topPages: Array<{ pageId: string; count: number }>;
  topUsers: Array<{ userId: string; count: number }>;
} {
  const events = getAnalyticsEvents();
  
  const eventTypes: Record<string, number> = {};
  const pageCounts: Record<string, number> = {};
  const userCounts: Record<string, number> = {};
  
  events.forEach(event => {
    eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
    pageCounts[event.pageId] = (pageCounts[event.pageId] || 0) + 1;
    
    if (event.userId) {
      userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
    }
  });
  
  const topPages = Object.entries(pageCounts)
    .map(([pageId, count]) => ({ pageId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  const topUsers = Object.entries(userCounts)
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalEvents: events.length,
    eventTypes,
    topPages,
    topUsers
  };
}

// Export analytics data
export function exportAnalyticsData(format: 'csv' | 'json'): string {
  const events = getAnalyticsEvents();
  
  if (format === 'json') {
    return JSON.stringify(events, null, 2);
  }
  
  // CSV format
  const headers = ['id', 'timestamp', 'eventType', 'pageId', 'userId', 'sessionId', 'properties'];
  const rows = events.map(event => [
    event.id,
    event.timestamp,
    event.eventType,
    event.pageId,
    event.userId || '',
    event.sessionId,
    JSON.stringify(event.properties)
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}
