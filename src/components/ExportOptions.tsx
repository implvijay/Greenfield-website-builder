import { useState } from 'react';
import { Download, FileCode, Code, Package, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ExportOptionsProps {
  projectName: string;
  pageCount: number;
  onExport: (type: 'static' | 'laravel' | 'react') => void;
  isExporting: boolean;
}

interface ExportValidation {
  type: 'error' | 'warning' | 'info';
  message: string;
}

export function ExportOptions({ projectName, pageCount, onExport, isExporting }: ExportOptionsProps) {
  const [selectedType, setSelectedType] = useState<'static' | 'laravel' | 'react'>('static');
  const [includeSEO, setIncludeSEO] = useState(true);
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [optimizeImages, setOptimizeImages] = useState(true);
  const [generateSitemap, setGenerateSitemap] = useState(true);

  // Mock validation - in real app this would check actual project state
  const validation: ExportValidation[] = [
    { type: 'info', message: `${pageCount} pages will be exported` },
    { type: 'info', message: 'All published pages will be included' },
  ];

  const exportTypes = [
    {
      id: 'static' as const,
      name: 'Static HTML',
      icon: FileCode,
      color: 'orange',
      description: 'Pure HTML, CSS, and JavaScript. No build step required. Ready to deploy anywhere.',
      features: [
        'HTML5 semantic markup',
        'Responsive CSS with theme tokens',
        'SEO meta tags & sitemap',
        'Analytics integration',
        'Optimized images',
      ],
    },
    {
      id: 'laravel' as const,
      name: 'Laravel 12',
      icon: Code,
      color: 'red',
      description: 'PHP 8.3 + Laravel 12.x with Blade templates. Full-stack ready with routing and controllers.',
      features: [
        'Blade layouts & components',
        'Routes & controllers',
        'Asset pipeline (Vite)',
        'Environment config',
        'PHP 8.3 compatible',
      ],
    },
    {
      id: 'react' as const,
      name: 'React / Node',
      icon: Package,
      color: 'cyan',
      description: 'React 18 + TypeScript + Vite with Express backend. Modern SPA architecture.',
      features: [
        'React 18 + TypeScript',
        'Vite build system',
        'Express server',
        'Component library',
        'Theme system',
      ],
    },
  ];

  const selectedExport = exportTypes.find(e => e.id === selectedType)!;

  return (
    <div className="space-y-6">
      {/* Export Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportTypes.map(exportType => {
          const Icon = exportType.icon;
          const isSelected = selectedType === exportType.id;
          return (
            <button
              key={exportType.id}
              onClick={() => setSelectedType(exportType.id)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-${exportType.color}-50 flex items-center justify-center mb-4`}>
                <Icon size={24} className={`text-${exportType.color}-600`} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{exportType.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{exportType.description}</p>
              <ul className="space-y-1">
                {exportType.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Export Options</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeSEO}
                onChange={e => setIncludeSEO(e.target.checked)}
                className="rounded"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Include SEO</p>
                <p className="text-xs text-slate-500">Meta tags, sitemap.xml, robots.txt</p>
              </div>
            </div>
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeAnalytics}
                onChange={e => setIncludeAnalytics(e.target.checked)}
                className="rounded"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Include Analytics</p>
                <p className="text-xs text-slate-500">Google Analytics, Tag Manager, Meta Pixel</p>
              </div>
            </div>
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={optimizeImages}
                onChange={e => setOptimizeImages(e.target.checked)}
                className="rounded"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Optimize Images</p>
                <p className="text-xs text-slate-500">Compress and convert to WebP</p>
              </div>
            </div>
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={generateSitemap}
                onChange={e => setGenerateSitemap(e.target.checked)}
                className="rounded"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Generate Sitemap</p>
                <p className="text-xs text-slate-500">Create sitemap.xml for all pages</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Validation Summary */}
      {validation.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Validation Summary</h3>
          <div className="space-y-2">
            {validation.map((item, i) => {
              const Icon = item.type === 'error' ? AlertCircle : item.type === 'warning' ? AlertCircle : Info;
              const colorClass =
                item.type === 'error' ? 'text-red-600 bg-red-50' :
                item.type === 'warning' ? 'text-amber-600 bg-amber-50' :
                'text-blue-600 bg-blue-50';
              return (
                <div key={i} className={`flex items-start gap-2 p-3 rounded-lg ${colorClass}`}>
                  <Icon size={16} className="mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{item.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={() => onExport(selectedType)}
        disabled={isExporting}
        className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download size={20} />
            Export {selectedExport.name}
          </>
        )}
      </button>
    </div>
  );
}
