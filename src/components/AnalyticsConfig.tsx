import { useState } from 'react';
import { Project, AnalyticsSettings } from '../types';
import { BarChart3, Save, Code, Eye, Globe, Shield } from 'lucide-react';

interface AnalyticsConfigProps {
  project: Project;
  updateProject: (p: Project) => void;
  notify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export function AnalyticsConfig({ project, updateProject, notify }: AnalyticsConfigProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSettings>(project.analytics);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    updateProject({ ...project, analytics });
    notify('success', 'Analytics settings saved');
  };

  const generateGAScript = () => {
    if (!analytics.googleAnalyticsId) return '';
    return `<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalyticsId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${analytics.googleAnalyticsId}');
</script>`;
  };

  const generateGTMScript = () => {
    if (!analytics.googleTagManagerId) return '';
    return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${analytics.googleTagManagerId}');</script>
<!-- End Google Tag Manager -->`;
  };

  const generateMetaPixel = () => {
    if (!analytics.metaPixelId) return '';
    return `<!-- Meta Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${analytics.metaPixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${analytics.metaPixelId}&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel -->`;
  };

  const getPreviewCode = () => {
    const scripts = [generateGAScript(), generateGTMScript(), generateMetaPixel(), analytics.customScripts || ''].filter(Boolean);
    return scripts.join('\n\n');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Configure tracking and analytics for your website</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg">
            <Code size={16} /> {showPreview ? 'Hide Code' : 'Preview Code'}
          </button>
          <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Analytics */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <BarChart3 size={20} className="text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Google Analytics 4</h3>
              <p className="text-xs text-slate-500">Track visitor behavior and conversions</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Measurement ID</label>
            <input
              type="text"
              value={analytics.googleAnalyticsId || ''}
              onChange={e => setAnalytics({ ...analytics, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">Found in GA4 Admin → Data Streams → Web</p>
          </div>
        </div>

        {/* Google Tag Manager */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Globe size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Google Tag Manager</h3>
              <p className="text-xs text-slate-500">Manage all tags in one place</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Container ID</label>
            <input
              type="text"
              value={analytics.googleTagManagerId || ''}
              onChange={e => setAnalytics({ ...analytics, googleTagManagerId: e.target.value })}
              placeholder="GTM-XXXXXXX"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">Found in GTM Admin → Container ID</p>
          </div>
        </div>

        {/* Meta Pixel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Eye size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Meta Pixel</h3>
              <p className="text-xs text-slate-500">Facebook/Instagram advertising tracking</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pixel ID</label>
            <input
              type="text"
              value={analytics.metaPixelId || ''}
              onChange={e => setAnalytics({ ...analytics, metaPixelId: e.target.value })}
              placeholder="123456789012345"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">Found in Meta Events Manager → Pixel</p>
          </div>
        </div>

        {/* Custom Scripts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Code size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Custom Scripts</h3>
              <p className="text-xs text-slate-500">Add custom tracking or analytics code</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Custom Code</label>
            <textarea
              value={analytics.customScripts || ''}
              onChange={e => setAnalytics({ ...analytics, customScripts: e.target.value })}
              placeholder="<!-- Paste custom scripts here -->"
              rows={5}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400 mt-1">Will be injected into &lt;head&gt; of every page</p>
          </div>
        </div>
      </div>

      {/* Code Preview */}
      {showPreview && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-slate-400" />
            <h3 className="font-semibold text-slate-900">Generated Code Preview</h3>
          </div>
          <p className="text-sm text-slate-500 mb-3">This code will be injected into the &lt;head&gt; section of every exported page:</p>
          <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto text-xs font-mono max-h-64">
            {getPreviewCode() || '<!-- No analytics configured -->'}
          </pre>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 text-sm">Privacy & Compliance</h4>
            <p className="text-sm text-blue-700 mt-1">
              Analytics scripts are automatically included in all export formats. Ensure compliance with GDPR, CCPA, and other privacy regulations.
              Consider adding a cookie consent notice for visitors in regulated regions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
