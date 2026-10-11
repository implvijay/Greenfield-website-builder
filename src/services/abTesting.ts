// A/B Testing Service

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate?: string;
  endDate?: string;
  variants: ABTestVariant[];
  targetAudience?: string;
  hypothesis: string;
  primaryMetric: string;
  secondaryMetrics?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // Percentage of traffic (0-100)
  config: Record<string, any>; // Variant configuration
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  statisticalSignificance?: number;
}

export interface ABTestAssignment {
  testId: string;
  userId: string;
  variantId: string;
  timestamp: string;
}

const TESTS_KEY = 'greenfield_ab_tests';
const RESULTS_KEY = 'greenfield_ab_results';
const ASSIGNMENTS_KEY = 'greenfield_ab_assignments';

// Create A/B test
export function createABTest(
  name: string,
  description: string,
  hypothesis: string,
  primaryMetric: string,
  variants: Omit<ABTestVariant, 'id'>[]
): ABTest {
  const tests = getABTests();
  const test: ABTest = {
    id: crypto.randomUUID(),
    name,
    description,
    hypothesis,
    primaryMetric,
    status: 'draft',
    variants: variants.map(v => ({ ...v, id: crypto.randomUUID() })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tests.push(test);
  localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
  
  return test;
}

// Get all A/B tests
export function getABTests(): ABTest[] {
  try {
    const data = localStorage.getItem(TESTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load A/B tests:', error);
    return [];
  }
}

// Get A/B test by ID
export function getABTestById(testId: string): ABTest | undefined {
  return getABTests().find(t => t.id === testId);
}

// Update A/B test
export function updateABTest(testId: string, updates: Partial<ABTest>): ABTest | null {
  const tests = getABTests();
  const index = tests.findIndex(t => t.id === testId);
  
  if (index === -1) return null;
  
  tests[index] = {
    ...tests[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
  return tests[index];
}

// Delete A/B test
export function deleteABTest(testId: string): void {
  const tests = getABTests().filter(t => t.id !== testId);
  localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
  
  // Also delete results and assignments
  const results = getABTestResults().filter(r => r.testId !== testId);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  
  const assignments = getABTestAssignments().filter(a => a.testId !== testId);
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

// Start A/B test
export function startABTest(testId: string): ABTest | null {
  return updateABTest(testId, {
    status: 'running',
    startDate: new Date().toISOString()
  });
}

// Pause A/B test
export function pauseABTest(testId: string): ABTest | null {
  return updateABTest(testId, { status: 'paused' });
}

// Complete A/B test
export function completeABTest(testId: string): ABTest | null {
  return updateABTest(testId, {
    status: 'completed',
    endDate: new Date().toISOString()
  });
}

// Assign user to variant
export function assignUserToVariant(testId: string, userId: string): ABTestVariant | null {
  const test = getABTestById(testId);
  if (!test || test.status !== 'running') return null;
  
  // Check if user already assigned
  const assignments = getABTestAssignments();
  const existing = assignments.find(a => a.testId === testId && a.userId === userId);
  
  if (existing) {
    return test.variants.find(v => v.id === existing.variantId) || null;
  }
  
  // Assign based on weights
  const variant = selectVariantByWeight(test.variants);
  if (!variant) return null;
  
  // Save assignment
  assignments.push({
    testId,
    userId,
    variantId: variant.id,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  
  return variant;
}

// Select variant based on weights
function selectVariantByWeight(variants: ABTestVariant[]): ABTestVariant | null {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  if (totalWeight === 0) return null;
  
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  
  for (const variant of variants) {
    cumulative += variant.weight;
    if (random <= cumulative) {
      return variant;
    }
  }
  
  return variants[variants.length - 1];
}

// Get all assignments
export function getABTestAssignments(): ABTestAssignment[] {
  try {
    const data = localStorage.getItem(ASSIGNMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load A/B test assignments:', error);
    return [];
  }
}

// Record impression
export function recordImpression(testId: string, variantId: string): void {
  const results = getABTestResults();
  const existing = results.find(r => r.testId === testId && r.variantId === variantId);
  
  if (existing) {
    existing.impressions++;
    existing.conversionRate = existing.impressions > 0 
      ? (existing.conversions / existing.impressions) * 100 
      : 0;
  } else {
    results.push({
      testId,
      variantId,
      impressions: 1,
      conversions: 0,
      conversionRate: 0
    });
  }
  
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

// Record conversion
export function recordConversion(testId: string, variantId: string): void {
  const results = getABTestResults();
  const existing = results.find(r => r.testId === testId && r.variantId === variantId);
  
  if (existing) {
    existing.conversions++;
    existing.conversionRate = existing.impressions > 0 
      ? (existing.conversions / existing.impressions) * 100 
      : 0;
  } else {
    results.push({
      testId,
      variantId,
      impressions: 0,
      conversions: 1,
      conversionRate: 0
    });
  }
  
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

// Get all results
export function getABTestResults(): ABTestResult[] {
  try {
    const data = localStorage.getItem(RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load A/B test results:', error);
    return [];
  }
}

// Get results for specific test
export function getABTestResultsByTestId(testId: string): ABTestResult[] {
  return getABTestResults().filter(r => r.testId === testId);
}

// Calculate statistical significance (simplified chi-square test)
export function calculateStatisticalSignificance(
  controlImpressions: number,
  controlConversions: number,
  variantImpressions: number,
  variantConversions: number
): number {
  if (controlImpressions === 0 || variantImpressions === 0) return 0;
  
  const controlRate = controlConversions / controlImpressions;
  const variantRate = variantConversions / variantImpressions;
  
  // Simplified significance calculation
  const pooledRate = (controlConversions + variantConversions) / 
                     (controlImpressions + variantImpressions);
  
  const standardError = Math.sqrt(
    pooledRate * (1 - pooledRate) * 
    (1 / controlImpressions + 1 / variantImpressions)
  );
  
  if (standardError === 0) return 0;
  
  const zScore = Math.abs(variantRate - controlRate) / standardError;
  
  // Convert z-score to p-value (simplified)
  const pValue = 1 - Math.exp(-0.5 * zScore * zScore);
  
  return pValue;
}

// Get test analysis
export function getABTestAnalysis(testId: string): {
  test: ABTest;
  results: ABTestResult[];
  winner?: ABTestVariant;
  confidence?: number;
} {
  const test = getABTestById(testId);
  if (!test) throw new Error('Test not found');
  
  const results = getABTestResultsByTestId(testId);
  
  // Find control (first variant)
  const control = results.find(r => r.variantId === test.variants[0].id);
  if (!control) {
    return { test, results };
  }
  
  // Find best variant
  let bestVariant = test.variants[0];
  let bestRate = control.conversionRate;
  let confidence = 0;
  
  for (let i = 1; i < test.variants.length; i++) {
    const variant = test.variants[i];
    const result = results.find(r => r.variantId === variant.id);
    
    if (result && result.conversionRate > bestRate) {
      const significance = calculateStatisticalSignificance(
        control.impressions,
        control.conversions,
        result.impressions,
        result.conversions
      );
      
      if (significance > 0.95) { // 95% confidence
        bestVariant = variant;
        bestRate = result.conversionRate;
        confidence = significance;
      }
    }
  }
  
  return {
    test,
    results,
    winner: confidence > 0 ? bestVariant : undefined,
    confidence: confidence * 100
  };
}

// Clear all A/B test data
export function clearAllABTestData(): void {
  localStorage.removeItem(TESTS_KEY);
  localStorage.removeItem(RESULTS_KEY);
  localStorage.removeItem(ASSIGNMENTS_KEY);
}
