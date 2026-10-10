import { useState } from 'react';
import { ComponentInstance } from '../types';
import { ComponentTemplate, getComponentTemplates, saveComponentTemplate, deleteComponentTemplate, createComponentFromTemplate, searchTemplates } from '../services/componentTemplates';
import { Package, Plus, Trash2, X, Save, Search } from 'lucide-react';

interface ComponentTemplatesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (component: ComponentInstance) => void;
  currentComponent?: ComponentInstance;
}

export function ComponentTemplatesPanel({ isOpen, onClose, onInsert, currentComponent }: ComponentTemplatesPanelProps) {
  const [templates, setTemplates] = useState<ComponentTemplate[]>(getComponentTemplates());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...new Set(templates.map(t => t.category))];
  
  // Apply both category and search filters
  const filteredTemplates = (() => {
    let result = selectedCategory === 'all' 
      ? templates 
      : templates.filter(t => t.category === selectedCategory);
    
    if (searchQuery.trim()) {
      result = searchTemplates(searchQuery).filter(t => 
        selectedCategory === 'all' || t.category === selectedCategory
      );
    }
    
    return result;
  })();

  const handleSaveTemplate = () => {
    if (!currentComponent || !newTemplateName.trim()) return;

    const template = saveComponentTemplate({
      name: newTemplateName,
      description: newTemplateDescription,
      componentType: currentComponent.type,
      props: currentComponent.props,
      category: currentComponent.type.charAt(0).toUpperCase() + currentComponent.type.slice(1),
    });

    setTemplates([...templates, template]);
    setShowSaveDialog(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Delete this template?')) {
      deleteComponentTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleInsertTemplate = (template: ComponentTemplate) => {
    const component = createComponentFromTemplate(template);
    onInsert(component);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Component Templates</h2>
            <p className="text-sm text-slate-500 mt-1">Reuse pre-configured components across your project</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Search Input */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex items-center gap-2 flex-wrap">
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

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No templates found</p>
              {currentComponent && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save size={16} />
                  Save Current Component as Template
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{template.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete template"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {template.componentType}
                    </span>
                    <button
                      onClick={() => handleInsertTemplate(template)}
                      className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus size={14} />
                      Insert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Current Component Button */}
        {currentComponent && !showSaveDialog && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save size={16} />
              Save Current Component as Template
            </button>
          </div>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Save as Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g., Hero Heading"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    placeholder="Describe this template..."
                    rows={3}
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
      </div>
    </div>
  );
}
