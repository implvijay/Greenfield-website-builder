import React, { useState, useEffect } from 'react';
import { collectPerformanceData, formatBytes, formatMilliseconds, getPerformanceScore } from '../services/performanceMonitoring';
import { Activity, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    const data = collectPerformanceData();
    setPerformanceData(data);
    setScore(getPerformanceScore(data));
  }, []);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (!performanceData) {
    return <div className="p-8 text-center">Loading performance data...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
        <p className="text-gray-600">Monitor and optimize your application's performance</p>
      </div>

      {/* Performance Score */}
      <div className={`mb-8 p-6 rounded-lg border-2 ${getScoreBgColor(score)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Performance Score</h2>
            <p className="text-gray-600">Overall performance rating based on key metrics</p>
          </div>
          <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
        </div>
      </div>

      {/* Load Times */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Load Times
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">First Contentful Paint</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatMilliseconds(performanceData.loadTimes.firstContentfulPaint)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Largest Contentful Paint</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatMilliseconds(performanceData.loadTimes.largestContentfulPaint)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Time to Interactive</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatMilliseconds(performanceData.loadTimes.timeToInteractive)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">DOM Content Loaded</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatMilliseconds(performanceData.loadTimes.domContentLoaded)}
            </div>
          </div>
        </div>
      </div>

      {/* Bundle Size */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Bundle Size
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Total Size</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(performanceData.bundleSize.total)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">JavaScript</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(performanceData.bundleSize.javascript)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">CSS</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(performanceData.bundleSize.css)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Images</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(performanceData.bundleSize.images)}
            </div>
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      {performanceData.memoryUsage.usedJSHeapSize > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Memory Usage</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">Used Memory</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatBytes(performanceData.memoryUsage.usedJSHeapSize)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Total Memory</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatBytes(performanceData.memoryUsage.totalJSHeapSize)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Heap Limit</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatBytes(performanceData.memoryUsage.jsHeapSizeLimit)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {performanceData.recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Recommendations
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {performanceData.recommendations.map((rec: string, index: number) => (
              <div key={index} className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700">{rec}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics History */}
      {performanceData.metrics.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Metrics</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {performanceData.metrics.slice(-10).reverse().map((metric: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {metric.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.value} {metric.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {metric.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(metric.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
