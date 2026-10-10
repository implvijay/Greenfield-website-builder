import { Page } from '../types';
import { comparePages } from '../services/pageTemplates';
import { X, GitCompare } from 'lucide-react';

interface PageCompareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  page1: Page;
  page2: Page;
}

export function PageCompareDialog({ isOpen, onClose, page1, page2 }: PageCompareDialogProps) {
  if (!isOpen) return null;

  const diff = comparePages(page1, page2);

  const DiffItem = ({ label, isDiff, value1, value2 }: { 
    label: string; 
    isDiff: boolean; 
    value1: string | number; 
    value2: string | number;
  }) => (
    <div className={`p-3 rounded-lg border ${isDiff ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="text-xs text-slate-400 mb-0.5">Page 1</div>
          <div className={`text-sm font-medium ${isDiff ? 'text-amber-900' : 'text-slate-900'}`}>
            {value1}
          </div>
        </div>
        <div className="text-slate-300">→</div>
        <div className="flex-1">
          <div className="text-xs text-slate-400 mb-0.5">Page 2</div>
          <div className={`text-sm font-medium ${isDiff ? 'text-amber-900' : 'text-slate-900'}`}>
            {value2}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900">Compare Pages</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {/* Page Headers */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs font-medium text-blue-600 mb-1">Page 1</div>
              <div className="text-sm font-semibold text-slate-900">{page1.title}</div>
              <div className="text-xs text-slate-500 mt-1">/{page1.slug}</div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-xs font-medium text-purple-600 mb-1">Page 2</div>
              <div className="text-sm font-semibold text-slate-900">{page2.title}</div>
              <div className="text-xs text-slate-500 mt-1">/{page2.slug}</div>
            </div>
          </div>

          {/* Comparison Results */}
          <div className="space-y-3">
            <DiffItem
              label="Title"
              isDiff={diff.titleDiff}
              value1={page1.title}
              value2={page2.title}
            />

            <DiffItem
              label="URL Slug"
              isDiff={diff.slugDiff}
              value1={`/${page1.slug}`}
              value2={`/${page2.slug}`}
            />

            <DiffItem
              label="Page Type"
              isDiff={diff.typeDiff}
              value1={page1.type}
              value2={page2.type}
            />

            <DiffItem
              label="Status"
              isDiff={diff.statusDiff}
              value1={page1.status}
              value2={page2.status}
            />

            <DiffItem
              label="Sections Count"
              isDiff={diff.sectionsCountDiff !== 0}
              value1={page1.sections.length}
              value2={page2.sections.length}
            />

            <DiffItem
              label="SEO Settings"
              isDiff={diff.seoDiff}
              value1={diff.seoDiff ? 'Different' : 'Same'}
              value2={diff.seoDiff ? 'Different' : 'Same'}
            />
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-sm font-medium text-slate-900 mb-2">Summary</div>
            <div className="text-xs text-slate-600 space-y-1">
              <div>• {diff.titleDiff || diff.slugDiff || diff.typeDiff || diff.statusDiff || diff.sectionsCountDiff !== 0 || diff.seoDiff ? 'Pages have differences' : 'Pages are identical'}</div>
              <div>• {Math.abs(diff.sectionsCountDiff)} section(s) difference</div>
              <div>• Page 1: {page1.sections.length} sections</div>
              <div>• Page 2: {page2.sections.length} sections</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
