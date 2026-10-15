// Conversion Tracking Service

export interface ConversionGoal {
  id: string;
  name: string;
  description: string;
  type: 'page_view' | 'click' | 'form_submit' | 'purchase' | 'signup' | 'custom';
  condition: {
    pageId?: string;
    elementId?: string;
    eventType?: string;
    customCondition?: string;
  };
  value?: number;
  currency?: string;
  createdAt: string;
}

export interface Conversion {
  id: string;
  goalId: string;
  userId?: string;
  sessionId: string;
  pageId: string;
  timestamp: string;
  value?: number;
  properties: Record<string, any>;
}

export interface ConversionFunnel {
  id: string;
  name: string;
  description: string;
  steps: ConversionFunnelStep[];
  createdAt: string;
}

export interface ConversionFunnelStep {
  id: string;
  name: string;
  goalId: string;
  order: number;
}

export interface FunnelAnalysis {
  funnelId: string;
  totalEntries: number;
  stepData: Array<{
    stepId: string;
    stepName: string;
    users: number;
    conversionRate: number;
    dropOffRate: number;
  }>;
  overallConversionRate: number;
}

const GOALS_KEY = 'greenfield_conversion_goals';
const CONVERSIONS_KEY = 'greenfield_conversions';
const FUNNELS_KEY = 'greenfield_conversion_funnels';

// Create conversion goal
export function createConversionGoal(
  name: string,
  description: string,
  type: ConversionGoal['type'],
  condition: ConversionGoal['condition'],
  value?: number,
  currency?: string
): ConversionGoal {
  const goals = getConversionGoals();
  const goal: ConversionGoal = {
    id: crypto.randomUUID(),
    name,
    description,
    type,
    condition,
    value,
    currency,
    createdAt: new Date().toISOString()
  };
  
  goals.push(goal);
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  
  return goal;
}

// Get all conversion goals
export function getConversionGoals(): ConversionGoal[] {
  try {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load conversion goals:', error);
    return [];
  }
}

// Get conversion goal by ID
export function getConversionGoalById(goalId: string): ConversionGoal | undefined {
  return getConversionGoals().find(g => g.id === goalId);
}

// Update conversion goal
export function updateConversionGoal(goalId: string, updates: Partial<ConversionGoal>): ConversionGoal | null {
  const goals = getConversionGoals();
  const index = goals.findIndex(g => g.id === goalId);
  
  if (index === -1) return null;
  
  goals[index] = { ...goals[index], ...updates };
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  
  return goals[index];
}

// Delete conversion goal
export function deleteConversionGoal(goalId: string): void {
  const goals = getConversionGoals().filter(g => g.id !== goalId);
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  
  // Also delete related conversions
  const conversions = getConversions().filter(c => c.goalId !== goalId);
  localStorage.setItem(CONVERSIONS_KEY, JSON.stringify(conversions));
}

// Record conversion
export function recordConversion(
  goalId: string,
  pageId: string,
  properties: Record<string, any> = {},
  userId?: string,
  value?: number
): Conversion {
  const conversions = getConversions();
  const conversion: Conversion = {
    id: crypto.randomUUID(),
    goalId,
    userId,
    sessionId: getSessionId(),
    pageId,
    timestamp: new Date().toISOString(),
    value,
    properties
  };
  
  conversions.push(conversion);
  localStorage.setItem(CONVERSIONS_KEY, JSON.stringify(conversions));
  
  return conversion;
}

