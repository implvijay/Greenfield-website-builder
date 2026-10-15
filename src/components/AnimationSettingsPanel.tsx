import { useState } from 'react';
import { Section, AnimationSettings } from '../types';
import { X, Play, Pause } from 'lucide-react';

interface AnimationSettingsPanelProps {
  section: Section;
  onUpdate: (animation: AnimationSettings | undefined) => void;
  onClose: () => void;
}

export function AnimationSettingsPanel({ section, onUpdate, onClose }: AnimationSettingsPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const animation = section.animation || { type: 'none', duration: 500, delay: 0 };

  const animationTypes = [
    { value: 'none', label: 'None', description: 'No animation' },
    { value: 'fade', label: 'Fade', description: 'Fade in effect' },
    { value: 'slide-up', label: 'Slide Up', description: 'Slide from bottom' },
    { value: 'slide-down', label: 'Slide Down', description: 'Slide from top' },
    { value: 'slide-left', label: 'Slide Left', description: 'Slide from right' },
    { value: 'slide-right', label: 'Slide Right', description: 'Slide from left' },
    { value: 'zoom-in', label: 'Zoom In', description: 'Scale up effect' },
    { value: 'zoom-out', label: 'Zoom Out', description: 'Scale down effect' },
    { value: 'bounce', label: 'Bounce', description: 'Bounce effect' },
    { value: 'shake', label: 'Shake', description: 'Shake effect' },
  ];

  const handlePlayAnimation = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), animation.duration + animation.delay);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Animation Settings</h3>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Preview */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-700">Preview</p>
            <button
              onClick={handlePlayAnimation}
              disabled={isPlaying || animation.type === 'none'}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? 'Playing...' : 'Play'}
            </button>
          </div>
          <div
            className={`p-6 bg-white rounded-lg border border-slate-200 ${
              isPlaying ? `animate-${animation.type}` : ''
            }`}
            style={{
              animationDuration: `${animation.duration}ms`,
              animationDelay: `${animation.delay}ms`,
            }}
          >
            <p className="text-sm text-slate-600 text-center">
              {animation.type === 'none' ? 'No animation selected' : 'Animation preview'}
            </p>
          </div>
        </div>

        {/* Animation Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Animation Type</label>
          <div className="grid grid-cols-2 gap-2">
            {animationTypes.map(type => (
              <button
                key={type.value}
                onClick={() => onUpdate({ ...animation, type: type.value as any })}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  animation.type === type.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <p className="text-sm font-medium">{type.label}</p>
                <p className="text-xs opacity-70">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Duration: {animation.duration}ms
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={animation.duration}
            onChange={e => onUpdate({ ...animation, duration: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>100ms</span>
            <span>2000ms</span>
          </div>
        </div>

        {/* Delay */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Delay: {animation.delay}ms
          </label>
          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={animation.delay}
            onChange={e => onUpdate({ ...animation, delay: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0ms</span>
            <span>1000ms</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Quick Presets</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdate({ type: 'fade', duration: 500, delay: 0 })}
              className="px-3 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-sm transition-colors"
            >
              Subtle Fade
            </button>
            <button
              onClick={() => onUpdate({ type: 'slide-up', duration: 600, delay: 0 })}
              className="px-3 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-sm transition-colors"
            >
              Smooth Slide
            </button>
            <button
              onClick={() => onUpdate({ type: 'zoom-in', duration: 400, delay: 0 })}
              className="px-3 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-sm transition-colors"
            >
              Quick Zoom
            </button>
            <button
              onClick={() => onUpdate({ type: 'bounce', duration: 800, delay: 0 })}
              className="px-3 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-sm transition-colors"
            >
              Playful Bounce
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-1">Animation Tips</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Animations trigger when section enters viewport</li>
            <li>• Keep durations between 300-800ms for best UX</li>
            <li>• Use delays to create staggered effects</li>
            <li>• Animations work in preview and exported sites</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 flex gap-2">
        <button
          onClick={() => onUpdate(undefined)}
          className="flex-1 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
        >
          Remove Animation
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
