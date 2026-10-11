// Business Intelligence Service

import { getAnalyticsEvents, getEventStatistics } from './analyticsQuery';
import { getABTests, getABTestAnalysis } from './abTesting';
import { getConversionGoals, getConversionStatistics, getConversionFunnels, analyzeConversionFunnel } from './conversionTracking';
import { getAllHeatmapSummaries } from './heatmapTracking';

export interface BusinessInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'info';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  metrics?: Record<string, any>;
  timestamp: string;
}

export interface BusinessReport {
  id: string;
  name: string;
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  insights: BusinessInsight[];
  summary: {
    totalInsights: number;
    highImpact: number;
    mediumImpact: number;
    lowImpact: number;
  };
}

// Generate business insights
export function generateBusinessInsights(startDate: string, endDate: string): BusinessInsight[] {
  const insights: BusinessInsight[] = [];
  
  // Analytics insights
  insights.push(...generateAnalyticsInsights(startDate, endDate));
  
  // A/B test insights
  insights.push(...generateABTestInsights());
  
  // Conversion insights
  insights.push(...generateConversionInsights(startDate, endDate));
  
  // Heatmap insights
  insights.push(...generateHeatmapInsights());
  
  return insights;
}

// Generate analytics insights
function generateAnalyticsInsights(startDate: string, endDate: string): BusinessInsight[] {
  const insights: BusinessInsight[] = [];
  const stats = getEventStatistics();
  
  // Check for low engagement
  if (stats.totalEvents < 100) {
    insights.push({
      id: crypto.randomUUID(),
      type: 'warning',
      category: 'Engagement',
      title: 'Low User Engagement',
      description: `Only ${stats.totalEvents} events recorded in the selected period.`,
      impact: 'high',
      recommendation: 'Consider improving content quality and user experience to increase engagement.',
      metrics: { totalEvents: stats.totalEvents },
      timestamp: new Date().toISOString()
    });
  }
  
  // Check for top performing pages
  if (stats.topPages.length > 0) {
    const topPage = stats.topPages[0];
    insights.push({
      id: crypto.randomUUID(),
      type: 'success',
      category: 'Performance',
      title: 'Top Performing Page Identified',
      description: `Page ${topPage.pageId} has the highest engagement with ${topPage.count} events.`,
      impact: 'medium',
      recommendation: 'Analyze what makes this page successful and apply learnings to other pages.',
      metrics: { pageId: topPage.pageId, eventCount: topPage.count },
      timestamp: new Date().toISOString()
    });
  }
  
  return insights;
}

// Generate A/B test insights
function generateABTestInsights(): BusinessInsight[] {
  const insights: BusinessInsight[] = [];
  const tests = getABTests();
  
  tests.forEach(test => {
    if (test.status === 'running' || test.status === 'completed') {
      const analysis = getABTestAnalysis(test.id);
      
      if (analysis.winner && analysis.confidence && analysis.confidence > 95) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'success',
          category: 'A/B Testing',
          title: `Winning Variant Found: ${test.name}`,
          description: `Variant "${analysis.winner.name}" is outperforming with ${analysis.confidence.toFixed(1)}% confidence.`,
          impact: 'high',
          recommendation: `Consider implementing the winning variant "${analysis.winner.name}" permanently.`,
          metrics: { 
            testId: test.id, 
            winnerId: analysis.winner.id,
            confidence: analysis.confidence 
          },
          timestamp: new Date().toISOString()
        });
      } else if (test.status === 'running') {
        const results = analysis.results;
        const totalImpressions = results.reduce((sum, r) => sum + r.impressions, 0);
        
        if (totalImpressions < 100) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'info',
            category: 'A/B Testing',
            title: `A/B Test Needs More Data: ${test.name}`,
            description: `Only ${totalImpressions} impressions recorded. Need more data for statistical significance.`,
            impact: 'medium',
            recommendation: 'Continue running the test until you reach at least 100 impressions per variant.',
            metrics: { testId: test.id, totalImpressions },
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  });
  
  return insights;
}

