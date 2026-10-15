import React, { useState, useEffect } from 'react';
import {
  Report,
  getReports,
  createReport,
  updateReport,
  deleteReport,
  generateReport,
  getGeneratedReports,
  exportGeneratedReport,
  getReportStatistics,
  ReportConfig,
  ReportSchedule
} from '../services/reportingEngine';
import { FileText, Plus, Edit2, Trash2, Download, Play, Calendar } from 'lucide-react';

export const ReportBuilder: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const loadedReports = getReports();
    setReports(loadedReports);
    setStatistics(getReportStatistics());
    setGeneratedReports(getGeneratedReports());
  };

  const handleCreateReport = (reportData: Partial<Report>) => {
    if (!reportData.name || !reportData.type || !reportData.config) {
      alert('Please fill in all required fields');
      return;
    }

    createReport(
      reportData.name,
      reportData.description || '',
      reportData.type,
      reportData.config,
      reportData.schedule
    );

    loadReports();
    setIsCreating(false);
  };

  const handleUpdateReport = (reportId: string, updates: Partial<Report>) => {
    updateReport(reportId, updates);
    loadReports();
    setEditingReport(null);
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteReport(reportId);
      loadReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    }
  };

  const handleGenerateReport = (reportId: string) => {
    const generated = generateReport(reportId);
    if (generated) {
      alert('Report generated successfully!');
      loadReports();
    } else {
      alert('Failed to generate report');
    }
  };

  const handleExportReport = (generatedId: string) => {
    const exported = exportGeneratedReport(generatedId);
    if (exported) {
      const blob = new Blob([exported], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${generatedId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Builder</h1>
          <p className="text-gray-600">Create and manage automated reports</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Report
        </button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Total Reports</div>
            <div className="text-3xl font-bold text-gray-900">{statistics.totalReports}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Report Types</div>
            <div className="text-3xl font-bold text-gray-900">
              {Object.keys(statistics.reportsByType).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Scheduled</div>
            <div className="text-3xl font-bold text-gray-900">{statistics.scheduledReports}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Generated</div>
            <div className="text-3xl font-bold text-gray-900">{statistics.totalGenerated}</div>
          </div>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedReport(report)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{report.type} report</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingReport(report);
                  }}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteReport(report.id);
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{report.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{report.config.dateRange.type.replace('_', ' ')}</span>
              </div>
              {report.schedule && report.schedule.enabled && (
                <div className="flex items-center gap-1 text-green-600">
                  <Play className="w-3 h-3" />
                  <span>Scheduled</span>
                </div>
              )}
            </div>

            {report.lastGenerated && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
          <p className="text-gray-600 mb-4">Create your first report to automate data analysis</p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Report
          </button>
        </div>
      )}

      {/* Generated Reports */}
      {generatedReports.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Generated Reports</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {generatedReports.slice(0, 10).map((generated) => {
                  const report = reports.find(r => r.id === generated.reportId);
                  return (
                    <tr key={generated.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report?.name || 'Unknown Report'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(generated.generatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                        {generated.format}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(generated.size / 1024).toFixed(2)} KB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleExportReport(generated.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Download className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingReport) && (
        <ReportModal
          report={editingReport}
          onClose={() => {
            setIsCreating(false);
            setEditingReport(null);
          }}
          onSave={editingReport 
            ? (reportData: any) => handleUpdateReport(editingReport.id, reportData)
            : handleCreateReport
          }
        />
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onGenerate={() => handleGenerateReport(selectedReport.id)}
        />
      )}
    </div>
  );
};

// Report Modal Component
interface ReportModalProps {
  report: Report | null;
  onClose: () => void;
  onSave: (reportData: any) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ report, onClose, onSave }) => {
  const [name, setName] = useState(report?.name || '');
  const [description, setDescription] = useState(report?.description || '');
  const [type, setType] = useState<Report['type']>(report?.type || 'analytics');
  const [dateRangeType, setDateRangeType] = useState<ReportConfig['dateRange']['type']>(
    report?.config.dateRange.type || 'last_30_days'
  );
  const [format, setFormat] = useState<ReportConfig['format']>(report?.config.format || 'pdf');
  const [includeCharts, setIncludeCharts] = useState(report?.config.includeCharts ?? true);
  const [includeInsights, setIncludeInsights] = useState(report?.config.includeInsights ?? true);
  const [enableSchedule, setEnableSchedule] = useState(!!report?.schedule?.enabled);
  const [frequency, setFrequency] = useState<ReportSchedule['frequency']>(
    report?.schedule?.frequency || 'weekly'
  );

  const handleSave = () => {
    const config: ReportConfig = {
      dateRange: { type: dateRangeType },
      sections: [
        { id: '1', type: 'summary', title: 'Summary', config: {}, order: 0 },
        { id: '2', type: 'metrics', title: 'Key Metrics', config: {}, order: 1 },
        { id: '3', type: 'charts', title: 'Visualizations', config: {}, order: 2 },
        { id: '4', type: 'insights', title: 'Insights', config: {}, order: 3 }
      ],
      format,
      includeCharts,
      includeInsights
    };

    const schedule: ReportSchedule | undefined = enableSchedule ? {
      frequency,
      dayOfWeek: frequency === 'weekly' ? 1 : undefined,
      dayOfMonth: frequency === 'monthly' ? 1 : undefined,
      time: '09:00',
      recipients: [],
      enabled: true
    } : undefined;

    const reportData = {
      name,
      description,
      type,
      config,
      schedule
    };

    onSave(reportData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {report ? 'Edit Report' : 'Create New Report'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter report name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe this report"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="analytics">Analytics Report</option>
              <option value="conversions">Conversions Report</option>
              <option value="ab_testing">A/B Testing Report</option>
              <option value="funnel">Funnel Report</option>
              <option value="custom">Custom Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range *
            </label>
            <select
              value={dateRangeType}
              onChange={(e) => setDateRangeType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format *
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="html">HTML</option>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Include Charts</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeInsights}
                onChange={(e) => setIncludeInsights(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Include Insights</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={enableSchedule}
                onChange={(e) => setEnableSchedule(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enable Scheduling</span>
            </label>

            {enableSchedule && (
              <div className="space-y-3 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name || !type}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {report ? 'Update Report' : 'Create Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Report Detail Modal Component
interface ReportDetailModalProps {
  report: Report;
  onClose: () => void;
  onGenerate: () => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, onClose, onGenerate }) => {
  const generatedReports = getGeneratedReports().filter(gr => gr.reportId === report.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.name}</h2>
            <p className="text-gray-600">{report.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Report Configuration */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Configuration</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{report.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date Range:</span>
              <span className="text-sm font-medium text-gray-900">
                {report.config.dateRange.type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Format:</span>
              <span className="text-sm font-medium text-gray-900 uppercase">{report.config.format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Include Charts:</span>
              <span className="text-sm font-medium text-gray-900">
                {report.config.includeCharts ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Include Insights:</span>
              <span className="text-sm font-medium text-gray-900">
                {report.config.includeInsights ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule */}
        {report.schedule && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Schedule</h3>
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Frequency:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{report.schedule.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Time:</span>
                <span className="text-sm font-medium text-gray-900">{report.schedule.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${report.schedule.enabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {report.schedule.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Generated Reports */}
        {generatedReports.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Generated Reports</h3>
            <div className="space-y-2">
              {generatedReports.slice(0, 5).map((generated) => (
                <div key={generated.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(generated.generatedAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {generated.format.toUpperCase()} - {(generated.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const exported = exportGeneratedReport(generated.id);
                      if (exported) {
                        const blob = new Blob([exported], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `report-${generated.id}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 inline" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onGenerate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Generate Now
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
