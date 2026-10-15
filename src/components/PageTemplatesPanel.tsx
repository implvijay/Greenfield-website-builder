import { useState } from 'react';
import { Page, DesignTokens } from '../types';
import { PageTemplate, getPageTemplates, savePageTemplate, deletePageTemplate, createPageFromTemplate, searchPageTemplates, exportPageTemplatesToJSON, importPageTemplatesFromJSON } from '../services/pageTemplates';
import { X, Search, Trash2, Plus, Download, Upload, Eye, FileText, Tag } from 'lucide-react';

interface PageTemplatesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (page: Page) => void;
  currentPage?: Page;
  tokens: DesignTokens;
}

export function PageTemplatesPanel({ isOpen, onClose, onInsert, currentPage, tokens }: PageTemplatesPanelProps) {
  const [templates, setTemplates] = useState<PageTemplate[]>(getPageTemplates());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<PageTemplate | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateTags, setNewTemplateTags] = useState('');
  const [newTemplateIndustry, setNewTemplateIndustry] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJson, setImportJson] = useState('');

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = (() => {
    let result = selectedCategory === 'all' 
      ? templates 
      : templates.filter(t => t.category === selectedCategory);
    
    if (searchQuery.trim()) {
      result = searchPageTemplates(searchQuery).filter(t => 
        selectedCategory === 'all' || t.category === selectedCategory
      );
    }
    
    return result;
  })();

  const handleSaveTemplate = () => {
    if (!currentPage || !newTemplateName.trim()) return;

    const template = savePageTemplate({
      name: newTemplateName,
      description: newTemplateDescription,
      page: JSON.parse(JSON.stringify(currentPage)),
      category: currentPage.type.charAt(0).toUpperCase() + currentPage.type.slice(1),
      tags: newTemplateTags.split(',').map(t => t.trim()).filter(Boolean),
      industry: newTemplateIndustry || undefined,
    });

    setTemplates([...templates, template]);
    setShowSaveDialog(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateTags('');
    setNewTemplateIndustry('');
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Delete this page template?')) {
      deletePageTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleInsertTemplate = (template: PageTemplate) => {
    const page = createPageFromTemplate(template);
    onInsert(page);
    onClose();
  };

  const handleExport = () => {
    const json = exportPageTemplatesToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page-templates.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const result = importPageTemplatesFromJSON(importJson);
    if (result.success) {
      setTemplates(getPageTemplates());
      setShowImportDialog(false);
      setImportJson('');
      alert(`Successfully imported ${result.count} templates`);
    } else {
      alert(`Import failed: ${result.error}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Page Templates</h2>
            <p className="text-sm text-slate-500 mt-1">Save and reuse entire page layouts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Export templates"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => setShowImportDialog(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Import templates"
            >
              <Upload size={18} />
            </button>
            {currentPage && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Plus size={14} />
                Save Current Page
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search page templates..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No page templates found</p>
              {currentPage && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={16} />
                  Save Current Page as Template
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="border border-slate-200 rounded-lg overflow-hidden hover:border-indigo-500 hover:shadow-md transition-all group"
                >
                  {/* Preview */}
                  <div 
                    className="h-32 relative cursor-pointer bg-gradient-to-br from-slate-100 to-slate-200"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                      <Eye className="opacity-0 group-hover:opacity-100 text-white transition-opacity" size={32} />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-white/90 text-xs font-medium text-slate-700 rounded">
                        {template.page.type}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <FileText size={20} className="text-slate-400" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{template.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                        title="Delete template"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Tags */}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap mb-3">
                        <Tag size={10} className="text-slate-400" />
                        {template.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-xs text-slate-600 rounded">
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-xs text-slate-400">+{template.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewTemplate(template)}
                        className="flex-1 px-3 py-1.5 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={12} />
                        Preview
                      </button>
                      <button
                        onClick={() => handleInsertTemplate(template)}
                        className="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus size={12} />
                        Insert
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{previewTemplate.name}</h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 bg-slate-50">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{previewTemplate.page.title}</h2>
                  <p className="text-sm text-slate-500 mb-4">{previewTemplate.description}</p>
                  <div className="space-y-2 text-sm">
                    <div><strong>Type:</strong> {previewTemplate.page.type}</div>
                    <div><strong>Slug:</strong> /{previewTemplate.page.slug}</div>
                    <div><strong>Status:</strong> {previewTemplate.page.status}</div>
                    <div><strong>Sections:</strong> {previewTemplate.page.sections.length}</div>
                    {previewTemplate.industry && <div><strong>Industry:</strong> {previewTemplate.industry}</div>}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">{previewTemplate.page.sections.length} sections</p>
                <button
                  onClick={() => {
                    handleInsertTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Insert This Page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Save Page as Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g., Corporate Home Page"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    placeholder="Describe this page template..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newTemplateTags}
                    onChange={(e) => setNewTemplateTags(e.target.value)}
                    placeholder="corporate, professional, business"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Industry (optional)</label>
                  <input
                    type="text"
                    value={newTemplateIndustry}
                    onChange={(e) => setNewTemplateIndustry(e.target.value)}
                    placeholder="e.g., corporate, technology, healthcare"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={!newTemplateName.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Dialog */}
        {showImportDialog && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Import Page Templates</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">JSON Data</label>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder="Paste JSON data here..."
                  rows={10}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importJson.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Import Templates
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
