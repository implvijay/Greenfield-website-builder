import { useState } from 'react';
import { Page } from '../types';
import { X, Folder, Tag, Filter, CheckSquare, Square, Archive, Trash2, Copy, GitCompare } from 'lucide-react';

interface PageManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pages: Page[];
  onUpdatePages: (pages: Page[]) => void;
  onDuplicatePage: (page: Page) => void;
  onComparePages: (page1: Page, page2: Page) => void;
}

export function PageManagementPanel({ 
  isOpen, 
  onClose, 
  pages, 
  onUpdatePages,
  onDuplicatePage,
  onComparePages 
}: PageManagementPanelProps) {
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [compareMode, setCompareMode] = useState(false);

  if (!isOpen) return null;

  const filteredPages = pages.filter(page => {
    if (filterStatus !== 'all' && page.status !== filterStatus) return false;
    if (filterType !== 'all' && page.type !== filterType) return false;
    return true;
  });

  const uniqueTypes = Array.from(new Set(pages.map(p => p.type)));

  const togglePageSelection = (pageId: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId);
    } else {
      newSelected.add(pageId);
    }
    setSelectedPages(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPages.size === filteredPages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(filteredPages.map(p => p.id)));
    }
  };

  const handleBulkArchive = () => {
    if (selectedPages.size === 0) return;
    if (!confirm(`Archive ${selectedPages.size} page(s)?`)) return;

    const updatedPages = pages.map(page => 
      selectedPages.has(page.id) 
        ? { ...page, status: 'archived' as const }
        : page
    );
    onUpdatePages(updatedPages);
    setSelectedPages(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedPages.size === 0) return;
    if (!confirm(`Delete ${selectedPages.size} page(s)? This cannot be undone.`)) return;

    const updatedPages = pages.filter(page => !selectedPages.has(page.id));
    onUpdatePages(updatedPages);
    setSelectedPages(new Set());
  };

  const handleBulkPublish = () => {
    if (selectedPages.size === 0) return;

    const updatedPages = pages.map(page => 
      selectedPages.has(page.id) 
        ? { ...page, status: 'published' as const }
        : page
    );
    onUpdatePages(updatedPages);
    setSelectedPages(new Set());
  };

  const handleBulkDraft = () => {
    if (selectedPages.size === 0) return;

    const updatedPages = pages.map(page => 
      selectedPages.has(page.id) 
        ? { ...page, status: 'draft' as const }
        : page
    );
    onUpdatePages(updatedPages);
    setSelectedPages(new Set());
  };

  const handleCompare = () => {
    if (selectedPages.size !== 2) {
      alert('Please select exactly 2 pages to compare');
      return;
    }
    const [id1, id2] = Array.from(selectedPages);
    const page1 = pages.find(p => p.id === id1)!;
    const page2 = pages.find(p => p.id === id2)!;
    onComparePages(page1, page2);
    setCompareMode(false);
    setSelectedPages(new Set());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900">Page Management</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters and Actions */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Tag size={16} className="text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex-1" />

            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                compareMode 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <GitCompare size={14} />
              Compare Mode
            </button>
          </div>

          {selectedPages.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <span className="text-sm font-medium text-indigo-900">
                {selectedPages.size} page(s) selected
              </span>
              <div className="flex-1" />
              <button
                onClick={handleBulkPublish}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Publish
              </button>
              <button
                onClick={handleBulkDraft}
                className="px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
              >
                Set as Draft
              </button>
              <button
                onClick={handleBulkArchive}
                className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
              >
                Archive
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              {compareMode && selectedPages.size === 2 && (
                <button
                  onClick={handleCompare}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Compare
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pages List */}
        <div className="flex-1 overflow-auto p-6">
          {filteredPages.length === 0 ? (
            <div className="text-center py-12">
              <Folder size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No pages found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  {selectedPages.size === filteredPages.length ? (
                    <CheckSquare size={18} className="text-indigo-600" />
                  ) : (
                    <Square size={18} className="text-slate-400" />
                  )}
                  Select All ({filteredPages.length})
                </button>
              </div>

              {/* Pages */}
              {filteredPages.map(page => (
                <div
                  key={page.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    selectedPages.has(page.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => togglePageSelection(page.id)}
                    className="flex-shrink-0"
                  >
                    {selectedPages.has(page.id) ? (
                      <CheckSquare size={18} className="text-indigo-600" />
                    ) : (
                      <Square size={18} className="text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {page.title}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        page.status === 'published' 
                          ? 'bg-green-100 text-green-700'
                          : page.status === 'archived'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {page.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>/{page.slug}</span>
                      <span>•</span>
                      <span>{page.type}</span>
                      <span>•</span>
                      <span>{page.sections.length} sections</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDuplicatePage(page)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Duplicate page"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {filteredPages.length} of {pages.length} pages shown
          </div>
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
