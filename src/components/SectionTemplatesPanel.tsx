import { useState } from 'react';
import { SectionTemplate, getSectionTemplates, saveSectionTemplate, deleteSectionTemplate, createSectionFromTemplate, searchSectionTemplates, exportSectionTemplatesToJSON, importSectionTemplatesFromJSON } from '../services/sectionTemplates';
import { Section, DesignTokens } from '../types';
import { X, Search, Trash2, Plus, Download, Upload, Eye, Package, Tag } from 'lucide-react';

interface SectionTemplatesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (section: Section) => void;
  currentSection?: Section;
  tokens: DesignTokens;
}

export function SectionTemplatesPanel({ isOpen, onClose, onInsert, currentSection, tokens }: SectionTemplatesPanelProps) {
  const [templates, setTemplates] = useState<SectionTemplate[]>(getSectionTemplates());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<SectionTemplate | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateTags, setNewTemplateTags] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJson, setImportJson] = useState('');

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = (() => {
    let result = selectedCategory === 'all' 
      ? templates 
      : templates.filter(t => t.category === selectedCategory);
    
    if (searchQuery.trim()) {
      result = searchSectionTemplates(searchQuery).filter(t => 
        selectedCategory === 'all' || t.category === selectedCategory
      );
    }
    
    return result;
  })();

  const handleSaveTemplate = () => {
    if (!currentSection || !newTemplateName.trim()) return;

    const template = saveSectionTemplate({
      name: newTemplateName,
      description: newTemplateDescription,
      section: JSON.parse(JSON.stringify(currentSection)),
      category: currentSection.type.charAt(0).toUpperCase() + currentSection.type.slice(1),
      tags: newTemplateTags.split(',').map(t => t.trim()).filter(Boolean),
    });

    setTemplates([...templates, template]);
    setShowSaveDialog(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateTags('');
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Delete this section template?')) {
      deleteSectionTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleInsertTemplate = (template: SectionTemplate) => {
    const section = createSectionFromTemplate(template);
    onInsert(section);
    onClose();
  };

  const handleExport = () => {
    const json = exportSectionTemplatesToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'section-templates.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const result = importSectionTemplatesFromJSON(importJson);
    if (result.success) {
      setTemplates(getSectionTemplates());
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
            <h2 className="text-xl font-semibold text-slate-900">Section Templates</h2>
            <p className="text-sm text-slate-500 mt-1">Save and reuse entire sections across your projects</p>
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
            {currentSection && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Plus size={14} />
                Save Current Section
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
              placeholder="Search section templates..."
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
              <Package size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No section templates found</p>
              {currentSection && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={16} />
                  Save Current Section as Template
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
                    className="h-32 relative cursor-pointer"
                    style={{ background: template.previewColor || tokens.colors.surface }}
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                      <Eye className="opacity-0 group-hover:opacity-100 text-white transition-opacity" size={32} />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-white/90 text-xs font-medium text-slate-700 rounded">
                        {template.section.type}
                      </span>
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
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <SectionPreview section={previewTemplate.section} tokens={tokens} />
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">{previewTemplate.description}</p>
                <button
                  onClick={() => {
                    handleInsertTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Insert This Section
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Save Section as Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g., Hero with Gradient"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    placeholder="Describe this section template..."
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
                    placeholder="hero, gradient, cta"
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
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Import Section Templates</h3>
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

// Simple section preview renderer
function SectionPreview({ section, tokens }: { section: Section; tokens: DesignTokens }) {
  const bgStyle = section.settings.background === 'gradient'
    ? { background: `linear-gradient(135deg, ${tokens.colors.primary}, ${tokens.colors.primaryDark})` }
    : section.settings.backgroundImage
    ? { backgroundImage: `url(${section.settings.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: tokens.colors.background };

  const textColor = section.settings.background === 'gradient' ? '#ffffff' : tokens.colors.text;

  return (
    <div style={{ ...bgStyle, padding: section.settings.padding || '3rem 1.5rem', textAlign: section.settings.textAlign || 'left' }}>
      <div style={{ maxWidth: section.settings.fullWidth ? '100%' : tokens.spacing.container, margin: '0 auto' }}>
        {section.rows.map(row => (
          <div key={row.id} style={{ display: 'flex', flexWrap: 'wrap', gap: row.gap || tokens.spacing.gap }}>
            {row.columns.map(col => (
              <div key={col.id} style={{ width: `${col.width}%`, minWidth: col.width < 100 ? '250px' : '100%', flex: 1 }}>
                {col.components.map(comp => (
                  <ComponentPreview key={comp.id} component={comp} tokens={tokens} textColor={textColor} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentPreview({ component, tokens, textColor }: { component: any; tokens: DesignTokens; textColor: string }) {
  const { type, props } = component;

  switch (type) {
    case 'heading':
      const Tag = `h${props.level || 2}` as any;
      const sizeMap: Record<string, string> = { '5xl': '3rem', '4xl': '2.5rem', '3xl': '2rem', '2xl': '1.5rem', 'xl': '1.25rem' };
      return <Tag style={{ fontFamily: tokens.typography.headingFont, fontWeight: tokens.typography.headingWeight, fontSize: sizeMap[props.size] || '2rem', color: textColor, marginBottom: '0.75rem', lineHeight: '1.2' }}>{props.text}</Tag>;
    
    case 'paragraph':
    case 'text':
      return <p style={{ fontFamily: tokens.typography.bodyFont, fontSize: tokens.typography.bodySize, color: textColor, opacity: 0.85, lineHeight: tokens.typography.lineHeight, marginBottom: '1rem' }}>{props.text}</p>;
    
    case 'button-group':
      return (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
          {(props.buttons || []).map((btn: any, i: number) => (
            <button
              key={i}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: tokens.borderRadius,
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                ...(btn.variant === 'primary' ? {
                  backgroundColor: tokens.colors.primary,
                  color: '#ffffff',
                  border: 'none',
                } : {
                  backgroundColor: 'transparent',
                  color: textColor,
                  border: `2px solid ${textColor}30`,
                }),
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      );
    
    case 'card':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {(props.cards || []).map((card: any, i: number) => (
            <div key={i} style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.borderRadius, padding: '1.5rem', border: `1px solid ${tokens.colors.border}`, textAlign: 'center' }}>
              {card.icon && <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>{card.icon}</span>}
              <h4 style={{ fontWeight: '600', color: textColor, marginBottom: '0.5rem' }}>{card.title}</h4>
              <p style={{ fontSize: '0.875rem', color: textColor, opacity: 0.7 }}>{card.description}</p>
            </div>
          ))}
        </div>
      );
    
    case 'stat':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {(props.stats || []).map((stat: any, i: number) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: '800', color: tokens.colors.primary, lineHeight: '1' }}>{stat.value}</p>
              <p style={{ fontSize: '0.875rem', color: textColor, opacity: 0.7, marginTop: '0.5rem' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      );
    
    case 'testimonial':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {(props.testimonials || []).map((t: any, i: number) => (
            <div key={i} style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.borderRadius, padding: '1.5rem', border: `1px solid ${tokens.colors.border}` }}>
              <p style={{ fontSize: '0.9rem', color: textColor, opacity: 0.8, lineHeight: '1.7', marginBottom: '1rem', fontStyle: 'italic' }}>"{t.text}"</p>
              <div>
                <p style={{ fontWeight: '600', color: textColor, fontSize: '0.875rem' }}>{t.name}</p>
                <p style={{ fontSize: '0.75rem', color: textColor, opacity: 0.6 }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      );
    
    default:
      return <div style={{ padding: '1rem', backgroundColor: tokens.colors.surfaceAlt, borderRadius: tokens.borderRadius, textAlign: 'center', color: tokens.colors.textMuted, fontSize: '0.85rem' }}>[{type}]</div>;
  }
}
