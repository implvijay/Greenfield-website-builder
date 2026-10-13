import React, { useState } from 'react';
import { DesignTokens } from '../types';
import { Edit3, Check, X } from 'lucide-react';

interface InlineEditableProps {
  value: string;
  onSave: (value: string) => void;
  editable?: boolean;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

export function InlineEditable({ 
  value, 
  onSave, 
  editable = true, 
  multiline = false,
  className = '',
  style = {},
  placeholder = 'Click to edit...'
}: InlineEditableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!editable) {
    return multiline ? (
      <div className={className} style={style}>{value}</div>
    ) : (
      <span className={className} style={style}>{value}</span>
    );
  }

  if (isEditing) {
    return (
      <div className="relative group">
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className={`${className} w-full p-2 border-2 border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y min-h-[100px]`}
            style={style}
            placeholder={placeholder}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className={`${className} w-full p-2 border-2 border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            style={style}
            placeholder={placeholder}
          />
        )}
        <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleSave}
            className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
            title="Save (Enter)"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
            title="Cancel (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        setEditValue(value);
        setIsEditing(true);
      }}
      className={`${className} cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:ring-offset-2 rounded transition-all relative group`}
      style={style}
      title="Click to edit"
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
      <div className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-1 bg-indigo-500 text-white rounded shadow-lg">
          <Edit3 size={12} />
        </div>
      </div>
    </div>
  );
}

// Enhanced Component Renderer with full inline editing
export function EnhancedComponentRenderer({ 
  component, 
  tokens, 
  textColor, 
  editable = true,
  onUpdate 
}: { 
  component: any; 
  tokens: DesignTokens; 
  textColor: string; 
  editable?: boolean;
  onUpdate?: (props: any) => void;
}) {
  const { type, props } = component;

  const handleUpdate = (newProps: any) => {
    if (onUpdate) {
      onUpdate({ ...props, ...newProps });
    }
  };

  switch (type) {
    case 'heading':
      const Tag = `h${props.level || 2}` as any;
      const sizeMap: Record<string, string> = { 
        '5xl': '3rem', '4xl': '2.5rem', '3xl': '2rem', 
        '2xl': '1.5rem', 'xl': '1.25rem' 
      };
      return (
        <InlineEditable
          value={props.text || ''}
          onSave={(text) => handleUpdate({ text })}
          editable={editable}
          className="font-bold"
          style={{ 
            fontFamily: tokens.typography.headingFont, 
            fontWeight: tokens.typography.headingWeight, 
            fontSize: sizeMap[props.size] || '2rem', 
            color: textColor, 
            marginBottom: '0.75rem', 
            lineHeight: '1.2' 
          }}
          placeholder="Enter heading..."
        />
      );

    case 'paragraph':
      return (
        <InlineEditable
          value={props.text || ''}
          onSave={(text) => handleUpdate({ text })}
          editable={editable}
          multiline
          style={{ 
            fontFamily: tokens.typography.bodyFont, 
            fontSize: tokens.typography.bodySize, 
            color: textColor, 
            opacity: 0.85, 
            lineHeight: tokens.typography.lineHeight, 
            marginBottom: '1rem',
            maxWidth: '600px',
            margin: '0 auto 1rem'
          }}
          placeholder="Enter paragraph text..."
        />
      );

    case 'text':
      return (
        <InlineEditable
          value={props.text || ''}
          onSave={(text) => handleUpdate({ text })}
          editable={editable}
          multiline
          style={{ 
            fontFamily: tokens.typography.bodyFont, 
            fontSize: tokens.typography.bodySize, 
            color: textColor, 
            opacity: 0.85, 
            lineHeight: '1.8', 
            whiteSpace: 'pre-line' 
          }}
          placeholder="Enter text content..."
        />
      );

    case 'button':
      return (
        <div className="inline-block">
          <InlineEditable
            value={props.text || 'Button'}
            onSave={(text) => handleUpdate({ text })}
            editable={editable}
            className="inline-block"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: tokens.borderRadius,
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              backgroundColor: props.variant === 'primary' ? tokens.colors.primary : 'transparent',
              color: props.variant === 'primary' ? '#ffffff' : textColor,
              border: props.variant === 'primary' ? 'none' : `2px solid ${textColor}30`,
            }}
            placeholder="Button text..."
          />
        </div>
      );

    case 'button-group':
      return (
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {(props.buttons || []).map((btn: any, i: number) => (
            <div key={i} className="relative group">
              <InlineEditable
                value={btn.label || ''}
                onSave={(label) => {
                  const newButtons = [...(props.buttons || [])];
                  newButtons[i] = { ...newButtons[i], label };
                  handleUpdate({ buttons: newButtons });
                }}
                editable={editable}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: tokens.borderRadius,
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  backgroundColor: btn.variant === 'primary' ? tokens.colors.primary : 'transparent',
                  color: btn.variant === 'primary' ? '#ffffff' : textColor,
                  border: btn.variant === 'primary' ? 'none' : `2px solid ${textColor}30`,
                }}
                placeholder="Button label..."
              />
            </div>
          ))}
        </div>
      );

    case 'image':
      return (
        <div className="mb-4">
          {props.src ? (
            <div className="relative group">
              <img 
                src={props.src} 
                alt={props.alt || ''} 
                style={{ 
                  width: '100%', 
                  borderRadius: tokens.borderRadius, 
                  objectFit: 'cover',
                  cursor: editable ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (editable) {
                    const newSrc = prompt('Enter image URL:', props.src);
                    if (newSrc) handleUpdate({ src: newSrc });
                  }
                }}
              />
              {editable && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      const newSrc = prompt('Enter image URL:', props.src);
                      if (newSrc) handleUpdate({ src: newSrc });
                    }}
                    className="p-2 bg-white rounded shadow-lg hover:bg-gray-100"
                    title="Change image"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div 
              onClick={() => {
                if (editable) {
                  const newSrc = prompt('Enter image URL:');
                  if (newSrc) handleUpdate({ src: newSrc });
                }
              }}
              style={{ 
                width: '100%', 
                height: '200px', 
                backgroundColor: tokens.colors.surfaceAlt, 
                borderRadius: tokens.borderRadius, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: tokens.colors.textMuted,
                cursor: editable ? 'pointer' : 'default',
                border: editable ? '2px dashed ' + tokens.colors.border : 'none'
              }}
            >
              🖼️ Click to add image
            </div>
          )}
          {editable && props.alt !== undefined && (
            <div className="mt-2">
              <InlineEditable
                value={props.alt || ''}
                onSave={(alt) => handleUpdate({ alt })}
                editable={editable}
                className="text-sm text-gray-600"
                placeholder="Image alt text..."
              />
            </div>
          )}
        </div>
      );

    case 'card':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {(props.cards || []).map((card: any, i: number) => (
            <div 
              key={i} 
              className="relative group"
              style={{ 
                backgroundColor: tokens.colors.surface, 
                borderRadius: tokens.borderRadius, 
                padding: '1.5rem', 
                border: `1px solid ${tokens.colors.border}`, 
                textAlign: 'center' 
              }}
            >
              {card.icon && (
                <InlineEditable
                  value={card.icon}
                  onSave={(icon) => {
                    const newCards = [...(props.cards || [])];
                    newCards[i] = { ...newCards[i], icon };
                    handleUpdate({ cards: newCards });
                  }}
                  editable={editable}
                  className="text-3xl mb-3 block"
                  placeholder="Icon..."
                />
              )}
              <InlineEditable
                value={card.title || ''}
                onSave={(title) => {
                  const newCards = [...(props.cards || [])];
                  newCards[i] = { ...newCards[i], title };
                  handleUpdate({ cards: newCards });
                }}
                editable={editable}
                style={{ fontWeight: '600', color: textColor, marginBottom: '0.5rem' }}
                placeholder="Card title..."
              />
              <InlineEditable
                value={card.description || ''}
                onSave={(description) => {
                  const newCards = [...(props.cards || [])];
                  newCards[i] = { ...newCards[i], description };
                  handleUpdate({ cards: newCards });
                }}
                editable={editable}
                multiline
                style={{ fontSize: '0.875rem', color: textColor, opacity: 0.7 }}
                placeholder="Card description..."
              />
            </div>
          ))}
        </div>
      );

    case 'stat':
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
          {(props.stats || []).map((stat: any, i: number) => (
            <div key={i} className="text-center">
              <InlineEditable
                value={stat.value || ''}
                onSave={(value) => {
                  const newStats = [...(props.stats || [])];
                  newStats[i] = { ...newStats[i], value };
                  handleUpdate({ stats: newStats });
                }}
                editable={editable}
                style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800', 
                  color: tokens.colors.primary, 
                  lineHeight: '1' 
                }}
                placeholder="0"
              />
              <InlineEditable
                value={stat.label || ''}
                onSave={(label) => {
                  const newStats = [...(props.stats || [])];
                  newStats[i] = { ...newStats[i], label };
                  handleUpdate({ stats: newStats });
                }}
                editable={editable}
                style={{ 
                  fontSize: '0.875rem', 
                  color: textColor, 
                  opacity: 0.7, 
                  marginTop: '0.5rem' 
                }}
                placeholder="Label..."
              />
            </div>
          ))}
        </div>
      );

    case 'testimonial':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {(props.testimonials || []).map((t: any, i: number) => (
            <div 
              key={i} 
              className="relative group"
              style={{ 
                backgroundColor: tokens.colors.surface, 
                borderRadius: tokens.borderRadius, 
                padding: '1.5rem', 
                border: `1px solid ${tokens.colors.border}` 
              }}
            >
              <InlineEditable
                value={t.text || ''}
                onSave={(text) => {
                  const newTestimonials = [...(props.testimonials || [])];
                  newTestimonials[i] = { ...newTestimonials[i], text };
                  handleUpdate({ testimonials: newTestimonials });
                }}
                editable={editable}
                multiline
                style={{ 
                  fontSize: '0.9rem', 
                  color: textColor, 
                  opacity: 0.8, 
                  lineHeight: '1.7', 
                  marginBottom: '1rem', 
                  fontStyle: 'italic' 
                }}
                placeholder="Testimonial text..."
              />
              <div>
                <InlineEditable
                  value={t.name || ''}
                  onSave={(name) => {
                    const newTestimonials = [...(props.testimonials || [])];
                    newTestimonials[i] = { ...newTestimonials[i], name };
                    handleUpdate({ testimonials: newTestimonials });
                  }}
                  editable={editable}
                  style={{ fontWeight: '600', color: textColor, fontSize: '0.875rem' }}
                  placeholder="Name..."
                />
                <InlineEditable
                  value={t.role || ''}
                  onSave={(role) => {
                    const newTestimonials = [...(props.testimonials || [])];
                    newTestimonials[i] = { ...newTestimonials[i], role };
                    handleUpdate({ testimonials: newTestimonials });
                  }}
                  editable={editable}
                  style={{ fontSize: '0.75rem', color: textColor, opacity: 0.6 }}
                  placeholder="Role..."
                />
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: tokens.colors.surfaceAlt, 
          borderRadius: tokens.borderRadius, 
          textAlign: 'center', 
          color: tokens.colors.textMuted, 
          fontSize: '0.85rem' 
        }}>
          [{type}] Component
        </div>
      );
  }
}
