import { useState, useEffect } from 'react';
import { Search, X, FileText, Layers } from 'lucide-react';
import { Page, Section, ComponentInstance } from '../types';

interface GlobalSearchProps {
  pages: Page[];
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: string, sectionId?: string, componentId?: string) => void;
}

interface SearchResult {
  pageId: string;
  pageTitle: string;
  sectionId?: string;
  sectionType?: string;
  componentId?: string;
  componentType?: string;
  matchText: string;
  matchType: 'page' | 'section' | 'component';
}

export function GlobalSearch({ pages, isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search pages
    pages.forEach(page => {
      // Search page title
      if (page.title.toLowerCase().includes(searchQuery)) {
        searchResults.push({
          pageId: page.id,
          pageTitle: page.title,
          matchText: page.title,
          matchType: 'page',
        });
      }

      // Search page SEO
      if (page.seo?.title?.toLowerCase().includes(searchQuery)) {
        searchResults.push({
          pageId: page.id,
          pageTitle: page.title,
          matchText: `SEO: ${page.seo.title}`,
          matchType: 'page',
        });
      }

      // Search sections and components
      page.sections.forEach(section => {
        // Search section type
        if (section.type.toLowerCase().includes(searchQuery)) {
          searchResults.push({
            pageId: page.id,
            pageTitle: page.title,
            sectionId: section.id,
            sectionType: section.type,
            matchText: `Section: ${section.type}`,
            matchType: 'section',
          });
        }

        // Search components
        section.rows.forEach(row => {
          row.columns.forEach(column => {
            column.components.forEach(component => {
              const componentText = getComponentText(component);
              if (componentText.toLowerCase().includes(searchQuery)) {
                searchResults.push({
                  pageId: page.id,
                  pageTitle: page.title,
                  sectionId: section.id,
                  sectionType: section.type,
                  componentId: component.id,
                  componentType: component.type,
                  matchText: componentText,
                  matchType: 'component',
                });
              }
            });
          });
        });
      });
    });

    setResults(searchResults.slice(0, 50)); // Limit to 50 results
  }, [query, pages]);

  const getComponentText = (component: ComponentInstance): string => {
    const props = component.props;
    switch (component.type) {
      case 'heading':
      case 'paragraph':
      case 'text':
        return props.text || '';
      case 'image':
        return props.alt || props.src || '';
      case 'button':
        return props.text || '';
      case 'button-group':
        return (props.buttons || []).map((b: any) => b.label).join(', ');
      case 'card':
        return `${props.title || ''} ${props.description || ''}`;
      case 'stat':
        return `${props.value || ''} ${props.label || ''}`;
      case 'testimonial':
        return `${props.text || ''} ${props.name || ''}`;
      case 'team-member':
        return `${props.name || ''} ${props.role || ''}`;
      case 'pricing-card':
        return `${props.name || ''} ${props.price || ''}`;
      case 'faq-item':
        return `${props.question || ''} ${props.answer || ''}`;
      case 'form-field':
        return `${props.label || ''} ${props.placeholder || ''}`;
      default:
        return JSON.stringify(props);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[70vh] flex flex-col">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, sections, and components..."
              autoFocus
              className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto p-4">
          {query.trim() === '' ? (
            <div className="text-center py-12 text-slate-500">
              <Search size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Start typing to search across all pages</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onNavigate(result.pageId, result.sectionId, result.componentId);
                    onClose();
                  }}
                  className="w-full p-3 text-left hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {result.matchType === 'page' && <FileText size={20} className="text-indigo-600" />}
                      {result.matchType === 'section' && <Layers size={20} className="text-purple-600" />}
                      {result.matchType === 'component' && <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-xs text-emerald-700">C</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900">{result.pageTitle}</span>
                        {result.sectionType && (
                          <span className="text-xs text-slate-500">→ {result.sectionType}</span>
                        )}
                        {result.componentType && (
                          <span className="text-xs text-slate-500">→ {result.componentType}</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 truncate">
                        {highlightMatch(result.matchText, query)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
            <span>Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
