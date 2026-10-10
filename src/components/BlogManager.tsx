import { useState } from 'react';
import { Project } from '../types';
import { v4 as uuid } from 'uuid';
import { Plus, Trash2, Edit3, Eye, X, Calendar, User, FileText } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  featuredImage?: string;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

interface BlogManagerProps {
  project: Project;
  updateProject: (p: Project) => void;
  notify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

// Store blog posts in project's custom data
function getBlogPosts(project: Project): BlogPost[] {
  try {
    const data = localStorage.getItem(`greenfield_blog_${project.id}`);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveBlogPosts(projectId: string, posts: BlogPost[]) {
  localStorage.setItem(`greenfield_blog_${projectId}`, JSON.stringify(posts));
}

export function BlogManager({ project, updateProject, notify }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>(() => getBlogPosts(project));
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const updatePosts = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    saveBlogPosts(project.id, newPosts);
  };

  const createPost = (post: BlogPost) => {
    updatePosts([...posts, post]);
    setShowCreate(false);
    notify('success', 'Blog post created');
  };

  const updatePost = (updated: BlogPost) => {
    updatePosts(posts.map(p => p.id === updated.id ? updated : p));
    setEditing(null);
    notify('success', 'Blog post updated');
  };

  const deletePost = (id: string) => {
    if (confirm('Delete this blog post?')) {
      updatePosts(posts.filter(p => p.id !== id));
      notify('success', 'Blog post deleted');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
          <p className="text-slate-500 text-sm mt-1">{posts.length} post(s) • Static blog for Phase 1</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          <Plus size={16} /> New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No blog posts yet</h3>
          <p className="text-slate-500 mb-4">Create your first blog post to share updates and insights.</p>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
            <Plus size={16} /> Create Post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                {post.featuredImage ? (
                  <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FileText size={20} className="text-slate-300" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 truncate">{post.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${post.published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 truncate mt-0.5">{post.excerpt}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(post.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><User size={10} /> {post.author}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditing(post)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50"><Edit3 size={14} /></button>
                <button onClick={() => deletePost(post.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <BlogEditor onClose={() => setShowCreate(false)} onSave={createPost} />}
      {editing && <BlogEditor post={editing} onClose={() => setEditing(null)} onSave={updatePost} />}
    </div>
  );
}

function BlogEditor({ post, onClose, onSave }: { post?: BlogPost; onClose: () => void; onSave: (p: BlogPost) => void }) {
  const [title, setTitle] = useState(post?.title || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [author, setAuthor] = useState(post?.author || '');
  const [date, setDate] = useState(post?.date || new Date().toISOString().split('T')[0]);
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || '');
  const [published, setPublished] = useState(post?.published ?? false);

  const handleSave = () => {
    if (!title.trim()) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    onSave({
      id: post?.id || uuid(),
      title,
      slug,
      excerpt,
      content,
      author,
      date,
      featuredImage,
      published,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{post ? 'Edit Post' : 'New Blog Post'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
            <input type="text" value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Brief summary..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder="Write your post content..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Featured Image URL</label>
            <input type="url" value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="rounded" />
            <span className="text-sm text-slate-700">Published</span>
          </label>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 text-sm font-medium">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
            {post ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
