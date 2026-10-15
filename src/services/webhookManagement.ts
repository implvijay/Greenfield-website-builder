// Webhook Management Service

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  failureCount: number;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
}

const WEBHOOKS_KEY = 'greenfield_webhooks';
const WEBHOOK_LOG_KEY = 'greenfield_webhook_log';

// Create webhook
export function createWebhook(
  name: string,
  url: string,
  events: string[],
  secret?: string
): Webhook {
  const webhooks = getWebhooks();
  const webhook: Webhook = {
    id: crypto.randomUUID(),
    name,
    url,
    events,
    secret,
    active: true,
    createdAt: new Date().toISOString(),
    failureCount: 0
  };
  
  webhooks.push(webhook);
  localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(webhooks));
  
  return webhook;
}

// Get all webhooks
export function getWebhooks(): Webhook[] {
  try {
    const data = localStorage.getItem(WEBHOOKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load webhooks:', error);
    return [];
  }
}

// Get webhook by ID
export function getWebhookById(webhookId: string): Webhook | undefined {
  return getWebhooks().find(w => w.id === webhookId);
}

// Update webhook
export function updateWebhook(webhookId: string, updates: Partial<Webhook>): Webhook | null {
  const webhooks = getWebhooks();
  const index = webhooks.findIndex(w => w.id === webhookId);
  
  if (index === -1) return null;
  
  webhooks[index] = { ...webhooks[index], ...updates };
  localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(webhooks));
  
  return webhooks[index];
}

// Delete webhook
export function deleteWebhook(webhookId: string): void {
  const webhooks = getWebhooks().filter(w => w.id !== webhookId);
  localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(webhooks));
}

// Trigger webhook
export async function triggerWebhook(webhookId: string, payload: WebhookPayload): Promise<boolean> {
  const webhook = getWebhookById(webhookId);
  if (!webhook || !webhook.active) return false;
  
  if (!webhook.events.includes(payload.event) && !webhook.events.includes('*')) {
    return false;
  }
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add signature if secret is provided
    if (webhook.secret) {
      const signature = await generateSignature(payload, webhook.secret);
      headers['X-Webhook-Signature'] = signature;
    }
    
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    // Update last triggered
    updateWebhook(webhookId, { lastTriggered: new Date().toISOString() });
    
    // Log the trigger
    logWebhookTrigger(webhookId, payload.event, response.ok, response.status);
    
    if (!response.ok) {
      // Increment failure count
      const webhook = getWebhookById(webhookId);
      if (webhook) {
        updateWebhook(webhookId, { failureCount: webhook.failureCount + 1 });
      }
    }
    
    return response.ok;
  } catch (error) {
    console.error('Webhook trigger failed:', error);
    logWebhookTrigger(webhookId, payload.event, false, 0, String(error));
    
    // Increment failure count
    const webhook = getWebhookById(webhookId);
    if (webhook) {
      updateWebhook(webhookId, { failureCount: webhook.failureCount + 1 });
    }
    
    return false;
  }
}

// Generate signature for webhook payload
async function generateSignature(payload: WebhookPayload, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const keyData = encoder.encode(secret);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Webhook log entry
interface WebhookLogEntry {
  id: string;
  webhookId: string;
  event: string;
  success: boolean;
  status: number;
  error?: string;
  timestamp: string;
}

// Log webhook trigger
function logWebhookTrigger(
  webhookId: string,
  event: string,
  success: boolean,
  status: number,
  error?: string
): void {
  const logs = getWebhookLogs();
  const entry: WebhookLogEntry = {
    id: crypto.randomUUID(),
    webhookId,
    event,
    success,
    status,
    error,
    timestamp: new Date().toISOString()
  };
  
  logs.unshift(entry);
  
  // Keep only last 500 logs
  const trimmed = logs.slice(0, 500);
  localStorage.setItem(WEBHOOK_LOG_KEY, JSON.stringify(trimmed));
}

// Get webhook logs
export function getWebhookLogs(): WebhookLogEntry[] {
  try {
    const data = localStorage.getItem(WEBHOOK_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load webhook logs:', error);
    return [];
  }
}

// Get logs for specific webhook
export function getLogsForWebhook(webhookId: string): WebhookLogEntry[] {
  return getWebhookLogs().filter(log => log.webhookId === webhookId);
}

// Clear webhook logs
export function clearWebhookLogs(): void {
  localStorage.removeItem(WEBHOOK_LOG_KEY);
}

// Get webhook statistics
export function getWebhookStatistics(): {
  totalWebhooks: number;
  activeWebhooks: number;
  totalTriggers: number;
  successRate: number;
  totalFailures: number;
} {
  const webhooks = getWebhooks();
  const logs = getWebhookLogs();
  
  const activeWebhooks = webhooks.filter(w => w.active).length;
  const successfulTriggers = logs.filter(l => l.success).length;
  const successRate = logs.length > 0 ? (successfulTriggers / logs.length) * 100 : 0;
  const totalFailures = webhooks.reduce((sum, w) => sum + w.failureCount, 0);
  
  return {
    totalWebhooks: webhooks.length,
    activeWebhooks,
    totalTriggers: logs.length,
    successRate,
    totalFailures
  };
}

// Predefined webhook events
export const WEBHOOK_EVENTS = [
  { value: '*', label: 'All Events' },
  { value: 'page.created', label: 'Page Created' },
  { value: 'page.updated', label: 'Page Updated' },
  { value: 'page.deleted', label: 'Page Deleted' },
  { value: 'page.published', label: 'Page Published' },
  { value: 'section.created', label: 'Section Created' },
  { value: 'section.updated', label: 'Section Updated' },
  { value: 'section.deleted', label: 'Section Deleted' },
  { value: 'component.created', label: 'Component Created' },
  { value: 'component.updated', label: 'Component Updated' },
  { value: 'component.deleted', label: 'Component Deleted' },
  { value: 'project.exported', label: 'Project Exported' },
  { value: 'conversion.recorded', label: 'Conversion Recorded' },
  { value: 'ab_test.completed', label: 'A/B Test Completed' }
];

// Test webhook
export async function testWebhook(webhookId: string): Promise<boolean> {
  const testPayload: WebhookPayload = {
    event: 'test',
    data: { message: 'This is a test webhook payload' },
    timestamp: new Date().toISOString()
  };
  
  return triggerWebhook(webhookId, testPayload);
}
