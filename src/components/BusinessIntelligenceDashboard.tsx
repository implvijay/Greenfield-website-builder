import React, { useState, useEffect } from 'react';
import { generateBusinessReport, getKPIs, BusinessReport, BusinessInsight } from '../services/businessIntelligence';
import { TrendingUp, AlertTriangle, CheckCircle, Info, Target, DollarSign, Users, Activity } from 'lucide-react';

interface BusinessIntelligenceDashboardProps {
  startDate: string;
  endDate: string;
}

export const BusinessIntelligenceDashboard: React.FC<BusinessIntelligenceDashboardProps> = ({
  startDate,
  endDate
}) => {
  const [report, setReport] = useState<BusinessReport | null>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [selectedInsight, setSelectedInsight] = useState<BusinessInsight | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = () => {
    const newReport = generateBusinessReport('Business Intelligence Report', startDate, endDate);
    setReport(newReport);
    
    const kpiData = getKPIs(startDate, endDate);
    setKpis(kpiData);
  };

  const filteredInsights = report?.insights.filter(insight => 
    filterType === 'all' || insight.type === filterType
  ) || [];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-gray-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!report || !kpis) {
    return <div className="p-8 text-center">Loading business intelligence data...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Intelligence Dashboard</h1>
        <p className="text-gray-600">
          {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">Total Events</div>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {kpis.engagement.totalEvents.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {kpis.engagement.uniqueUsers} unique users
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">Total Conversions</div>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {kpis.conversions.totalConversions.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {kpis.conversions.conversionRate.toFixed(2)}% conversion rate
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${kpis.conversions.totalValue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            ${kpis.conversions.averageValue.toFixed(2)} avg. value
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">Active A/B Tests</div>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {kpis.abTests.activeTests}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {kpis.abTests.winningVariants} winners found
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Insights</div>
            <div className="text-2xl font-bold text-gray-900">{report.summary.totalInsights}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">High Impact</div>
            <div className="text-2xl font-bold text-red-600">{report.summary.highImpact}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Medium Impact</div>
            <div className="text-2xl font-bold text-yellow-600">{report.summary.mediumImpact}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Low Impact</div>
            <div className="text-2xl font-bold text-blue-600">{report.summary.lowImpact}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({report.insights.length})
        </button>
        <button
          onClick={() => setFilterType('opportunity')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'opportunity'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Opportunities ({report.insights.filter(i => i.type === 'opportunity').length})
        </button>
        <button
          onClick={() => setFilterType('warning')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'warning'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Warnings ({report.insights.filter(i => i.type === 'warning').length})
        </button>
        <button
          onClick={() => setFilterType('success')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Success ({report.insights.filter(i => i.type === 'success').length})
        </button>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No insights found for the selected filter.</p>
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className={`bg-white p-6 rounded-lg shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                selectedInsight?.id === insight.id ? 'border-blue-500' : 'border-gray-200'
              }`}
              onClick={() => setSelectedInsight(selectedInsight?.id === insight.id ? null : insight)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getImpactColor(insight.impact)}`}>
                      {insight.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  
                  {selectedInsight?.id === insight.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Category</div>
                        <div className="text-sm text-gray-600">{insight.category}</div>
                      </div>
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Recommendation</div>
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">{insight.recommendation}</div>
                      </div>
                      {insight.metrics && Object.keys(insight.metrics).length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Metrics</div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(insight.metrics).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-2 rounded">
                                <div className="text-xs text-gray-600">{key}</div>
                                <div className="text-sm font-medium text-gray-900">{String(value)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