// Generate conversion insights
function generateConversionInsights(startDate: string, endDate: string): BusinessInsight[] {
  const insights: BusinessInsight[] = [];
  const stats = getConversionStatistics(startDate, endDate);
  const funnels = getConversionFunnels();
  
  // Check conversion rate
  if (stats.totalConversions === 0) {
    insights.push({
      id: crypto.randomUUID(),
      type: 'warning',
      category: 'Conversions',
      title: 'No Conversions Recorded',
      description: 'No conversions were recorded in the selected period.',
      impact: 'high',
      recommendation: 'Review your conversion goals and ensure they are properly configured.',
      metrics: { totalConversions: 0 },
      timestamp: new Date().toISOString()
    });
  } else if (stats.averageValue > 0) {
    insights.push({
      id: crypto.randomUUID(),
      type: 'success',
      category: 'Revenue',
      title: 'Revenue Generated',
      description: `Generated ${stats.totalValue.toFixed(2)} ${stats.totalConversions} conversions with average value of ${stats.averageValue.toFixed(2)}.`,
      impact: 'high',
      recommendation: 'Continue optimizing conversion funnels to increase revenue.',
      metrics: { 
        totalValue: stats.totalValue, 
        totalConversions: stats.totalConversions,
        averageValue: stats.averageValue 
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Analyze funnels
  funnels.forEach(funnel => {
    const analysis = analyzeConversionFunnel(funnel.id, startDate, endDate);
    
    if (analysis.overallConversionRate < 10) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'warning',
        category: 'Funnel Optimization',
        title: `Low Funnel Conversion: ${funnel.name}`,
        description: `Funnel "${funnel.name}" has only ${analysis.overallConversionRate.toFixed(1)}% overall conversion rate.`,
        impact: 'high',
        recommendation: 'Identify and optimize steps with high drop-off rates.',
        metrics: { 
          funnelId: funnel.id, 
          conversionRate: analysis.overallConversionRate,
          totalEntries: analysis.totalEntries 
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Find step with highest drop-off
    const highestDropOff = analysis.stepData.reduce((max, step) => 
      step.dropOffRate > max.dropOffRate ? step : max, analysis.stepData[0]);
    
    if (highestDropOff && highestDropOff.dropOffRate > 50) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'opportunity',
        category: 'Funnel Optimization',
        title: `High Drop-off at "${highestDropOff.stepName}"`,
        description: `Step "${highestDropOff.stepName}" has ${highestDropOff.dropOffRate.toFixed(1)}% drop-off rate.`,
        impact: 'high',
        recommendation: `Optimize the "${highestDropOff.stepName}" step to reduce friction and improve conversion.`,
        metrics: { 
          stepId: highestDropOff.stepId,
          stepName: highestDropOff.stepName,
          dropOffRate: highestDropOff.dropOffRate 
        },
        timestamp: new Date().toISOString()
      });
    }
  });
  
  return insights;
}

// Generate heatmap insights
function generateHeatmapInsights(): BusinessInsight[] {
  const insights: BusinessInsight[] = [];
  const summaries = getAllHeatmapSummaries();
  
  summaries.forEach(summary => {
    if (summary.totalClicks === 0) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'info',
        category: 'User Interaction',
        title: 'No Click Data Available',
        description: `Page ${summary.pageId} has no click data recorded.`,
        impact: 'low',
        recommendation: 'Enable heatmap tracking to collect user interaction data.',
        metrics: { pageId: summary.pageId },
        timestamp: new Date().toISOString()
      });
    } else if (summary.totalClicks > 100) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'success',
        category: 'User Interaction',
        title: 'High Engagement Page',
        description: `Page ${summary.pageId} has ${summary.totalClicks} clicks recorded.`,
        impact: 'medium',
        recommendation: 'Analyze heatmap data to understand user behavior and optimize layout.',
        metrics: { 
          pageId: summary.pageId, 
          totalClicks: summary.totalClicks 
        },
        timestamp: new Date().toISOString()
      });
    }
  });
  
  return insights;
}

