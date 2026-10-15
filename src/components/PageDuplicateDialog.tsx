import { useState } from 'react';
import { Page } from '../types';
import { duplicatePage } from '../services/pageTemplates';
import { X, Copy } from 'lucide-react';

interface PageDuplicateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  page: Page;
  onDuplicate: (newPage: Page) => void;
}

export function PageDuplicateDialog({ isOpen, onClose, page, onDuplicate }: PageDuplicateDialogProps) {
  const [newName, setNewName] = useState(`${page.title} (Copy)`);
  const [newSlug, setNewSlug] = useState(`${page.slug}-copy`);
  const [copyContent, setCopyContent] = useState(true);
  const [copySEO, setCopySEO] = useState(true);

  if (!isOpen) return null;

  const handleDuplicate = () => {
    const newPage = duplicatePage(page, {
      newName,
      newSlug,
      copyContent,
      copySEO,
    });
    onDuplicate(newPage);
    onClose();
  };

  const handleSlugChange = (value: string) => {
    // Auto-generate slug from name if user hasn't manually edited it
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setNewSlug(slug);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Copy size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900">Duplicate Page</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Page Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                handleSlugChange(e.target.value);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">/</span>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={copyContent}
                onChange={(e) => setCopyContent(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-sm font-medium text-slate-900">Copy Content</div>
                <div className="text-xs text-slate-500">Include all sections and components</div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={copySEO}
                onChange={(e) => setCopySEO(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-sm font-medium text-slate-900">Copy SEO Settings</div>
                <div className="text-xs text-slate-500">Include meta title, description, and other SEO data</div>
              </div>
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> The duplicated page will be created with a new unique ID and added to your project.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDuplicate}
            disabled={!newName.trim() || !newSlug.trim()}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Copy size={16} />
            Duplicate Page
          </button>
        </div>
      </div>
    </div>
  );
}
