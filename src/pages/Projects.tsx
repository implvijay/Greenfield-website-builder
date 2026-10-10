import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { AppLayout, Breadcrumbs } from '../components/Layout';
import { industries, getIndustryConfig, generateStarterPages, generateStarterMenus, generateStarterSEO } from '../data/industries';
import { industryThemes } from '../data/themes';
import { Project, IndustryType } from '../types';
import { v4 as uuid } from 'uuid';
import { Plus, Search, Filter, MoreVertical, Trash2, Copy, Archive, Eye } from 'lucide-react';

export function ProjectsPage() {
  const { state, createProject, deleteProject, notify, setCurrentProject } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filtered = state.projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = (project: Project) => {
    createProject(project);
    setCurrentProject(project.id);
    notify('success', `Project "${project.name}" created successfully`);
    setShowCreate(false);
    navigate(`/projects/${project.id}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete project "${name}"? This cannot be undone.`)) {
      deleteProject(id);
      notify('success', 'Project deleted');
    }
  };

  return (
    <AppLayout>
      <div className="p-8">
        <Breadcrumbs items={[{ label: 'Dashboard', path: '/' }, { label: 'Projects' }]} />

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
            <Plus size={18} /> New Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {search || statusFilter !== 'all' ? 'No matching projects' : 'No projects yet'}
            </h3>
            <p className="text-slate-500 mb-4">
              {search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first website project to get started.'}
            </p>
            {!search && statusFilter === 'all' && (
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                <Plus size={16} /> Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(project => {
              const industry = industries.find(i => i.id === project.industry);
              return (
                <div key={project.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-xl">
                        {industry?.icon || '🌐'}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setCurrentProject(project.id); navigate(`/projects/${project.id}`); }} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded" title="Open">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDelete(project.id, project.name)} className="p-1.5 text-slate-400 hover:text-red-500 rounded" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <Link to={`/projects/${project.id}`} onClick={() => setCurrentProject(project.id)} className="block">
                      <h3 className="font-semibold text-slate-900 mb-1 hover:text-indigo-600">{project.name}</h3>
                      <p className="text-sm text-slate-500 mb-3">{project.customer}</p>
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'published' ? 'bg-green-50 text-green-700' :
                        project.status === 'draft' ? 'bg-amber-50 text-amber-700' :
                        project.status === 'archived' ? 'bg-slate-100 text-slate-600' :
                        'bg-blue-50 text-blue-700'
                      }`}>{project.status}</span>
                      <span className="text-xs text-slate-400">{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{project.pages.length} pages</span>
                      <span>{project.menus.length} menus</span>
                      <span>{industry?.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      </div>
    </AppLayout>
  );
}

function CreateProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Project) => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [customer, setCustomer] = useState('');
  const [industry, setIndustry] = useState<IndustryType>('corporate');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'starter' | 'blank'>('starter');

  const handleCreate = () => {
    const industryConfig = getIndustryConfig(industry);
    const now = new Date().toISOString();
    const pages = mode === 'starter' ? generateStarterPages(industryConfig) : [{
      id: uuid(), title: 'Home', slug: 'home', type: 'home' as const, status: 'published' as const,
      sections: [], seo: { title: name, description: '' }, order: 0,
    }];
    const menus = mode === 'starter' ? generateStarterMenus(industryConfig, pages) : [];

    const project: Project = {
      id: uuid(),
      name: name || `${customer || 'New'} Website`,
      customer: customer || 'New Customer',
      industry,
      description: description || industryConfig.starterContent.description,
      domain: '',
      location: '',
      contact: { phone: '', email: '', address: '' },
      status: 'draft',
      themeId: industryThemes[industry],
      themeVariant: 'default',
      pages,
      pageFolders: [],
      menus,
      forms: [],
      seo: generateStarterSEO(industryConfig),
      analytics: {},
      media: [],
      versions: [],
      createdAt: now,
      updatedAt: now,
    };

    onCreate(project);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Create New Project</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 mb-4">Project Details</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="My Website" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer / Company</label>
                <input type="text" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Acme Corp" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Select Industry</h3>
              <div className="grid grid-cols-3 gap-3">
                {industries.map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => setIndustry(ind.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      industry === ind.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{ind.icon}</span>
                    <p className="font-medium text-sm text-slate-900">{ind.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ind.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Project Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('starter')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    mode === 'starter' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-3xl mb-3 block">🚀</span>
                  <h4 className="font-semibold text-slate-900">Starter Website</h4>
                  <p className="text-sm text-slate-500 mt-1">Auto-generate pages, content, menus, and SEO based on your industry.</p>
                </button>
                <button
                  onClick={() => setMode('blank')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    mode === 'blank' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-3xl mb-3 block">📄</span>
                  <h4 className="font-semibold text-slate-900">Blank Project</h4>
                  <p className="text-sm text-slate-500 mt-1">Start from scratch with an empty home page.</p>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </button>
          <button
            onClick={() => step < 3 ? setStep(step + 1) : handleCreate()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            {step < 3 ? 'Continue' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
