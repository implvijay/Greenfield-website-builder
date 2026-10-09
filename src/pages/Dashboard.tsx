import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { AppLayout } from '../components/Layout';
import { FolderOpen, Plus, Clock, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { industries } from '../data/industries';

export function DashboardPage() {
  const { state, setCurrentProject } = useStore();
  const projects = state.projects;
  const recentProjects = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  const drafts = projects.filter(p => p.status === 'draft');
  const published = projects.filter(p => p.status === 'published');

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {state.user?.name}</p>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            New Project
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FolderOpen} label="Total Projects" value={projects.length} color="indigo" />
          <StatCard icon={FileText} label="Drafts" value={drafts.length} color="amber" />
          <StatCard icon={CheckCircle} label="Published" value={published.length} color="green" />
          <StatCard icon={TrendingUp} label="This Month" value={projects.filter(p => new Date(p.createdAt) > new Date(Date.now() - 30 * 86400000)).length} color="blue" />
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Clock size={18} />
              Recent Projects
            </h2>
            <Link to="/projects" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
              <p className="text-slate-500 mb-4">Create your first website project to get started.</p>
              <Link to="/projects" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                <Plus size={16} /> Create Project
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentProjects.map(project => {
                const industry = industries.find(i => i.id === project.industry);
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    onClick={() => setCurrentProject(project.id)}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-xl">
                      {industry?.icon || '🌐'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">{project.name}</h3>
                      <p className="text-sm text-slate-500">{project.customer} • {industry?.name}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      project.status === 'published' ? 'bg-green-50 text-green-700' :
                      project.status === 'draft' ? 'bg-amber-50 text-amber-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {project.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
