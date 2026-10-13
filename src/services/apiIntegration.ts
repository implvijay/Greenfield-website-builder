// API Integration Service

export interface APIIntegration {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'webhook' | 'custom';
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  authentication: 'none' | 'api_key' | 'bearer' | 'basic';
  createdAt: string;
  lastUsed?: string;
  status: 'active' | 'inactive' | 'error';
}

export interface APIRequest {
  integrationId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface APIResponse {
  success: boolean;
   any;
  status: number;
  error?: string;
  timestamp: string;
  duration: number;
}

const INTEGRATIONS_KEY = 'greenfield_api_integrations';
const API_LOG_KEY = 'greenfield_api_log';

// Create API integration
export function createAPIIntegration(
  name: string,
  type: APIIntegration['type'],
  baseUrl: string,
  authentication: APIIntegration['authentication'],
  apiKey?: string,
  headers?: Record<string, string>
): APIIntegration {
  const integrations = getIntegrations();
  const integration: APIIntegration = {
    id: crypto.randomUUID(),
    name,
    type,
    baseUrl,
    apiKey,
    headers,
    authentication,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  integrations.push(integration);
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
  
  return integration;
}

// Get all integrations
export function getIntegrations(): APIIntegration[] {
  try {
    const data = localStorage.getItem(INTEGRATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load integrations:', error);
    return [];
  }
}

// Get integration by ID
export function getIntegrationById(integrationId: string): APIIntegration | undefined {
  return getIntegrations().find(i => i.id === integrationId);
}

// Update integration
export function updateIntegration(integrationId: string, updates: Partial<APIIntegration>): APIIntegration | null {
  const integrations = getIntegrations();
  const index = integrations.findIndex(i => i.id === integrationId);
  
  if (index === -1) return null;
  
  integrations[index] = { ...integrations[index], ...updates };
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
  
  return integrations[index];
}

// Delete integration
export function deleteIntegration(integrationId: string): void {
  const integrations = getIntegrations().filter(i => i.id !== integrationId);
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
}

// Test integration connection
export async function testIntegration(integrationId: string): Promise<APIResponse> {
  const integration = getIntegrationById(integrationId);
  if (!integration) {
    return {
      success: false,
       null,
      status: 0,
      error: 'Integration not found',
      timestamp: new Date().toISOString(),
      duration: 0
    };
  }
  
  const startTime = Date.now();
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...integration.headers
    };
    
    // Add authentication
    if (integration.authentication === 'api_key' && integration.apiKey) {
      headers['X-API-Key'] = integration.apiKey;
    } else if (integration.authentication === 'bearer' && integration.apiKey) {
      headers['Authorization'] = `Bearer ${integration.apiKey}`;
    } else if (integration.authentication === 'basic' && integration.apiKey) {
      headers['Authorization'] = `Basic ${btoa(integration.apiKey)}`;
    }
    
    const response = await fetch(integration.baseUrl, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    const duration = Date.now() - startTime;
    
    // Update last used
    updateIntegration(integrationId, { 
      lastUsed: new Date().toISOString(),
      status: response.ok ? 'active' : 'error'
    });
    
    // Log the request
    logAPIRequest(integrationId, 'GET', '/', response.ok, response.status, duration);
    
    return {
      success: response.ok,
      data,
      status: response.status,
      timestamp: new Date().toISOString(),
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    updateIntegration(integrationId, { status: 'error' });
    logAPIRequest(integrationId, 'GET', '/', false, 0, duration, String(error));
    
    return {
      success: false,
       null,
      status: 0,
      error: String(error),
      timestamp: new Date().toISOString(),
      duration
    };
  }
}

// Make API request
export async function makeAPIRequest(request: APIRequest): Promise<APIResponse> {
  const integration = getIntegrationById(request.integrationId);
  if (!integration) {
    return {
      success: false,
       null,
      status: 0,
      error: 'Integration not found',
      timestamp: new Date().toISOString(),
      duration: 0
    };
  }
  
  const startTime = Date.now();
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...integration.headers,
      ...request.headers
    };
    
    // Add authentication
    if (integration.authentication === 'api_key' && integration.apiKey) {
      headers['X-API-Key'] = integration.apiKey;
    } else if (integration.authentication === 'bearer' && integration.apiKey) {
      headers['Authorization'] = `Bearer ${integration.apiKey}`;
    } else if (integration.authentication === 'basic' && integration.apiKey) {
      headers['Authorization'] = `Basic ${btoa(integration.apiKey)}`;
    }
    
    const url = `${integration.baseUrl}${request.endpoint}`;
    const options: RequestInit = {
      method: request.method,
      headers,
      timeout: request.timeout || 30000
    };
    
    if (request.body && request.method !== 'GET') {
      options.body = JSON.stringify(request.body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    const duration = Date.now() - startTime;
    
    // Update last used
    updateIntegration(request.integrationId, { 
      lastUsed: new Date().toISOString(),
      status: response.ok ? 'active' : 'error'
    });
    
    // Log the request
    logAPIRequest(request.integrationId, request.method, request.endpoint, response.ok, response.status, duration);
    
    return {
      success: response.ok,
      data,
      status: response.status,
      timestamp: new Date().toISOString(),
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    updateIntegration(request.integrationId, { status: 'error' });
    logAPIRequest(request.integrationId, request.method, request.endpoint, false, 0, duration, String(error));
    
    return {
      success: false,
       null,
      status: 0,
      error: String(error),
      timestamp: new Date().toISOString(),
      duration
    };
  }
}

// API request logging
interface APILogEntry {
  id: string;
  integrationId: string;
  method: string;
  endpoint: string;
  success: boolean;
  status: number;
  duration: number;
  error?: string;
  timestamp: string;
}

function logAPIRequest(
  integrationId: string,
  method: string,
  endpoint: string,
  success: boolean,
  status: number,
  duration: number,
  error?: string
): void {
  const logs = getAPILogs();
  const entry: APILogEntry = {
    id: crypto.randomUUID(),
    integrationId,
    method,
    endpoint,
    success,
    status,
    duration,
    error,
    timestamp: new Date().toISOString()
  };
  
  logs.unshift(entry);
  
  // Keep only last 1000 logs
  const trimmed = logs.slice(0, 1000);
  localStorage.setItem(API_LOG_KEY, JSON.stringify(trimmed));
}

// Get API logs
export function getAPILogs(): APILogEntry[] {
  try {
    const data = localStorage.getItem(API_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load API logs:', error);
    return [];
  }
}

// Get logs for specific integration
export function getLogsForIntegration(integrationId: string): APILogEntry[] {
  return getAPILogs().filter(log => log.integrationId === integrationId);
}

// Clear API logs
export function clearAPILogs(): void {
  localStorage.removeItem(API_LOG_KEY);
}

// Get integration statistics
export function getIntegrationStatistics(): {
  totalIntegrations: number;
  activeIntegrations: number;
  errorIntegrations: number;
  totalRequests: number;
  successRate: number;
  averageDuration: number;
} {
  const integrations = getIntegrations();
  const logs = getAPILogs();
  
  const activeIntegrations = integrations.filter(i => i.status === 'active').length;
  const errorIntegrations = integrations.filter(i => i.status === 'error').length;
  
  const successfulRequests = logs.filter(l => l.success).length;
  const successRate = logs.length > 0 ? (successfulRequests / logs.length) * 100 : 0;
  
  const averageDuration = logs.length > 0 
    ? logs.reduce((sum, l) => sum + l.duration, 0) / logs.length 
    : 0;
  
  return {
    totalIntegrations: integrations.length,
    activeIntegrations,
    errorIntegrations,
    totalRequests: logs.length,
    successRate,
    averageDuration
  };
}

// Predefined integration templates
export const INTEGRATION_TEMPLATES = [
  {
    name: 'Generic REST API',
    type: 'rest' as const,
    description: 'Connect to any REST API endpoint',
    baseUrl: 'https://api.example.com',
    authentication: 'api_key' as const
  },
  {
    name: 'GraphQL API',
    type: 'graphql' as const,
    description: 'Connect to GraphQL endpoints',
    baseUrl: 'https://api.example.com/graphql',
    authentication: 'bearer' as const
  },
  {
    name: 'Webhook Receiver',
    type: 'webhook' as const,
    description: 'Receive webhook notifications',
    baseUrl: 'https://webhook.example.com',
    authentication: 'none' as const
  },
  {
    name: 'Custom Integration',
    type: 'custom' as const,
    description: 'Custom API integration',
    baseUrl: '',
    authentication: 'none' as const
  }
];