// Get all conversions
export function getConversions(): Conversion[] {
  try {
    const data = localStorage.getItem(CONVERSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load conversions:', error);
    return [];
  }
}

// Get conversions by goal
export function getConversionsByGoal(goalId: string): Conversion[] {
  return getConversions().filter(c => c.goalId === goalId);
}

// Get conversions by date range
export function getConversionsByDateRange(startDate: string, endDate: string): Conversion[] {
  const conversions = getConversions();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return conversions.filter(c => {
    const date = new Date(c.timestamp);
    return date >= start && date <= end;
  });
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

// Create conversion funnel
export function createConversionFunnel(
  name: string,
  description: string,
  steps: Omit<ConversionFunnelStep, 'id'>[]
): ConversionFunnel {
  const funnels = getConversionFunnels();
  const funnel: ConversionFunnel = {
    id: crypto.randomUUID(),
    name,
    description,
    steps: steps.map(s => ({ ...s, id: crypto.randomUUID() })),
    createdAt: new Date().toISOString()
  };
  
  funnels.push(funnel);
  localStorage.setItem(FUNNELS_KEY, JSON.stringify(funnels));
  
  return funnel;
}

// Get all conversion funnels
export function getConversionFunnels(): ConversionFunnel[] {
  try {
    const data = localStorage.getItem(FUNNELS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load conversion funnels:', error);
    return [];
  }
}

// Get conversion funnel by ID
export function getConversionFunnelById(funnelId: string): ConversionFunnel | undefined {
  return getConversionFunnels().find(f => f.id === funnelId);
}

// Update conversion funnel
export function updateConversionFunnel(funnelId: string, updates: Partial<ConversionFunnel>): ConversionFunnel | null {
  const funnels = getConversionFunnels();
  const index = funnels.findIndex(f => f.id === funnelId);
  
  if (index === -1) return null;
  
  funnels[index] = { ...funnels[index], ...updates };
  localStorage.setItem(FUNNELS_KEY, JSON.stringify(funnels));
  
  return funnels[index];
}

// Delete conversion funnel
export function deleteConversionFunnel(funnelId: string): void {
  const funnels = getConversionFunnels().filter(f => f.id !== funnelId);
  localStorage.setItem(FUNNELS_KEY, JSON.stringify(funnels));
}

// Analyze conversion funnel
export function analyzeConversionFunnel(
  funnelId: string,
  startDate: string,
  endDate: string
): FunnelAnalysis {
  const funnel = getConversionFunnelById(funnelId);
  if (!funnel) throw new Error('Funnel not found');
  
  const conversions = getConversionsByDateRange(startDate, endDate);
  
  // Get unique users who entered the funnel (completed first step)
  const firstStepGoalId = funnel.steps[0]?.goalId;
  const firstStepConversions = conversions.filter(c => c.goalId === firstStepGoalId);
  const uniqueUsers = new Set(firstStepConversions.map(c => c.sessionId));
  const totalEntries = uniqueUsers.size;
  
  // Analyze each step
  const stepData = funnel.steps.map((step, index) => {
    const stepConversions = conversions.filter(c => c.goalId === step.goalId);
    const stepUsers = new Set(stepConversions.map(c => c.sessionId));
    const users = stepUsers.size;
    
    // Calculate conversion rate from previous step
    let conversionRate = 0;
    let dropOffRate = 0;
    
    if (index === 0) {
      conversionRate = 100; // First step is 100%
      dropOffRate = 0;
    } else {
      const previousStep = funnel.steps[index - 1];
      const previousConversions = conversions.filter(c => c.goalId === previousStep.goalId);
      const previousUsers = new Set(previousConversions.map(c => c.sessionId));
      
      // Find users who completed both previous and current step
      const usersWhoContinued = Array.from(stepUsers).filter(userId => 
        previousUsers.has(userId)
      );
      
      conversionRate = previousUsers.size > 0 
        ? (usersWhoContinued.length / previousUsers.size) * 100 
        : 0;
      
      dropOffRate = 100 - conversionRate;
    }
    
    return {
      stepId: step.id,
      stepName: step.name,
      users,
      conversionRate,
      dropOffRate
    };
  });
  
  // Calculate overall conversion rate
  const lastStep = funnel.steps[funnel.steps.length - 1];
  const lastStepConversions = conversions.filter(c => c.goalId === lastStep?.goalId);
  const lastStepUsers = new Set(lastStepConversions.map(c => c.sessionId));
  const overallConversionRate = totalEntries > 0 
    ? (lastStepUsers.size / totalEntries) * 100 
    : 0;
  
  return {
    funnelId,
    totalEntries,
    stepData,
    overallConversionRate
  };
}

// Get conversion statistics
export function getConversionStatistics(startDate: string, endDate: string): {
  totalConversions: number;
  totalValue: number;
  conversionsByGoal: Record<string, number>;
  conversionsByDay: Record<string, number>;
  averageValue: number;
} {
  const conversions = getConversionsByDateRange(startDate, endDate);
  
  const conversionsByGoal: Record<string, number> = {};
  const conversionsByDay: Record<string, number> = {};
  let totalValue = 0;
  
  conversions.forEach(conversion => {
    // By goal
    conversionsByGoal[conversion.goalId] = (conversionsByGoal[conversion.goalId] || 0) + 1;
    
    // By day
    const day = conversion.timestamp.split('T')[0];
    conversionsByDay[day] = (conversionsByDay[day] || 0) + 1;
    
    // Total value
    if (conversion.value) {
      totalValue += conversion.value;
    }
  });
  
  return {
    totalConversions: conversions.length,
    totalValue,
    conversionsByGoal,
    conversionsByDay,
    averageValue: conversions.length > 0 ? totalValue / conversions.length : 0
  };
}

// Clear all conversion data
export function clearAllConversionData(): void {
  localStorage.removeItem(GOALS_KEY);
  localStorage.removeItem(CONVERSIONS_KEY);
  localStorage.removeItem(FUNNELS_KEY);
}

// Export conversion data
export function exportConversionData(format: 'csv' | 'json'): string {
  const conversions = getConversions();
  
  if (format === 'json') {
    return JSON.stringify(conversions, null, 2);
  }
  
  // CSV format
  const headers = ['id', 'goalId', 'userId', 'sessionId', 'pageId', 'timestamp', 'value', 'properties'];
  const rows = conversions.map(c => [
    c.id,
    c.goalId,
    c.userId || '',
    c.sessionId,
    c.pageId,
    c.timestamp,
    c.value || '',
    JSON.stringify(c.properties)
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}
