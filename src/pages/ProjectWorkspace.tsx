import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { AppLayout, Breadcrumbs } from '../components/Layout';
import { industries } from '../data/industries';
import { getThemeTokens } from '../data/themes';
import { Page, Section, Menu, MenuItem, DesignTokens, AnimationSettings } from '../types';
import { v4 as uuid } from 'uuid';
import React from 'react';
import { MediaLibrary } from '../components/MediaLibrary';
import { FormBuilder } from '../components/FormBuilder';
import { AnalyticsConfig } from '../components/AnalyticsConfig';
import { BlogManager } from '../components/BlogManager';
import { SectionSettingsPanel } from '../components/SectionSettingsPanel';
import { AnimationSettingsPanel } from '../components/AnimationSettingsPanel';
import { QuickActionsPanel } from '../components/QuickActionsPanel';
import { BuilderStatusBar } from '../components/BuilderStatusBar';
import { ComponentLibrary } from '../components/ComponentLibrary';
import { ComponentPropertiesPanel } from '../components/ComponentPropertiesPanel';
import { GlobalSearch } from '../components/GlobalSearch';
import { ComponentOperations } from '../components/ComponentOperations';
import { ComponentTemplatesPanel } from '../components/ComponentTemplatesPanel';
import { HistoryManager } from '../services/history';
import { KeyboardShortcutManager, createBuilderShortcuts } from '../services/keyboardShortcuts';
import { AutoSaveManager } from '../services/autoSave';
import { copyComponentToClipboard, pasteComponentFromClipboard, hasClipboardContent } from '../services/clipboard';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Undo, Redo } from 'lucide-react';
import {
  LayoutDashboard, FileText, Paintbrush, Menu as MenuIcon, Image, Search,
  BarChart3, Eye, History, Download, Settings, Plus, Trash2, Copy,
  GripVertical, ChevronDown, ChevronRight, ArrowLeft, Save, Monitor,
  Tablet, Smartphone, Check, X, Edit3, Layers, Palette, Type,
  Star, Zap, Globe, Share2, Code, FileCode, Package
} from 'lucide-react';

type WorkspaceTab = 'overview' | 'pages' | 'builder' | 'menus' | 'media' | 'seo' | 'forms' | 'analytics' | 'blog' | 'preview' | 'versions' | 'export';

