import React, { useState, useEffect } from 'react';
import { PageTemplate } from '../services/templates';
import { Download, Eye, Star, Filter } from 'lucide-react';

interface TemplateMarketplaceProps {
  onInstall: (template: PageTemplate) => void;
}

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({ onInstall }) => {
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<PageTemplate | null>(null);

  useEffect(() => {
    // Load templates from storage
    const stored = localStorage.getItem('greenfield_templates');
    if (stored) {
      setTemplates(JSON.parse(stored));
    } else {
      // Default templates
      const defaultTemplates: PageTemplate[] = [
        {
          id: 'tpl-corporate-home',
          name: 'Corporate Home',
          description: 'Professional homepage for corporate businesses',
          industry: 'corporate',
          pageType: 'home',
          sections: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tpl-saas-landing',
          name: 'SaaS Landing Page',
          description: 'Conversion-focused landing page for SaaS products',
          industry: 'saas',
          pageType: 'landing',
          sections: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tpl-agency-home',
          name: 'Agency Home',
          description: 'Creative homepage for digital agencies',
          industry: 'digital-agency',
          pageType: 'home',
          sections: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tpl-ecommerce-product',
          name: 'E-commerce Product',
          description: 'Product detail page for e-commerce sites',
          industry: 'local-business',
          pageType: 'product',
          sections: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tpl-portfolio',
          name: 'Portfolio Gallery',
          description: 'Showcase your work with a beautiful portfolio',
          industry: 'creative',
          pageType: 'portfolio',
          sections: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tpl-blog-listing',
          name: 'Blog Listing',
          description: 'Modern blog listing page with grid layout',
          industry: 'technology',
          pageType: 'blog',
          sections: [],
          createdAt: new Date().toISOString(),
        },
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem('greenfield_templates', JSON.stringify(defaultTemplates));
    }
  }, []);

  const filteredTemplates = filter === 'all' 
    ? templates 
    : templates.filter(t => t.industry === filter);

  const industries = ['all', 'corporate', 'saas', 'digital-agency', 'creative', 'technology', 'local-business'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Template Marketplace</h1>
        <p className="text-gray-600 mt-2">Browse and install pre-built page templates</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind === 'all' ? 'All Industries' : ind.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Template Preview */}
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-sm text-gray-600">{template.pageType}</p>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 capitalize">
                  {template.industry.replace('-', ' ')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onInstall(template)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Install"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{previewTemplate.name}</h2>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">{previewTemplate.description}</p>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Template preview would show here</p>
                <p className="text-sm text-gray-400 mt-2">
                  {previewTemplate.sections.length} sections • {previewTemplate.pageType} page
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onInstall(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