// Generate business report
export function generateBusinessReport(
  name: string,
  startDate: string,
  endDate: string
): BusinessReport {
  const insights = generateBusinessInsights(startDate, endDate);
  
  const summary = {
    totalInsights: insights.length,
    highImpact: insights.filter(i => i.impact === 'high').length,
    mediumImpact: insights.filter(i => i.impact === 'medium').length,
    lowImpact: insights.filter(i => i.impact === 'low').length
  };
  
  return {
    id: crypto.randomUUID(),
    name,
    generatedAt: new Date().toISOString(),
    period: { start: startDate, end: endDate },
    insights,
    summary
  };
}

// Get key performance indicators
export function getKPIs(startDate: string, endDate: string): {
  engagement: {
    totalEvents: number;
    uniqueUsers: number;
    averageEventsPerUser: number;
  };
  conversions: {
    totalConversions: number;
    conversionRate: number;
    totalValue: number;
    averageValue: number;
  };
  abTests: {
    activeTests: number;
    completedTests: number;
    winningVariants: number;
  };
  pages: {
    totalPages: number;
    highEngagementPages: number;
    lowEngagementPages: number;
  };
} {
  const eventStats = getEventStatistics();
  const conversionStats = getConversionStatistics(startDate, endDate);
  const tests = getABTests();
  const heatmapSummaries = getAllHeatmapSummaries();
  
  const activeTests = tests.filter(t => t.status === 'running').length;
  const completedTests = tests.filter(t => t.status === 'completed').length;
  const winningVariants = tests.filter(t => {
    if (t.status !== 'completed') return false;
    const analysis = getABTestAnalysis(t.id);
    return analysis.winner !== undefined;
  }).length;
  
  const highEngagementPages = heatmapSummaries.filter(s => s.totalClicks > 50).length;
  const lowEngagementPages = heatmapSummaries.filter(s => s.totalClicks < 10).length;
  
  return {
    engagement: {
      totalEvents: eventStats.totalEvents,
      uniqueUsers: eventStats.topUsers.length,
      averageEventsPerUser: eventStats.topUsers.length > 0 
        ? eventStats.totalEvents / eventStats.topUsers.length 
        : 0
    },
    conversions: {
      totalConversions: conversionStats.totalConversions,
      conversionRate: eventStats.totalEvents > 0 
        ? (conversionStats.totalConversions / eventStats.totalEvents) * 100 
        : 0,
      totalValue: conversionStats.totalValue,
      averageValue: conversionStats.averageValue
    },
    abTests: {
      activeTests,
      completedTests,
      winningVariants
    },
    pages: {
      totalPages: heatmapSummaries.length,
      highEngagementPages,
      lowEngagementPages
    }
  };
}

// Export business report
export function exportBusinessReport(report: BusinessReport, format: 'json' | 'pdf'): string {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }
  
  // Generate HTML for PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${report.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        .insight { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .high { border-left: 4px solid #ef4444; }
        .medium { border-left: 4px solid #f59e0b; }
        .low { border-left: 4px solid #3b82f6; }
        .summary { background: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>${report.name}</h1>
      <p>Generated: ${new Date(report.generatedAt).toLocaleString()}</p>
      <p>Period: ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}</p>
      
      <div class="summary">
        <h2>Summary</h2>
        <p>Total Insights: ${report.summary.totalInsights}</p>
        <p>High Impact: ${report.summary.highImpact}</p>
        <p>Medium Impact: ${report.summary.mediumImpact}</p>
        <p>Low Impact: ${report.summary.lowImpact}</p>
      </div>
      
      <h2>Insights</h2>
      ${report.insights.map(insight => `
        <div class="insight ${insight.impact}">
          <h3>${insight.title}</h3>
          <p><strong>Category:</strong> ${insight.category}</p>
          <p><strong>Type:</strong> ${insight.type}</p>
          <p>${insight.description}</p>
          <p><strong>Recommendation:</strong> ${insight.recommendation}</p>
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  return html;
}
