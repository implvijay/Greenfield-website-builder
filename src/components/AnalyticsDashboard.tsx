import React, { useState, useEffect } from 'react';
import { Page, PageFolder } from '../types';
import { calculateProjectAnalytics, getAnalyticsSummary, ProjectAnalytics } from '../services/analytics';
import { BarChart3, TrendingUp, FileText, Folder, Tag, Calendar, Clock } from 'lucide-react';

interface AnalyticsDashboardProps {
  pages: Page[];
  folders: PageFolder[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ pages, folders }) => {
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);

  useEffect(() => {
    const data = calculateProjectAnalytics(pages, folders);
    setAnalytics(data);
  }, [pages, folders]);

  if (!analytics) {
    return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
  }

  const summary = getAnalyticsSummary(analytics);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summary.keyMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{metric.label}</span>
              {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
            </div>
            <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Insights */}
      {summary.insights.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Insights
          </h3>
          <ul className="space-y-2">
            {summary.insights.map((insight, index) => (
              <li key={index} className="text-blue-800 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pages by Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Pages by Status
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.pages.pagesByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'published' ? 'bg-green-500' :
                        status === 'draft' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${(count / analytics.pages.totalPages) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pages by Type */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Pages by Type
          </h3>
          <div className="space-y-2">
            {Object.entries(analytics.pages.pagesByType)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{type}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Folder Analytics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Folder Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Folders</span>
              <span className="text-sm font-medium text-gray-900">{analytics.folders.totalFolders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Root Folders</span>
              <span className="text-sm font-medium text-gray-900">{analytics.folders.rootFolders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nested Folders</span>
              <span className="text-sm font-medium text-gray-900">{analytics.folders.nestedFolders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Empty Folders</span>
              <span className="text-sm font-medium text-gray-900">{analytics.folders.emptyFolders.length}</span>
            </div>
          </div>
          {analytics.folders.largestFolders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Largest Folders</h4>
              <div className="space-y-1">
                {analytics.folders.largestFolders.slice(0, 5).map(({ folderId, count }) => {
                  const folder = folders.find(f => f.id === folderId);
                  return (
                    <div key={folderId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 truncate">{folder?.name || 'Unknown'}</span>
                      <span className="text-gray-900 font-medium">{count} pages</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tag Analytics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Tag Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Tags</span>
              <span className="text-sm font-medium text-gray-900">{analytics.tags.totalTags}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Tags per Page</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.tags.averageTagsPerPage.toFixed(1)}
              </span>
            </div>
          </div>
          {analytics.tags.mostUsedTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Most Used Tags</h4>
              <div className="space-y-1">
                {analytics.tags.mostUsedTags.slice(0, 10).map(({ tag, count }) => (
                  <div key={tag} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{tag}</span>
                    <span className="text-gray-900 font-medium">{count} pages</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Schedule Analytics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scheduled Publications</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.schedule.scheduledPublish}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scheduled Expirations</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.schedule.scheduledExpire}
                  </span>
                </div>
              </div>
            </div>
            <div>
              {analytics.schedule.upcomingEvents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Upcoming Events
                  </h4>
                  <div className="space-y-2">
                    {analytics.schedule.upcomingEvents.slice(0, 5).map((event, index) => (
                      <div key={index} className="text-sm bg-gray-50 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {event.page.title}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            event.event === 'publish' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {event.event}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Pages */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recently Modified
          </h3>
          <div className="space-y-2">
            {analytics.pages.recentPages.slice(0, 10).map(page => (
              <div key={page.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate">{page.title}</span>
                <span className="text-gray-500 text-xs">
                  {page.lastModified ? new Date(page.lastModified).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Tagged Pages */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Most Tagged Pages
          </h3>
          <div className="space-y-2">
            {analytics.pages.mostTaggedPages.slice(0, 10).map(page => (
              <div key={page.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate">{page.title}</span>
                <span className="text-gray-900 font-medium">
                  {page.tags?.length || 0} tags
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};
