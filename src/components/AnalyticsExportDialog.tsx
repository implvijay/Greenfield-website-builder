import React, { useState } from 'react';
import { ProjectAnalytics } from '../services/analytics';
import {
  exportAnalytics,
  getExportSizeEstimate,
  ExportFormat,
  ExportOptions,
  DEFAULT_EXPORT_OPTIONS
} from '../services/analyticsExport';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';

interface AnalyticsExportDialogProps {
  analytics: ProjectAnalytics;
  onClose: () => void;
}

export const AnalyticsExportDialog: React.FC<AnalyticsExportDialogProps> = ({
  analytics,
  onClose
}) => {
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);

  const handleExport = () => {
    exportAnalytics(analytics, options);
    onClose();
  };

  const formatOptions: { value: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'csv',
      label: 'CSV',
      icon: <FileSpreadsheet className="w-6 h-6" />,
      description: 'Spreadsheet format, compatible with Excel and Google Sheets'
    },
    {
      value: 'json',
      label: 'JSON',
      icon: <File className="w-6 h-6" />,
      description: 'Structured data format, ideal for developers and APIs'
    },
    {
      value: 'pdf',
      label: 'PDF',
      icon: <FileText className="w-6 h-6" />,
      description: 'Printable report format with charts and tables'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Download className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Export Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formatOptions.map((format) => (
              <button
                key={format.value}
                onClick={() => setOptions({ ...options, format: format.value })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  options.format === format.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={options.format === format.value ? 'text-blue-600' : 'text-gray-600'}>
                    {format.icon}
                  </div>
                  <span className="font-medium text-gray-900">{format.label}</span>
                </div>
                <p className="text-xs text-gray-600">{format.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sections to Include */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Include Sections
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.sections?.overview ?? true}
                onChange={(e) => setOptions({
                  ...options,
                  sections: { ...options.sections, overview: e.target.checked }
                })}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">Overview (Total pages, published, drafts, etc.)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.sections?.pages ?? true}
                onChange={(e) => setOptions({
                  ...options,
                  sections: { ...options.sections, pages: e.target.checked }
                })}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">Pages (By type, by status, recent pages)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.sections?.folders ?? true}
                onChange={(e) => setOptions({
                  ...options,
                  sections: { ...options.sections, folders: e.target.checked }
                })}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">Folders (Statistics, largest folders)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.sections?.tags ?? true}
                onChange={(e) => setOptions({
                  ...options,
                  sections: { ...options.sections, tags: e.target.checked }
                })}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">Tags (Statistics, most used tags)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.sections?.schedule ?? true}
                onChange={(e) => setOptions({
                  ...options,
                  sections: { ...options.sections, schedule: e.target.checked }
                })}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">Schedule (Upcoming events, scheduled pages)</span>
            </label>
          </div>
        </div>

        {/* Additional Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Additional Options
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.includeMetadata ?? true}
              onChange={(e) => setOptions({ ...options, includeMetadata: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span className="text-sm text-gray-700">Include metadata (export date, last updated)</span>
          </label>
        </div>

        {/* File Size Estimate */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Estimated file size:</span>
            <span className="text-sm font-medium text-gray-900">
              {getExportSizeEstimate(analytics, options.format)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export {options.format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