// Draggable Section Component
function DraggableSection({ id, children, isSelected, onClick }: { id: string; children: React.ReactNode; isSelected: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-lg border-2 transition-all ${
        isDragging ? 'opacity-50 shadow-2xl' : ''
      } ${isSelected ? 'border-indigo-500 shadow-lg' : 'border-transparent hover:border-slate-300'}`}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

export function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const { state, updateProject, notify, createVersion, restoreVersion, setCurrentProject } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');

  // Look up project directly from state.projects using URL param
  const project = state.projects.find(p => p.id === projectId);

  // Set currentProjectId when component mounts or projectId changes
  useEffect(() => {
    if (projectId && state.currentProjectId !== projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, state.currentProjectId, setCurrentProject]);

  if (!project) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Project not found</h2>
          <p className="text-slate-500 mb-4">The project you're looking for doesn't exist or has been deleted.</p>
          <Link to="/projects" className="text-indigo-600 hover:text-indigo-700">Back to projects</Link>
        </div>
      </AppLayout>
    );
  }
  const tokens = getThemeTokens(project.themeId, project.themeVariant);
  const industry = industries.find(i => i.id === project.industry);

  const tabs: { id: WorkspaceTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'builder', label: 'Builder', icon: Paintbrush },
    { id: 'menus', label: 'Menus', icon: MenuIcon },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'versions', label: 'Versions', icon: History },
    { id: 'export', label: 'Export', icon: Download },
  ];

  const handleSave = useCallback(() => {
    updateProject(project);
    notify('success', 'Project saved');
  }, [project, updateProject, notify]);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-0px)]">
        {/* Workspace Sidebar */}
        <div className="w-56 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-3">
              <ArrowLeft size={14} /> Back to Projects
            </button>
            <h2 className="font-semibold text-slate-900 truncate">{project.name}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <span>{industry?.icon}</span> {industry?.name}
            </p>
          </div>

          <nav className="flex-1 p-2 space-y-0.5 overflow-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-slate-100">
            <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Save size={14} /> Save Project
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {activeTab === 'overview' && <OverviewTab project={project} tokens={tokens} />}
          {activeTab === 'pages' && <PagesTab project={project} updateProject={updateProject} notify={notify} />}
          {activeTab === 'builder' && <BuilderTab project={project} updateProject={updateProject} tokens={tokens} notify={notify} />}
          {activeTab === 'menus' && <MenusTab project={project} updateProject={updateProject} notify={notify} />}
          {activeTab === 'media' && <MediaLibrary project={project} updateProject={updateProject} notify={notify} />}
          {activeTab === 'seo' && <SEOTab project={project} updateProject={updateProject} notify={notify} />}
          {activeTab === 'forms' && <FormBuilder project={project} updateProject={updateProject} notify={notify} />}
          {activeTab === 'analytics' && <AnalyticsConfig project={project} updateProject={updateProject} notify={notify} />}
          {activeTab === 'blog' && <BlogManager project={project} updateProject={updateProject} notify={notify} />}
          {activeTab === 'preview' && <PreviewTab project={project} tokens={tokens} />}
          {activeTab === 'versions' && <VersionsTab project={project} createVersion={createVersion} restoreVersion={restoreVersion} notify={notify} />}
          {activeTab === 'export' && <ExportTab project={project} notify={notify} />}
        </div>
      </div>
    </AppLayout>
  );
}

// OVERVIEW TAB
function OverviewTab({ project, tokens }: { project: any; tokens: DesignTokens }) {
  const industry = industries.find(i => i.id === project.industry);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Project Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Pages</p>
          <p className="text-2xl font-bold text-slate-900">{project.pages.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Menus</p>
          <p className="text-2xl font-bold text-slate-900">{project.menus.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Status</p>
          <p className="text-2xl font-bold text-slate-900 capitalize">{project.status}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Project Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500">Customer:</span> <span className="text-slate-900 ml-2">{project.customer}</span></div>
          <div><span className="text-slate-500">Industry:</span> <span className="text-slate-900 ml-2">{industry?.icon} {industry?.name}</span></div>
          <div><span className="text-slate-500">Theme:</span> <span className="text-slate-900 ml-2 capitalize">{project.themeId}</span></div>
          <div><span className="text-slate-500">Variant:</span> <span className="text-slate-900 ml-2 capitalize">{project.themeVariant}</span></div>
          <div><span className="text-slate-500">Created:</span> <span className="text-slate-900 ml-2">{new Date(project.createdAt).toLocaleDateString()}</span></div>
          <div><span className="text-slate-500">Updated:</span> <span className="text-slate-900 ml-2">{new Date(project.updatedAt).toLocaleDateString()}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-4">
        <h3 className="font-semibold text-slate-900 mb-4">Theme Colors</h3>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(tokens.colors).slice(0, 10).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg border border-slate-200" style={{ backgroundColor: value }} />
              <span className="text-[10px] text-slate-500">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// PAGES TAB
function PagesTab({ project, updateProject, notify }: { project: any; updateProject: any; notify: any }) {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState(false);

  const pages = [...project.pages].sort((a: Page, b: Page) => a.order - b.order);

  const addPage = () => {
    const newPage: Page = {
      id: uuid(),
      title: 'New Page',
      slug: 'new-page-' + Date.now(),
      type: 'home',
      status: 'draft',
      sections: [],
      seo: { title: '', description: '' },
      order: pages.length,
    };
    updateProject({ ...project, pages: [...project.pages, newPage] });
    notify('success', 'Page added');
  };

  const deletePage = (id: string) => {
    if (confirm('Delete this page?')) {
      updateProject({ ...project, pages: project.pages.filter((p: Page) => p.id !== id) });
      notify('success', 'Page deleted');
      if (selectedPage === id) setSelectedPage(null);
    }
  };

  const duplicatePage = (page: Page) => {
    const newPage = { ...page, id: uuid(), title: page.title + ' (Copy)', slug: page.slug + '-copy' };
    updateProject({ ...project, pages: [...project.pages, newPage] });
    notify('success', 'Page duplicated');
  };

  const updatePage = (updated: Page) => {
    updateProject({ ...project, pages: project.pages.map((p: Page) => p.id === updated.id ? updated : p) });
  };

  const selected = pages.find((p: Page) => p.id === selectedPage);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pages</h1>
        <button onClick={addPage} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          <Plus size={16} /> Add Page
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {pages.map((page: Page) => (
              <div
                key={page.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  selectedPage === page.id ? 'bg-indigo-50' : 'hover:bg-slate-50'
                }`}
                onClick={() => setSelectedPage(page.id)}
              >
                <FileText size={16} className="text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{page.title}</p>
                  <p className="text-xs text-slate-500">/{page.slug}</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${page.status === 'published' ? 'bg-green-500' : 'bg-amber-500'}`} />
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); duplicatePage(page); }} className="p-1 text-slate-400 hover:text-indigo-600"><Copy size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); deletePage(page.id); }} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Page Editor */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Edit Page</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selected.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {selected.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input type="text" value={selected.title} onChange={e => updatePage({ ...selected, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                  <input type="text" value={selected.slug} onChange={e => updatePage({ ...selected, slug: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={selected.type} onChange={e => updatePage({ ...selected, type: e.target.value as any })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="home">Home</option>
                    <option value="about">About</option>
                    <option value="services">Services</option>
                    <option value="contact">Contact</option>
                    <option value="pricing">Pricing</option>
                    <option value="faq">FAQ</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="team">Team</option>
                    <option value="blog-listing">Blog Listing</option>
                    <option value="privacy">Privacy</option>
                    <option value="terms">Terms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={selected.status} onChange={e => updatePage({ ...selected, status: e.target.value as any })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SEO Title</label>
                <input type="text" value={selected.seo.title} onChange={e => updatePage({ ...selected, seo: { ...selected.seo, title: e.target.value } })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                <textarea value={selected.seo.description} onChange={e => updatePage({ ...selected, seo: { ...selected.seo, description: e.target.value } })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="pt-2 text-sm text-slate-500">
                <p>Sections: {selected.sections.length}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <FileText size={32} className="mx-auto mb-3 text-slate-300" />
              <p>Select a page to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// BUILDER TAB
function BuilderTab({ project, updateProject, tokens, notify }: { project: any; updateProject: any; tokens: DesignTokens; notify: any }) {
  const [selectedPageId, setSelectedPageId] = useState(project.pages[0]?.id || '');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showAddSection, setShowAddSection] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showAnimationPanel, setShowAnimationPanel] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [showComponentProperties, setShowComponentProperties] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>(new Date().toISOString());
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [historyState, setHistoryState] = useState(0); // Force re-render on undo/redo

  // Initialize managers
  const historyManager = React.useMemo(() => new HistoryManager(project.pages), []);
  const autoSaveManager = React.useMemo(
    () => new AutoSaveManager(() => {
      setIsSaving(true);
      setTimeout(() => {
        setLastSaved(new Date().toISOString());
        setIsSaving(false);
      }, 500);
    }, 2000),
    []
  );
  const keyboardManager = React.useMemo(() => new KeyboardShortcutManager(), []);

  const page = project.pages.find((p: Page) => p.id === selectedPageId);
  if (!page) return <div className="p-8 text-center text-slate-500">No page selected</div>;

  // Set up keyboard shortcuts
  useEffect(() => {
    const shortcuts = createBuilderShortcuts(
      handleUndo,
      handleRedo,
      () => {
        updateProject(project);
        notify('success', 'Project saved');
      },
      () => {
        if (selectedSectionId) {
          const section = page.sections.find((s: Section) => s.id === selectedSectionId);
          if (section) duplicateSection(section);
        }
      },
      () => {
        if (selectedSectionId) {
          deleteSection(selectedSectionId);
        }
      },
      () => setShowAddSection(true),
      handleCopyComponent,
      handlePasteComponent,
      handleCutComponent
    );

    shortcuts.forEach(shortcut => keyboardManager.register(shortcut));

    // Add global search shortcut (Ctrl+K or Cmd+K)
    const handleGlobalSearchShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
      if (e.key === 'Escape') {
        setShowGlobalSearch(false);
      }
    };

    window.addEventListener('keydown', handleGlobalSearchShortcut);

    return () => {
      keyboardManager.destroy();
      autoSaveManager.destroy();
      window.removeEventListener('keydown', handleGlobalSearchShortcut);
    };
  }, [selectedSectionId, page]);

  // Helper to update pages and push to history
  const updatePages = (newPages: Page[], action: string = 'Update') => {
    historyManager.push(newPages, action);
    updateProject({ ...project, pages: newPages });
    autoSaveManager.trigger();
    setHistoryState(prev => prev + 1);
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    const previousPages = historyManager.undo();
    if (previousPages) {
      updateProject({ ...project, pages: previousPages });
      setHistoryState(prev => prev + 1);
      notify('info', 'Undone');
    }
  };

  const handleRedo = () => {
    const nextPages = historyManager.redo();
    if (nextPages) {
      updateProject({ ...project, pages: nextPages });
      setHistoryState(prev => prev + 1);
      notify('info', 'Redone');
    }
  };

  const addSection = (type: string) => {
    const newSection: Section = {
      id: uuid(),
      type: type as any,
      variant: 'default',
      settings: { padding: '4rem 0', textAlign: 'center' },
      rows: [{
        id: uuid(),
        columns: [{
          id: uuid(),
          width: 100,
          components: [
            { id: uuid(), type: 'heading', props: { text: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`, level: 2, size: '2xl' } },
            { id: uuid(), type: 'paragraph', props: { text: 'Edit this content to customize your section.' } },
          ],
        }],
      }],
      animation: { type: 'none', duration: 500, delay: 0 },
    };
    const updatedPages = project.pages.map((p: Page) =>
      p.id === selectedPageId ? { ...p, sections: [...p.sections, newSection] } : p
    );
    updatePages(updatedPages, 'Add Section');
    setShowAddSection(false);
    notify('success', 'Section added');
  };

  const deleteSection = (sectionId: string) => {
    const updatedPages = project.pages.map((p: Page) =>
      p.id === selectedPageId ? { ...p, sections: p.sections.filter(s => s.id !== sectionId) } : p
    );
    updatePages(updatedPages, 'Delete Section');
    if (selectedSectionId === sectionId) setSelectedSectionId(null);
    notify('success', 'Section removed');
  };

  const duplicateSection = (section: Section) => {
    const newSection = { ...section, id: uuid() };
    const updatedPages = project.pages.map((p: Page) =>
      p.id === selectedPageId ? { ...p, sections: [...p.sections, newSection] } : p
    );
    updatePages(updatedPages, 'Duplicate Section');
    notify('success', 'Section duplicated');
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const sections = [...page.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    const updatedPages = project.pages.map((p: Page) =>
      p.id === selectedPageId ? { ...p, sections } : p
    );
    updatePages(updatedPages, 'Move Section');
  };

  const updateComponent = (sectionId: string, rowId: string, colId: string, compId: string, newProps: any) => {
    const updatedPages = project.pages.map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            rows: s.rows.map(r => {
              if (r.id !== rowId) return r;
              return {
                ...r,
                columns: r.columns.map(c => {
                  if (c.id !== colId) return c;
                  return {
                    ...c,
                    components: c.components.map(comp =>
                      comp.id === compId ? { ...comp, props: { ...comp.props, ...newProps } } : comp
                    ),
                  };
                }),
              };
            }),
          };
        }),
      };
    });
    updatePages(updatedPages, 'Update Component');
  };

  // Panel handlers
  const handleUpdateSectionSettings = (sectionId: string, settings: any) => {
    const updatedPages = project.pages.map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => {
          if (s.id !== sectionId) return s;
          return { ...s, settings: { ...s.settings, ...settings } };
        }),
      };
    });
    updatePages(updatedPages, 'Update Section Settings');
  };

  const handleUpdateAnimation = (sectionId: string, animation: AnimationSettings | undefined) => {
    const updatedPages = project.pages.map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => {
          if (s.id !== sectionId) return s;
          return { ...s, animation };
        }),
      };
    });
    updatePages(updatedPages, 'Update Animation');
  };

  const handleToggleVisibility = (sectionId: string) => {
    const updatedPages = project.pages.map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => {
          if (s.id !== sectionId) return s;
          return { ...s, settings: { ...s.settings, visible: s.settings.visible === false ? true : false } };
        }),
      };
    });
    updatePages(updatedPages, 'Toggle Visibility');
  };

  // Component selection and property handlers
  const handleComponentClick = (componentId: string) => {
    setSelectedComponentId(componentId);
    setShowComponentProperties(true);
  };

  const handleComponentPropertyUpdate = (newProps: any) => {
    if (!selectedComponentId || !selectedSectionId) return;
    
    // Find the component in the current page
    const section = page.sections.find((s: Section) => s.id === selectedSectionId);
    if (!section) return;

    // Find which row and column contains this component
    for (const row of section.rows) {
      for (const col of row.columns) {
        const comp = col.components.find((c: any) => c.id === selectedComponentId);
        if (comp) {
          updateComponent(selectedSectionId, row.id, col.id, selectedComponentId, newProps);
          return;
        }
      }
    }
  };

  // Component operation handlers
  const handleComponentDuplicate = () => {
    if (!selectedComponentId || !selectedSectionId) return;
    
    const updatedPages = project.pages.map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => {
          if (s.id !== selectedSectionId) return s;
          return {
            ...s,
            rows: s.rows.map(r => {
              return {
                ...r,
                columns: r.columns.map(c => {
                  const compIndex = c.components.findIndex((comp: any) => comp.id === selectedComponentId);
                  if (compIndex === -1) return c;
                  
                  const originalComp = c.components[compIndex];
                  const duplicatedComp = {
                    ...originalComp,
                    id: uuid(),
                  };
                  
                  const newComponents = [...c.components];
                  newComponents.splice(compIndex + 1, 0, duplicatedComp);
                  
                  return { ...c, components: newComponents };
                }),
              };
            }),
          };
        }),
      };
    });
    
    updatePages(updatedPages, 'Duplicate Component');
    notify('success', 'Component duplicated');
  };

  const handleComponentDelete = () => {
    if (!selectedComponentId || !selectedSectionId) return;
    
    const updatedPages = project.pages.map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => {
          if (s.id !== selectedSectionId) return s;
          return {
            ...s,
            rows: s.rows.map(r => {
              return {
                ...r,
                columns: r.columns.map(c => {
                  return {
                    ...c,
                    components: c.components.filter((comp: any) => comp.id !== selectedComponentId),
                  };
                }),
              };
            }),
          };
        }),
      };
    });
    
    updatePages(updatedPages, 'Delete Component');
    setSelectedComponentId(null);
    setShowComponentProperties(false);
    notify('success', 'Component deleted');
  };

  const handleComponentMoveUp = () => {
    if (!selectedComponentId || !selectedSectionId) return;
    
    const updatedPages = project.pages.map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => {
          if (s.id !== selectedSectionId) return s;
          return {
            ...s,
            rows: s.rows.map(r => {
              return {
                ...r,
                columns: r.columns.map(c => {
                  const compIndex = c.components.findIndex((comp: any) => comp.id === selectedComponentId);
                  if (compIndex <= 0) return c;
                  
                  const newComponents = [...c.components];
                  [newComponents[compIndex - 1], newComponents[compIndex]] = [newComponents[compIndex], newComponents[compIndex - 1]];
                  
                  return { ...c, components: newComponents };
                }),
              };
            }),
          };
        }),
      };
    });
    
    updatePages(updatedPages, 'Move Component Up');
  };

  const handleComponentMoveDown = () => {
    if (!selectedComponentId || !selectedSectionId) return;
    
    const updatedPages = project.pages.map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => {
          if (s.id !== selectedSectionId) return s;
          return {
            ...s,
            rows: s.rows.map(r => {
              return {
                ...r,
                columns: r.columns.map(c => {
                  const compIndex = c.components.findIndex((comp: any) => comp.id === selectedComponentId);
                  if (compIndex === -1 || compIndex >= c.components.length - 1) return c;
                  
                  const newComponents = [...c.components];
                  [newComponents[compIndex], newComponents[compIndex + 1]] = [newComponents[compIndex + 1], newComponents[compIndex]];
                  
                  return { ...c, components: newComponents };
                }),
              };
            }),
          };
        }),
      };
    });
    
    updatePages(updatedPages, 'Move Component Down');
  };

  // Clipboard handlers
  const handleCopyComponent = () => {
    if (!selectedComponentId || !selectedSectionId) return;
    
    const section = page.sections.find((s: Section) => s.id === selectedSectionId);
    if (!section) return;

    for (const row of section.rows) {
      for (const col of row.columns) {
        const comp = col.components.find((c: any) => c.id === selectedComponentId);
        if (comp) {
          copyComponentToClipboard(comp);
          notify('success', 'Component copied to clipboard');
          return;
        }
      }
    }
  };

  const handlePasteComponent = () => {
    if (!selectedSectionId) {
      notify('error', 'Please select a section first');
      return;
    }

    const component = pasteComponentFromClipboard();
    if (!component) {
      notify('error', 'No component in clipboard');
      return;
    }

    const updatedPages = project.pages.map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => {
          if (s.id !== selectedSectionId) return s;
          return {
            ...s,
            rows: s.rows.map((r, rowIndex) => {
              if (rowIndex === 0 && r.columns.length > 0) {
                return {
                  ...r,
                  columns: r.columns.map((c, colIndex) => {
                    if (colIndex === 0) {
                      return { ...c, components: [...c.components, component] };
                    }
                    return c;
                  }),
                };
              }
              return r;
            }),
          };
        }),
      };
    });

    updatePages(updatedPages, 'Paste Component');
    notify('success', 'Component pasted');
  };

  const handleCutComponent = () => {
    if (!selectedComponentId || !selectedSectionId) return;
    
    // First copy the component
    handleCopyComponent();
    
    // Then delete it
    handleComponentDelete();
  };

  // Template insertion handler
  const handleInsertTemplateComponent = (component: any) => {
    if (!selectedSectionId) {
      notify('error', 'Please select a section first');
      return;
    }

    const updatedPages = project.pages.map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => {
          if (s.id !== selectedSectionId) return s;
          return {
            ...s,
            rows: s.rows.map((r, rowIndex) => {
              if (rowIndex === 0 && r.columns.length > 0) {
                return {
                  ...r,
                  columns: r.columns.map((c, colIndex) => {
                    if (colIndex === 0) {
                      return { ...c, components: [...c.components, component] };
                    }
                    return c;
                  }),
                };
              }
              return r;
            }),
          };
        }),
      };
    });

    updatePages(updatedPages, 'Insert Template Component');
    notify('success', 'Template component inserted');
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = page.sections.findIndex((s: Section) => s.id === active.id);
    const newIndex = page.sections.findIndex((s: Section) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newSections = [...page.sections];
    const [movedSection] = newSections.splice(oldIndex, 1);
    newSections.splice(newIndex, 0, movedSection);

    const updatedPages = project.pages.map((p: Page) =>
      p.id === selectedPageId ? { ...p, sections: newSections } : p
    );
    updatePages(updatedPages, 'Reorder Sections');
  };

  // Component library handler
  const handleComponentSelect = (componentType: string) => {
    if (!selectedSectionId) {
      notify('error', 'Please select a section first');
      return;
    }

    // Create default props based on component type
    const getDefaultProps = (type: string) => {
      switch (type) {
        case 'heading':
          return { text: 'New Heading', level: 2, size: '2xl' };
        case 'paragraph':
          return { text: 'This is a new paragraph. Click to edit.' };
        case 'text':
          return { text: 'Multi-line text block content goes here.' };
        case 'image':
          return { src: '', alt: 'Image description' };
        case 'video':
          return { src: '', title: 'Video title' };
        case 'button':
          return { text: 'Click Me', variant: 'primary', url: '#' };
        case 'button-group':
          return { buttons: [{ text: 'Button 1', variant: 'primary' }, { text: 'Button 2', variant: 'outline' }] };
        case 'card':
          return { title: 'Card Title', description: 'Card description goes here.' };
        case 'stat':
          return { value: '0', label: 'Statistic Label' };
        case 'list':
          return { items: ['Item 1', 'Item 2', 'Item 3'], ordered: false };
        case 'badge':
          return { text: 'Badge', variant: 'default' };
        case 'gallery':
          return { images: [] };
        case 'logo-cloud':
          return { logos: [] };
        default:
          return {};
      }
    };

    const newComponent = {
      id: uuid(),
      type: componentType,
      props: getDefaultProps(componentType),
    };

    const updatedPages = project.pages.map((p: Page) => {
      if (p.id !== selectedPageId) return p;
      return {
        ...p,
        sections: p.sections.map((s: Section) => {
          if (s.id !== selectedSectionId) return s;
          // Add component to the first column of the first row
          if (s.rows.length === 0) {
            return {
              ...s,
              rows: [{
                id: uuid(),
                columns: [{
                  id: uuid(),
                  width: 100,
                  components: [newComponent],
                }],
              }],
            };
          }
          return {
            ...s,
            rows: s.rows.map((r, idx) => {
              if (idx === 0 && r.columns.length > 0) {
                return {
                  ...r,
                  columns: r.columns.map((c, cIdx) => {
                    if (cIdx === 0) {
                      return { ...c, components: [...c.components, newComponent] };
                    }
                    return c;
                  }),
                };
              }
              return r;
            }),
          };
        }),
      };
    });

    updatePages(updatedPages, `Add ${componentType} Component`);
    notify('success', `${componentType} component added`);
  };

  const deviceWidths = { desktop: '100%', tablet: '768px', mobile: '375px' };

  const sectionTypes = [
    { type: 'hero', label: 'Hero', icon: '🎯' },
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'image-text', label: 'Image + Text', icon: '🖼️' },
    { type: 'services', label: 'Services', icon: '⚡' },
    { type: 'features', label: 'Features', icon: '✨' },
    { type: 'testimonials', label: 'Testimonials', icon: '💬' },
    { type: 'statistics', label: 'Statistics', icon: '📊' },
    { type: 'faq', label: 'FAQ', icon: '❓' },
    { type: 'cta', label: 'Call to Action', icon: '📢' },
    { type: 'team', label: 'Team', icon: '👥' },
    { type: 'pricing', label: 'Pricing', icon: '💰' },
    { type: 'gallery', label: 'Gallery', icon: '🖼️' },
    { type: 'contact', label: 'Contact', icon: '📧' },
    { type: 'cards', label: 'Cards', icon: '🃏' },
    { type: 'timeline', label: 'Timeline', icon: '📅' },
    { type: 'process', label: 'Process', icon: '🔄' },
  ];

  const generateAIContent = async () => {
    if (!page) return;
    setGeneratingAI(true);
    try {
      const { aiProvider } = await import('../services/ai');
      const content = await aiProvider.generatePageContent(project.industry, page.type, project.seo.siteTitle || project.name);

      // Generate sections from AI content
      const newSections: Section[] = content.sections.map(sectionContent => {
        const section: Section = {
          id: uuid(),
          type: sectionContent.type as any,
          variant: 'default',
          settings: { padding: '4rem 0', textAlign: 'center' },
          rows: [{
            id: uuid(),
            columns: [{
              id: uuid(),
              width: 100,
              components: [],
            }],
          }],
          animation: { type: 'fade', duration: 600, delay: 0 },
        };

        // Add heading
        if (sectionContent.heading) {
          section.rows[0].columns[0].components.push({
            id: uuid(),
            type: 'heading',
            props: { text: sectionContent.heading, level: 2, size: '3xl' },
          });
        }

        // Add content/items
        if (sectionContent.items && sectionContent.items.length > 0) {
          if (sectionContent.type === 'services' || sectionContent.type === 'cards') {
            section.rows[0].columns[0].components.push({
              id: uuid(),
              type: 'card',
              props: { cards: sectionContent.items.map(item => ({ title: item.title, description: item.description, icon: item.icon || '⭐' })) },
            });
          } else if (sectionContent.type === 'statistics') {
            section.rows[0].columns[0].components.push({
              id: uuid(),
              type: 'stat',
              props: { stats: sectionContent.items.map(item => ({ value: item.title, label: item.description })) },
            });
          } else if (sectionContent.type === 'testimonials') {
            section.rows[0].columns[0].components.push({
              id: uuid(),
              type: 'testimonial',
              props: { testimonials: sectionContent.items.map(item => ({ name: item.title, role: '', text: item.description })) },
            });
          }
        } else if (sectionContent.content) {
          section.rows[0].columns[0].components.push({
            id: uuid(),
            type: 'paragraph',
            props: { text: sectionContent.content },
          });
        }

        return section;
      });

      // Add hero section if content has hero title
      if (content.heroTitle) {
        const heroSection: Section = {
          id: uuid(),
          type: 'hero',
          variant: 'default',
          settings: { background: 'gradient', padding: '6rem 0', textAlign: 'center', fullWidth: true },
          rows: [{
            id: uuid(),
            columns: [{
              id: uuid(),
              width: 100,
              components: [
                { id: uuid(), type: 'heading', props: { text: content.heroTitle, level: 1, size: '5xl' } },
                { id: uuid(), type: 'paragraph', props: { text: content.heroSubtitle || '' } },
                { id: uuid(), type: 'button-group', props: { buttons: [{ label: 'Get Started', variant: 'primary' }, { label: 'Learn More', variant: 'outline' }] } },
              ],
            }],
          }],
          animation: { type: 'fade', duration: 800, delay: 0 },
        };
        newSections.unshift(heroSection);
      }

      // Update page with new sections
      const updatedPages = project.pages.map((p: Page) =>
        p.id === selectedPageId ? { ...p, sections: newSections } : p
      );
      updatePages(updatedPages, 'AI Generate Content');
      notify('success', 'AI content generated successfully');
    } catch (err) {
      notify('error', `AI generation failed: ${err}`);
    }
    setGeneratingAI(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Builder Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4">
        <select
          value={selectedPageId}
          onChange={e => { setSelectedPageId(e.target.value); setSelectedSectionId(null); }}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {project.pages.map((p: Page) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded ${device === 'desktop' ? 'bg-white shadow-sm' : ''}`}><Monitor size={16} /></button>
          <button onClick={() => setDevice('tablet')} className={`p-1.5 rounded ${device === 'tablet' ? 'bg-white shadow-sm' : ''}`}><Tablet size={16} /></button>
          <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded ${device === 'mobile' ? 'bg-white shadow-sm' : ''}`}><Smartphone size={16} /></button>
        </div>

        <div className="flex-1" />

        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
          <button
            onClick={handleUndo}
            disabled={!historyManager.canUndo()}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>
          <button
            onClick={handleRedo}
            disabled={!historyManager.canRedo()}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>
        </div>

        <button
          onClick={() => setShowGlobalSearch(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg"
          title="Search across all pages (Ctrl+K)"
        >
          <Search size={14} /> Search
        </button>

        <button
          onClick={generateAIContent}
          disabled={generatingAI}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
          title="Generate AI content for this page"
        >
          <Zap size={14} /> {generatingAI ? 'Generating...' : 'AI Content'}
        </button>

        <button
          onClick={() => setShowComponentLibrary(true)}
          disabled={!selectedSectionId}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title={selectedSectionId ? 'Add component to selected section' : 'Select a section first'}
        >
          <Package size={14} /> Components
        </button>

        <button
          onClick={() => setShowTemplatesPanel(true)}
          disabled={!selectedSectionId}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title={selectedSectionId ? 'Insert component template' : 'Select a section first'}
        >
          <Layers size={14} /> Templates
        </button>

        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
          <button
            onClick={handleCopyComponent}
            disabled={!selectedComponentId}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Copy component (Ctrl+C)"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={handlePasteComponent}
            disabled={!selectedSectionId || !hasClipboardContent()}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Paste component (Ctrl+V)"
          >
            <Package size={16} />
          </button>
        </div>

        <button onClick={() => setShowAddSection(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          <Plus size={14} /> Add Section
        </button>
      </div>

      {/* Builder Canvas */}
      <div className="flex-1 overflow-auto p-6 bg-slate-100">
        <div className="mx-auto transition-all duration-300" style={{ maxWidth: deviceWidths[device] }}>
          {/* Render sections */}
          {page.sections.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
              <Layers size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 mb-4">No sections yet. Add your first section to start building.</p>
              <button onClick={() => setShowAddSection(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                <Plus size={16} /> Add Section
              </button>
            </div>
          ) : (
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="space-y-2">
                {page.sections.map((section: Section, index: number) => (
                <DraggableSection key={section.id} id={section.id} isSelected={selectedSectionId === section.id} onClick={() => setSelectedSectionId(section.id)}>
                  {/* Section Controls */}
                  <div className="absolute -top-3 left-2 z-10 hidden group-hover:flex items-center gap-1 bg-white rounded-md shadow-md border border-slate-200 px-1 py-0.5">
                    <span className="text-[10px] font-medium text-slate-500 px-1 capitalize">{section.type}</span>
                    <button onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }} className="p-0.5 text-slate-400 hover:text-slate-700 text-[10px]">↑</button>
                    <button onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }} className="p-0.5 text-slate-400 hover:text-slate-700 text-[10px]">↓</button>
                    <button onClick={(e) => { e.stopPropagation(); setShowSettingsPanel(true); }} className="p-0.5 text-slate-400 hover:text-blue-600" title="Settings"><Settings size={10} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setShowAnimationPanel(true); }} className="p-0.5 text-slate-400 hover:text-purple-600" title="Animation"><Zap size={10} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setShowQuickActions(true); }} className="p-0.5 text-slate-400 hover:text-indigo-600" title="Quick Actions"><Star size={10} /></button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateSection(section); }} className="p-0.5 text-slate-400 hover:text-indigo-600"><Copy size={10} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} className="p-0.5 text-slate-400 hover:text-red-500"><Trash2 size={10} /></button>
                  </div>

                  {/* Section Content */}
                  <SectionRenderer 
                    section={section} 
                    tokens={tokens} 
                    editable={true} 
                    onUpdate={(rowId, colId, compId, newProps) => updateComponent(section.id, rowId, colId, compId, newProps)} 
                    onComponentClick={handleComponentClick}
                    selectedComponentId={selectedComponentId}
                    onComponentDuplicate={handleComponentDuplicate}
                    onComponentDelete={handleComponentDelete}
                    onComponentMoveUp={handleComponentMoveUp}
                    onComponentMoveDown={handleComponentMoveDown}
                  />
                </DraggableSection>
              ))}
              </div>
            </DndContext>
          )}
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Add Section</h3>
              <button onClick={() => setShowAddSection(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-5 grid grid-cols-3 gap-3">
              {sectionTypes.map(st => (
                <button
                  key={st.type}
                  onClick={() => addSection(st.type)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center"
                >
                  <span className="text-2xl block mb-1">{st.icon}</span>
                  <span className="text-xs font-medium text-slate-700">{st.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Component Library Modal */}
      <ComponentLibrary
        isOpen={showComponentLibrary}
        onClose={() => setShowComponentLibrary(false)}
        onSelect={handleComponentSelect}
      />

      {/* Component Templates Panel */}
      <ComponentTemplatesPanel
        isOpen={showTemplatesPanel}
        onClose={() => setShowTemplatesPanel(false)}
        onInsert={handleInsertTemplateComponent}
        currentComponent={selectedComponentId ? (() => {
          if (!selectedSectionId) return undefined;
          const section = page.sections.find((s: Section) => s.id === selectedSectionId);
          if (!section) return undefined;
          for (const row of section.rows) {
            for (const col of row.columns) {
              const comp = col.components.find((c: any) => c.id === selectedComponentId);
              if (comp) return comp;
            }
          }
          return undefined;
        })() : undefined}
      />

      {/* Component Properties Panel */}
      {showComponentProperties && selectedComponentId && selectedSectionId && (() => {
        const section = page.sections.find((s: Section) => s.id === selectedSectionId);
        if (!section) return null;
        
        let selectedComponent = null;
        for (const row of section.rows) {
          for (const col of row.columns) {
            const comp = col.components.find((c: any) => c.id === selectedComponentId);
            if (comp) {
              selectedComponent = comp;
              break;
            }
          }
          if (selectedComponent) break;
        }
        
        if (!selectedComponent) return null;
        
        return (
          <ComponentPropertiesPanel
            component={selectedComponent}
            onUpdate={handleComponentPropertyUpdate}
            onClose={() => {
              setShowComponentProperties(false);
              setSelectedComponentId(null);
            }}
          />
        );
      })()}

      {/* Global Search */}
      <GlobalSearch
        pages={project.pages}
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        onNavigate={(pageId, sectionId, componentId) => {
          // Navigate to the page
          setSelectedPageId(pageId);
          
          // If section is specified, select it
          if (sectionId) {
            setSelectedSectionId(sectionId);
          }
          
          // If component is specified, select it and open properties
          if (componentId && sectionId) {
            setSelectedComponentId(componentId);
            setShowComponentProperties(true);
          }
          
          notify('info', 'Navigated to item');
        }}
      />

      {/* Settings Panel */}
      {showSettingsPanel && selectedSectionId && (
        <SectionSettingsPanel
          section={page.sections.find((s: Section) => s.id === selectedSectionId)!}
          onUpdate={(settings) => handleUpdateSectionSettings(selectedSectionId, settings)}
          onClose={() => setShowSettingsPanel(false)}
        />
      )}

      {/* Animation Panel */}
      {showAnimationPanel && selectedSectionId && (
        <AnimationSettingsPanel
          section={page.sections.find((s: Section) => s.id === selectedSectionId)!}
          onUpdate={(animation) => handleUpdateAnimation(selectedSectionId, animation)}
          onClose={() => setShowAnimationPanel(false)}
        />
      )}

      {/* Quick Actions Panel */}
      {showQuickActions && selectedSectionId && (
        <QuickActionsPanel
          section={page.sections.find((s: Section) => s.id === selectedSectionId)!}
          onDuplicate={() => {
            const section = page.sections.find((s: Section) => s.id === selectedSectionId);
            if (section) duplicateSection(section);
          }}
          onDelete={() => deleteSection(selectedSectionId)}
          onMoveUp={() => {
            const index = page.sections.findIndex((s: Section) => s.id === selectedSectionId);
            if (index > 0) moveSection(index, 'up');
          }}
          onMoveDown={() => {
            const index = page.sections.findIndex((s: Section) => s.id === selectedSectionId);
            if (index < page.sections.length - 1) moveSection(index, 'down');
          }}
          onToggleVisibility={() => handleToggleVisibility(selectedSectionId)}
          onOpenSettings={() => {
            setShowQuickActions(false);
            setShowSettingsPanel(true);
          }}
          onOpenAnimation={() => {
            setShowQuickActions(false);
            setShowAnimationPanel(true);
          }}
        />
      )}

      {/* Status Bar */}
      <BuilderStatusBar
        page={page}
        lastSaved={lastSaved}
        isSaving={isSaving}
        sectionCount={page.sections.length}
      />
    </div>
  );
}

// Section Renderer
function SectionRenderer({ section, tokens, editable, onUpdate, onComponentClick, selectedComponentId, onComponentDuplicate, onComponentDelete, onComponentMoveUp, onComponentMoveDown }: { section: Section; tokens: DesignTokens; editable?: boolean; onUpdate?: (rowId: string, colId: string, compId: string, props: any) => void; onComponentClick?: (compId: string) => void; selectedComponentId?: string | null; onComponentDuplicate?: () => void; onComponentDelete?: () => void; onComponentMoveUp?: () => void; onComponentMoveDown?: () => void }) {
  const bgStyle = section.settings.background === 'gradient'
    ? { background: `linear-gradient(135deg, ${tokens.colors.primary}, ${tokens.colors.primaryDark})` }
    : section.settings.backgroundImage
    ? { backgroundImage: `url(${section.settings.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: tokens.colors.background };

  const textColor = section.settings.background === 'gradient' ? '#ffffff' : tokens.colors.text;

  return (
    <div style={{ ...bgStyle, padding: section.settings.padding || '3rem 1.5rem' }}>
      <div style={{ maxWidth: section.settings.fullWidth ? '100%' : tokens.spacing.container, margin: '0 auto' }}>
        {section.rows.map(row => (
          <div key={row.id} className="flex flex-wrap" style={{ gap: row.gap || tokens.spacing.gap }}>
            {row.columns.map(col => {
              const allComponents = col.components;
              return (
                <div key={col.id} style={{ width: `${col.width}%`, minWidth: col.width < 100 ? '250px' : '100%' }} className="flex-1">
                  {col.components.map((comp, compIndex) => {
                    const isSelected = selectedComponentId === comp.id;
                    const canMoveUp = compIndex > 0;
                    const canMoveDown = compIndex < allComponents.length - 1;
                    
                    return (
                      <div
                        key={comp.id}
                        onClick={(e) => {
                          if (editable && onComponentClick) {
                            e.stopPropagation();
                            onComponentClick(comp.id);
                          }
                        }}
                        className={`relative ${editable ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:ring-offset-2 rounded transition-all' : ''} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                      >
                        <ComponentRenderer
                          component={comp}
                          tokens={tokens}
                          textColor={textColor}
                          editable={editable}
                          onUpdate={(newProps) => onUpdate?.(row.id, col.id, comp.id, newProps)}
                        />
                        {editable && isSelected && onComponentDuplicate && onComponentDelete && onComponentMoveUp && onComponentMoveDown && (
                          <ComponentOperations
                            onDuplicate={onComponentDuplicate}
                            onDelete={onComponentDelete}
                            onMoveUp={onComponentMoveUp}
                            onMoveDown={onComponentMoveDown}
                            canMoveUp={canMoveUp}
                            canMoveDown={canMoveDown}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Component Renderer
function ComponentRenderer({ component, tokens, textColor, editable, onUpdate }: { component: any; tokens: DesignTokens; textColor: string; editable?: boolean; onUpdate?: (props: any) => void }) {
  const { type, props } = component;

  switch (type) {
    case 'heading':
      const Tag = `h${props.level || 2}` as any;
      const sizeMap: Record<string, string> = { '5xl': '3rem', '4xl': '2.5rem', '3xl': '2rem', '2xl': '1.5rem', 'xl': '1.25rem' };
      return editable ? (
        <Tag
          contentEditable
          suppressContentEditableWarning
          onBlur={(e: any) => onUpdate?.({ text: e.target.innerText })}
          style={{ fontFamily: tokens.typography.headingFont, fontWeight: tokens.typography.headingWeight, fontSize: sizeMap[props.size] || '2rem', color: textColor, marginBottom: '0.75rem', lineHeight: '1.2' }}
        >
          {props.text}
        </Tag>
      ) : (
        <Tag style={{ fontFamily: tokens.typography.headingFont, fontWeight: tokens.typography.headingWeight, fontSize: sizeMap[props.size] || '2rem', color: textColor, marginBottom: '0.75rem', lineHeight: '1.2' }}>
          {props.text}
        </Tag>
      );

    case 'paragraph':
      return editable ? (
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e: any) => onUpdate?.({ text: e.target.innerText })}
          style={{ fontFamily: tokens.typography.bodyFont, fontSize: tokens.typography.bodySize, color: textColor, opacity: 0.85, lineHeight: tokens.typography.lineHeight, marginBottom: '1rem', maxWidth: '600px', margin: '0 auto 1rem' }}
        >
          {props.text}
        </p>
      ) : (
        <p style={{ fontFamily: tokens.typography.bodyFont, fontSize: tokens.typography.bodySize, color: textColor, opacity: 0.85, lineHeight: tokens.typography.lineHeight, marginBottom: '1rem', maxWidth: '600px', margin: '0 auto 1rem' }}>
          {props.text}
        </p>
      );

    case 'text':
      return (
        <div style={{ fontFamily: tokens.typography.bodyFont, fontSize: tokens.typography.bodySize, color: textColor, opacity: 0.85, lineHeight: '1.8', whiteSpace: 'pre-line' }}>
          {props.text}
        </div>
      );

    case 'button-group':
      return (
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {(props.buttons || []).map((btn: any, i: number) => (
            <button
              key={i}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: tokens.borderRadius,
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
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

    case 'image':
      return (
        <div className="mb-4">
          {props.src ? (
            <img src={props.src} alt={props.alt || ''} style={{ width: '100%', borderRadius: tokens.borderRadius, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '200px', backgroundColor: tokens.colors.surfaceAlt, borderRadius: tokens.borderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.textMuted }}>
              🖼️ Image placeholder
            </div>
          )}
        </div>
      );

    case 'card':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {(props.cards || []).map((card: any, i: number) => (
            <div key={i} style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.borderRadius, padding: '1.5rem', border: `1px solid ${tokens.colors.border}`, textAlign: 'center' }}>
              {card.icon && <span className="text-3xl mb-3 block">{card.icon}</span>}
              {card.image && <img src={card.image} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: tokens.borderRadius, marginBottom: '1rem' }} />}
              <h4 style={{ fontWeight: '600', color: textColor, marginBottom: '0.5rem' }}>{card.title}</h4>
              <p style={{ fontSize: '0.875rem', color: textColor, opacity: 0.7 }}>{card.description}</p>
            </div>
          ))}
        </div>
      );

    case 'stat':
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
          {(props.stats || []).map((stat: any, i: number) => (
            <div key={i} className="text-center">
              <p style={{ fontSize: '2.5rem', fontWeight: '800', color: tokens.colors.primary, lineHeight: '1' }}>{stat.value}</p>
              <p style={{ fontSize: '0.875rem', color: textColor, opacity: 0.7, marginTop: '0.5rem' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      );

    case 'testimonial':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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

    case 'team-member':
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          {(props.members || []).map((m: any, i: number) => (
            <div key={i} className="text-center">
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: tokens.colors.surfaceAlt, margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                👤
              </div>
              <p style={{ fontWeight: '600', color: textColor, fontSize: '0.875rem' }}>{m.name}</p>
              <p style={{ fontSize: '0.75rem', color: textColor, opacity: 0.6 }}>{m.role}</p>
            </div>
          ))}
        </div>
      );

    case 'pricing-card':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {(props.plans || []).map((plan: any, i: number) => (
            <div key={i} style={{
              backgroundColor: plan.popular ? tokens.colors.primary : tokens.colors.surface,
              color: plan.popular ? '#ffffff' : textColor,
              borderRadius: tokens.borderRadius,
              padding: '2rem',
              border: `1px solid ${plan.popular ? tokens.colors.primary : tokens.colors.border}`,
              textAlign: 'center',
              position: 'relative',
            }}>
              {plan.popular && <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: tokens.colors.accent, color: '#fff', padding: '2px 12px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: '600' }}>Popular</span>}
              <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{plan.name}</h4>
              <p style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>{plan.price}</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1.5rem' }}>{plan.period}</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '1.5rem' }}>
                {(plan.features || []).map((f: string, fi: number) => (
                  <li key={fi} style={{ padding: '0.4rem 0', fontSize: '0.85rem', borderBottom: `1px solid ${plan.popular ? 'rgba(255,255,255,0.1)' : tokens.colors.border}` }}>✓ {f}</li>
                ))}
              </ul>
              <button style={{
                width: '100%', padding: '0.6rem', borderRadius: tokens.borderRadius, fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
                backgroundColor: plan.popular ? '#ffffff' : tokens.colors.primary,
                color: plan.popular ? tokens.colors.primary : '#ffffff',
                border: 'none',
              }}>Get Started</button>
            </div>
          ))}
        </div>
      );

    case 'faq-item':
      return (
        <div className="mt-6 max-w-2xl mx-auto space-y-3">
          {(props.items || []).map((item: any, i: number) => (
            <details key={i} style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.borderRadius, border: `1px solid ${tokens.colors.border}`, padding: '1rem 1.25rem' }}>
              <summary style={{ fontWeight: '600', color: textColor, cursor: 'pointer', fontSize: '0.95rem' }}>{item.question}</summary>
              <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: textColor, opacity: 0.75, lineHeight: '1.7' }}>{item.answer}</p>
            </details>
          ))}
        </div>
      );

    case 'form-field':
      return (
        <div className="mt-4 space-y-3 max-w-md">
          <input type="text" placeholder="Your Name" style={{ width: '100%', padding: '0.75rem', borderRadius: tokens.borderRadius, border: `1px solid ${tokens.colors.border}`, fontSize: '0.9rem' }} />
          <input type="email" placeholder="Your Email" style={{ width: '100%', padding: '0.75rem', borderRadius: tokens.borderRadius, border: `1px solid ${tokens.colors.border}`, fontSize: '0.9rem' }} />
          <textarea placeholder="Your Message" rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: tokens.borderRadius, border: `1px solid ${tokens.colors.border}`, fontSize: '0.9rem', resize: 'vertical' }} />
          <button style={{ padding: '0.75rem 1.5rem', backgroundColor: tokens.colors.primary, color: '#fff', borderRadius: tokens.borderRadius, fontWeight: '600', cursor: 'pointer', border: 'none' }}>Send Message</button>
        </div>
      );

    default:
      return (
        <div style={{ padding: '1rem', backgroundColor: tokens.colors.surfaceAlt, borderRadius: tokens.borderRadius, textAlign: 'center', color: tokens.colors.textMuted, fontSize: '0.85rem' }}>
          [{type}] Component
        </div>
      );
  }
}

// MENUS TAB
function MenusTab({ project, updateProject, notify }: { project: any; updateProject: any; notify: any }) {
  const [selectedMenuId, setSelectedMenuId] = useState(project.menus[0]?.id || '');
  const menu = project.menus.find((m: Menu) => m.id === selectedMenuId);

  const addMenu = () => {
    const newMenu: Menu = {
      id: uuid(),
      name: 'New Menu',
      location: 'custom',
      items: [],
    };
    updateProject({ ...project, menus: [...project.menus, newMenu] });
    setSelectedMenuId(newMenu.id);
    notify('success', 'Menu created');
  };

  const cloneMenu = () => {
    if (!menu) return;
    const cloned: Menu = {
      ...JSON.parse(JSON.stringify(menu)),
      id: uuid(),
      name: menu.name + ' (Copy)',
    };
    // Regenerate IDs
    const regenId = (items: MenuItem[]): MenuItem[] => items.map(item => ({
      ...item,
      id: uuid(),
      children: regenId(item.children),
    }));
    cloned.items = regenId(cloned.items);
    updateProject({ ...project, menus: [...project.menus, cloned] });
    notify('success', 'Menu cloned');
  };

  const addMenuItem = () => {
    if (!menu) return;
    const newItem: MenuItem = {
      id: uuid(),
      label: 'New Item',
      type: 'page',
      children: [],
      enabled: true,
      order: menu.items.length,
    };
    const updated = { ...menu, items: [...menu.items, newItem] };
    updateProject({ ...project, menus: project.menus.map((m: Menu) => m.id === selectedMenuId ? updated : m) });
  };

  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    if (!menu) return;
    const updateItem = (items: MenuItem[]): MenuItem[] => items.map(item => {
      if (item.id === itemId) return { ...item, ...updates };
      return { ...item, children: updateItem(item.children) };
    });
    const updated = { ...menu, items: updateItem(menu.items) };
    updateProject({ ...project, menus: project.menus.map((m: Menu) => m.id === selectedMenuId ? updated : m) });
  };

  const deleteMenuItem = (itemId: string) => {
    if (!menu) return;
    const removeItem = (items: MenuItem[]): MenuItem[] => items.filter(item => {
      if (item.id === itemId) return false;
      item.children = removeItem(item.children);
      return true;
    });
    const updated = { ...menu, items: removeItem(menu.items) };
    updateProject({ ...project, menus: project.menus.map((m: Menu) => m.id === selectedMenuId ? updated : m) });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Menus</h1>
        <button onClick={addMenu} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          <Plus size={16} /> Add Menu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {project.menus.map((m: Menu) => (
              <div
                key={m.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${selectedMenuId === m.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                onClick={() => setSelectedMenuId(m.id)}
              >
                <MenuIcon size={16} className="text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{m.location} • {m.items.length} items</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Editor */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          {menu ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <input type="text" value={menu.name} onChange={e => {
                    const updated = { ...menu, name: e.target.value };
                    updateProject({ ...project, menus: project.menus.map((m: Menu) => m.id === selectedMenuId ? updated : m) });
                  }} className="font-semibold text-slate-900 text-lg border-none focus:outline-none bg-transparent" />
                  <select value={menu.location} onChange={e => {
                    const updated = { ...menu, location: e.target.value as any };
                    updateProject({ ...project, menus: project.menus.map((m: Menu) => m.id === selectedMenuId ? updated : m) });
                  }} className="block text-sm text-slate-500 mt-1 border-none focus:outline-none bg-transparent">
                    <option value="primary">Primary</option>
                    <option value="footer">Footer</option>
                    <option value="mobile">Mobile</option>
                    <option value="utility">Utility</option>
                    <option value="legal">Legal</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={cloneMenu} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50" title="Clone menu"><Copy size={16} /></button>
                  <button onClick={addMenuItem} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg">
                    <Plus size={12} /> Add Item
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {menu.items.map((item: MenuItem) => (
                  <MenuItemEditor key={item.id} item={item} onUpdate={updateMenuItem} onDelete={deleteMenuItem} pages={project.pages} depth={0} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <MenuIcon size={32} className="mx-auto mb-3 text-slate-300" />
              <p>Select a menu to edit or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuItemEditor({ item, onUpdate, onDelete, pages, depth }: { item: MenuItem; onUpdate: (id: string, updates: Partial<MenuItem>) => void; onDelete: (id: string) => void; pages: Page[]; depth: number }) {
  return (
    <div style={{ marginLeft: `${depth * 20}px` }}>
      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
        <GripVertical size={14} className="text-slate-300 cursor-grab" />
        <input
          type="text"
          value={item.label}
          onChange={e => onUpdate(item.id, { label: e.target.value })}
          className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
        />
        <select
          value={item.type}
          onChange={e => onUpdate(item.id, { type: e.target.value as any })}
          className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none bg-white"
        >
          <option value="page">Page</option>
          <option value="url">URL</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
        </select>
        {item.type === 'page' && (
          <select
            value={item.pageId || ''}
            onChange={e => onUpdate(item.id, { pageId: e.target.value })}
            className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none bg-white max-w-[150px]"
          >
            <option value="">Select page...</option>
            {pages.map((p: Page) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        )}
        {item.type === 'url' && (
          <input
            type="text"
            value={item.target || ''}
            onChange={e => onUpdate(item.id, { target: e.target.value })}
            placeholder="https://..."
            className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none bg-white w-32"
          />
        )}
        <label className="flex items-center gap-1 text-xs text-slate-500">
          <input type="checkbox" checked={item.enabled} onChange={e => onUpdate(item.id, { enabled: e.target.checked })} className="rounded" />
          On
        </label>
        <button onClick={() => onDelete(item.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
      </div>
      {item.children.map(child => (
        <MenuItemEditor key={child.id} item={child} onUpdate={onUpdate} onDelete={onDelete} pages={pages} depth={depth + 1} />
      ))}
    </div>
  );
}

// SEO TAB
function SEOTab({ project, updateProject, notify }: { project: any; updateProject: any; notify: any }) {
  const seo = project.seo;
  const updateSEO = (updates: Partial<typeof seo>) => {
    updateProject({ ...project, seo: { ...seo, ...updates } });
  };

  // Simple SEO audit
  const audit = [];
  if (!seo.siteTitle) audit.push({ type: 'error', msg: 'Site title is missing' });
  if (!seo.description) audit.push({ type: 'error', msg: 'Meta description is missing' });
  if (seo.description && seo.description.length > 160) audit.push({ type: 'warning', msg: 'Meta description is too long (max 160 chars)' });
  project.pages.forEach((p: Page) => {
    if (!p.seo.title) audit.push({ type: 'warning', msg: `Page "${p.title}" has no SEO title` });
    if (!p.seo.description) audit.push({ type: 'warning', msg: `Page "${p.title}" has no meta description` });
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">SEO Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Global SEO</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Site Title</label>
              <input type="text" value={seo.siteTitle} onChange={e => updateSEO({ siteTitle: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
              <textarea value={seo.description} onChange={e => updateSEO({ description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <p className="text-xs text-slate-400 mt-1">{seo.description.length}/160 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
              <input type="text" value={seo.business} onChange={e => updateSEO({ business: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" value={seo.phone} onChange={e => updateSEO({ phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={seo.email} onChange={e => updateSEO({ email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" value={seo.location} onChange={e => updateSEO({ location: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* SEO Audit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">SEO Audit</h3>
          {audit.length === 0 ? (
            <div className="text-center py-8">
              <Check size={32} className="mx-auto mb-2 text-green-500" />
              <p className="text-green-600 font-medium">All checks passed!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {audit.map((item, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-sm ${item.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                  <span className="mt-0.5">{item.type === 'error' ? '❌' : '⚠️'}</span>
                  <span>{item.msg}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="font-medium text-slate-900 text-sm mb-2">Social Links</h4>
            <div className="space-y-2">
              {['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'].map(platform => (
                <div key={platform} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-20 capitalize">{platform}</span>
                  <input
                    type="url"
                    value={(seo.social as any)[platform] || ''}
                    onChange={e => updateSEO({ social: { ...seo.social, [platform]: e.target.value } })}
                    placeholder={`https://${platform}.com/...`}
                    className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// PREVIEW TAB
function PreviewTab({ project, tokens }: { project: any; tokens: DesignTokens }) {
  const [currentPage, setCurrentPage] = useState(project.pages.find((p: Page) => p.type === 'home')?.id || project.pages[0]?.id);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const page = project.pages.find((p: Page) => p.id === currentPage);
  const primaryMenu = project.menus.find((m: Menu) => m.location === 'primary');
  const footerMenu = project.menus.find((m: Menu) => m.location === 'footer');
  const deviceWidths = { desktop: '100%', tablet: '768px', mobile: '375px' };

  return (
    <div className="flex flex-col h-full bg-slate-200">
      {/* Preview Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4">
        <Globe size={16} className="text-slate-400" />
        <select
          value={currentPage}
          onChange={e => setCurrentPage(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {project.pages.map((p: Page) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <div className="flex-1" />

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded ${device === 'desktop' ? 'bg-white shadow-sm' : ''}`}><Monitor size={16} /></button>
          <button onClick={() => setDevice('tablet')} className={`p-1.5 rounded ${device === 'tablet' ? 'bg-white shadow-sm' : ''}`}><Tablet size={16} /></button>
          <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded ${device === 'mobile' ? 'bg-white shadow-sm' : ''}`}><Smartphone size={16} /></button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300" style={{ maxWidth: deviceWidths[device] }}>
          {/* Header */}
          <header style={{ backgroundColor: tokens.colors.background, borderBottom: `1px solid ${tokens.colors.border}`, padding: '1rem 1.5rem' }}>
            <div className="flex items-center justify-between" style={{ maxWidth: tokens.spacing.container, margin: '0 auto' }}>
              <div style={{ fontWeight: '700', fontSize: '1.25rem', color: tokens.colors.primary }}>
                {project.seo.siteTitle || project.name}
              </div>
              <nav className="hidden md:flex items-center gap-6">
                {primaryMenu?.items.filter((i: MenuItem) => i.enabled).map((item: MenuItem) => (
                  <span key={item.id} style={{ fontSize: '0.875rem', color: tokens.colors.text, fontWeight: '500', cursor: 'pointer' }}>
                    {item.label}
                  </span>
                ))}
              </nav>
            </div>
          </header>

          {/* Page Content */}
          {page && page.sections.length > 0 ? (
            page.sections.map((section: Section) => (
              <SectionRenderer key={section.id} section={section} tokens={tokens} />
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
              <p>This page has no content yet.</p>
            </div>
          )}

          {/* Footer */}
          <footer style={{ backgroundColor: tokens.colors.surface, borderTop: `1px solid ${tokens.colors.border}`, padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: tokens.spacing.container, margin: '0 auto' }}>
              <div className="flex flex-wrap gap-8 justify-between">
                <div>
                  <p style={{ fontWeight: '700', color: tokens.colors.text, marginBottom: '0.5rem' }}>{project.seo.siteTitle || project.name}</p>
                  <p style={{ fontSize: '0.8rem', color: tokens.colors.textMuted }}>{project.seo.description}</p>
                </div>
                <div>
                  <p style={{ fontWeight: '600', color: tokens.colors.text, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quick Links</p>
                  <div className="flex flex-col gap-1">
                    {footerMenu?.items.map((item: MenuItem) => (
                      <span key={item.id} style={{ fontSize: '0.8rem', color: tokens.colors.textMuted }}>{item.label}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${tokens.colors.border}`, marginTop: '1.5rem', paddingTop: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: tokens.colors.textMuted }}>© {new Date().getFullYear()} {project.seo.siteTitle || project.name}. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

// VERSIONS TAB
function VersionsTab({ project, createVersion, restoreVersion, notify }: { project: any; createVersion: any; restoreVersion: any; notify: any }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!name.trim()) { notify('error', 'Version name is required'); return; }
    createVersion(project.id, name, description);
    setName('');
    setDescription('');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Versions</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="font-semibold text-slate-900 mb-4">Create New Version</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Version Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="v1 Initial Design" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <button onClick={handleCreate} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          <History size={14} /> Save Version
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm">Version History</h3>
        </div>
        {project.versions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <History size={32} className="mx-auto mb-3 text-slate-300" />
            <p>No versions saved yet. Create your first version to track changes.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {[...project.versions].reverse().map((v: any) => (
              <div key={v.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <History size={14} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{v.name}</p>
                  <p className="text-sm text-slate-500">{v.description || 'No description'} • {new Date(v.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => { if (confirm('Restore this version? Current changes will be replaced.')) restoreVersion(project.id, v.id); }}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// EXPORT TAB
function ExportTab({ project, notify }: { project: any; notify: any }) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleValidate = async () => {
    const { validateProjectForExport } = await import('../services/validation');
    const result = validateProjectForExport(project);
    setValidationResult(result);
    setShowValidation(true);
  };

  const handleExport = async (type: 'static' | 'laravel' | 'react') => {
    setExporting(type);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const { generateStaticSite, generateLaravelProject, generateReactProject, generateZip, downloadZip } = await import('../services/exporter');
      let files: Record<string, string> = {};

      if (type === 'static') {
        files = generateStaticSite(project);
      } else if (type === 'laravel') {
        files = generateLaravelProject(project);
      } else {
        files = generateReactProject(project);
      }

      // Generate ZIP file
      const zipBlob = await generateZip(files, project.name);
      const filename = `${project.name.replace(/\s+/g, '-').toLowerCase()}-${type}.zip`;
      downloadZip(zipBlob, filename);

      notify('success', `${type} export complete - ${Object.keys(files).length} files packaged in ZIP`);
    } catch (err) {
      notify('error', `Export failed: ${err}`);
    }

    setExporting(null);
  };

  // Export rendering handled by services/exporter.ts

  // (old renderComponent removed - handled by exporter.ts)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Export Website</h1>
        <button
          onClick={handleValidate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg"
        >
          <Check size={16} /> Validate Before Export
        </button>
      </div>

      {/* Validation Modal */}
      {showValidation && validationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Export Validation</h3>
              <button onClick={() => setShowValidation(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-5">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${validationResult.summary.errors > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className="text-2xl font-bold">{validationResult.summary.errors}</p>
                  <p className="text-sm text-slate-600">Errors</p>
                </div>
                <div className={`p-4 rounded-lg ${validationResult.summary.warnings > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                  <p className="text-2xl font-bold">{validationResult.summary.warnings}</p>
                  <p className="text-sm text-slate-600">Warnings</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50">
                  <p className="text-2xl font-bold">{validationResult.summary.info}</p>
                  <p className="text-sm text-slate-600">Info</p>
                </div>
              </div>

              {/* Status */}
              <div className={`p-4 rounded-lg mb-4 ${validationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`font-medium ${validationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                  {validationResult.valid ? '✓ Project is ready for export' : '✗ Project has errors that must be fixed before export'}
                </p>
              </div>

              {/* Issues */}
              {validationResult.issues.length > 0 && (
                <div className="space-y-2">
                  {validationResult.issues.map((issue: any, i: number) => (
                    <div key={i} className={`p-3 rounded-lg border ${
                      issue.type === 'error' ? 'bg-red-50 border-red-200' :
                      issue.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm">
                          {issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{issue.message}</p>
                          {issue.fix && <p className="text-xs text-slate-600 mt-1">Fix: {issue.fix}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowValidation(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Static Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <FileCode size={24} className="text-orange-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Static HTML</h3>
          <p className="text-sm text-slate-500 mb-4">Pure HTML, CSS, and JavaScript. No build step required. Ready to deploy anywhere.</p>
          <ul className="text-xs text-slate-500 space-y-1 mb-4">
            <li>✓ HTML5 pages</li>
            <li>✓ Inline CSS with theme tokens</li>
            <li>✓ Responsive design</li>
            <li>✓ SEO meta tags</li>
            <li>✓ Semantic markup</li>
          </ul>
          <button
            onClick={() => handleExport('static')}
            disabled={exporting !== null}
            className="w-full px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
          >
            {exporting === 'static' ? 'Exporting...' : 'Export Static'}
          </button>
        </div>

        {/* Laravel Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
            <Code size={24} className="text-red-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Laravel 12</h3>
          <p className="text-sm text-slate-500 mb-4">PHP 8.3 + Laravel 12.x with Blade templates. Full-stack ready.</p>
          <ul className="text-xs text-slate-500 space-y-1 mb-4">
            <li>✓ Blade layouts & components</li>
            <li>✓ Routes & controllers</li>
            <li>✓ Asset pipeline</li>
            <li>✓ Environment config</li>
            <li>✓ PHP 8.3 compatible</li>
          </ul>
          <button
            onClick={() => handleExport('laravel')}
            disabled={exporting !== null}
            className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
          >
            {exporting === 'laravel' ? 'Exporting...' : 'Export Laravel'}
          </button>
        </div>

        {/* React Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4">
            <Package size={24} className="text-cyan-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">React / Node</h3>
          <p className="text-sm text-slate-500 mb-4">React + TypeScript + Vite with Express backend. Modern SPA architecture.</p>
          <ul className="text-xs text-slate-500 space-y-1 mb-4">
            <li>✓ React 18 + TypeScript</li>
            <li>✓ Vite build system</li>
            <li>✓ Express server</li>
            <li>✓ Component library</li>
            <li>✓ Theme system</li>
          </ul>
          <button
            onClick={() => handleExport('react')}
            disabled={exporting !== null}
            className="w-full px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
          >
            {exporting === 'react' ? 'Exporting...' : 'Export React'}
          </button>
        </div>
      </div>

      {/* Export Info */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-3">Export Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-slate-500">Pages:</span> <span className="font-medium text-slate-900 ml-1">{project.pages.filter((p: Page) => p.status === 'published').length}</span></div>
          <div><span className="text-slate-500">Sections:</span> <span className="font-medium text-slate-900 ml-1">{project.pages.reduce((acc: number, p: Page) => acc + p.sections.length, 0)}</span></div>
          <div><span className="text-slate-500">Theme:</span> <span className="font-medium text-slate-900 ml-1 capitalize">{project.themeId}</span></div>
          <div><span className="text-slate-500">Variant:</span> <span className="font-medium text-slate-900 ml-1 capitalize">{project.themeVariant}</span></div>
        </div>
      </div>
    </div>
  );
}
