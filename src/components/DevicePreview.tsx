import { useState } from 'react';
import { Monitor, Tablet, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface DevicePreviewProps {
  children: React.ReactNode;
  title?: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceConfigs = {
  desktop: {
    width: '100%',
    maxWidth: '1400px',
    label: 'Desktop',
    icon: Monitor,
    frame: false,
  },
  tablet: {
    width: '768px',
    maxWidth: '768px',
    label: 'Tablet',
    icon: Tablet,
    frame: true,
  },
  mobile: {
    width: '375px',
    maxWidth: '375px',
    label: 'Mobile',
    icon: Smartphone,
    frame: true,
  },
};

export function DevicePreview({ children, title }: DevicePreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [fullscreen, setFullscreen] = useState(false);

  const config = deviceConfigs[device];

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
          <h3 className="font-semibold text-slate-900">{title || 'Preview'}</h3>
          <button
            onClick={() => setFullscreen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Minimize2 size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="mx-auto" style={{ maxWidth: config.maxWidth }}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 rounded-xl p-6">
      {/* Device Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
          {(Object.keys(deviceConfigs) as DeviceType[]).map(deviceType => {
            const deviceConfig = deviceConfigs[deviceType];
            const Icon = deviceConfig.icon;
            return (
              <button
                key={deviceType}
                onClick={() => setDevice(deviceType)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  device === deviceType
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{deviceConfig.label}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setFullscreen(true)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
          title="Fullscreen"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex justify-center">
        <div
          className={`transition-all duration-300 ${
            config.frame ? 'bg-white rounded-lg shadow-2xl overflow-hidden' : ''
          }`}
          style={{
            width: config.width,
            maxWidth: config.maxWidth,
            minHeight: device === 'mobile' ? '667px' : device === 'tablet' ? '1024px' : '800px',
          }}
        >
          {config.frame && (
            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-block bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-md">
                  {title || 'Preview'}
                </div>
              </div>
            </div>
          )}
          <div className="overflow-auto" style={{ maxHeight: device === 'mobile' ? '600px' : '700px' }}>
            {children}
          </div>
        </div>
      </div>

      {/* Device Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          {config.label} • {config.width} × {device === 'mobile' ? '667px' : device === 'tablet' ? '1024px' : '900px'}
        </p>
      </div>
    </div>
  );
}
