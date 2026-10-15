import React, { useState, useEffect } from 'react';
import { auditPageAccessibility, getAccessibilityReports, AccessibilityReport } from '../services/accessibilityAudit';
import { Accessibility, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AccessibilityAuditProps {
  pages: any[];
}

export const AccessibilityAudit: React.FC<AccessibilityAuditProps> = ({ pages }) => {
  const [reports, setReports] = useState<AccessibilityReport[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [currentReport, setCurrentReport] = useState<AccessibilityReport | null>(null);

  useEffect(() => {
    const savedReports = getAccessibilityReports();
    setReports(savedReports);
  }, []);

  useEffect(() => {
    if (selectedPageId) {
      const page = pages.find(p => p.id === selectedPageId);
      if (page) {
        const report = auditPageAccessibility(page);
        setCurrentReport(report);
      }
    }
  }, [selectedPageId, pages]);

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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'serious':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'moderate':
        return <Info className="w-5 h-5 text-yellow-600" />;
      case 'minor':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'serious':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'minor':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Accessibility className="w-8 h-8" />
          Accessibility Audit
        </h1>
        <p className="text-gray-600">Check your pages for accessibility issues and WCAG compliance</p>
      </div>

      {/* Page Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Page to Audit
        </label>
        <select
          value={selectedPageId}
          onChange={(e) => setSelectedPageId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose a page...</option>
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.title}
            </option>
          ))}
        </select>
      </div>

      {/* Current Report */}
      {currentReport && (
        <>
          {/* Score Card */}
          <div className={`mb-8 p-6 rounded-lg border-2 ${getScoreBgColor(currentReport.score)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Accessibility Score
                </h2>
                <p className="text-gray-600">
                  {currentReport.pageTitle}
                </p>
              </div>
              <div className={`text-6xl font-bold ${getScoreColor(currentReport.score)}`}>
                {currentReport.score}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 mb-1">Critical</div>
              <div className="text-3xl font-bold text-red-900">
                {currentReport.summary.critical}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-600 mb-1">Serious</div>
              <div className="text-3xl font-bold text-orange-900">
                {currentReport.summary.serious}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-600 mb-1">Moderate</div>
              <div className="text-3xl font-bold text-yellow-900">
                {currentReport.summary.moderate}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Minor</div>
              <div className="text-3xl font-bold text-blue-900">
                {currentReport.summary.minor}
              </div>
            </div>
          </div>

          {/* Issues List */}
          {currentReport.issues.length > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Issues Found ({currentReport.issues.length})
              </h2>
              <div className="space-y-4">
                {currentReport.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{issue.category}</span>
                          <span className="text-xs px-2 py-1 bg-white rounded-full border">
                            WCAG {issue.wcagCriteria}
                          </span>
                        </div>
                        <p className="font-medium mb-2">{issue.message}</p>
                        {issue.element && (
                          <p className="text-sm mb-2">
                            <span className="font-medium">Element:</span> {issue.element}
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="font-medium">Recommendation:</span>{' '}
                          {issue.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                No Issues Found!
              </h3>
              <p className="text-green-700">
                This page meets accessibility standards.
              </p>
            </div>
          )}
        </>
      )}

      {/* Historical Reports */}
      {reports.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Audit History
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.slice(-10).reverse().map((report, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedPageId(report.pageId);
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.pageTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-bold ${getScoreColor(report.score)}`}>
                        {report.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.summary.total} issues
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.timestamp).toLocaleString()}
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
