import React, { useState, useEffect } from 'react';
import type { PortfolioData } from '../context/PortfolioContext';
import {
  ZenithTemplate,
  EmberTemplate,
  GlacierTemplate,
  ObsidianTemplate,
  SakuraTemplate,
  BlueprintTemplate,
  VelourTemplate,
  SolsticeTemplate,
  MarbleTemplate,
  NovaTemplate,
  TerraTemplate,
} from './PortfolioTemplates';

// Inline Custom Brand SVGs
export const GithubIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

export const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export const TwitterIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

export const GlobeIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z" />
  </svg>
);

// Inline Editable Text Wrapper
interface EditableTextProps {
  text: string;
  onSave: (val: string) => void;
  isEditMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: 'input' | 'textarea';
  tagName?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export const EditableText: React.FC<EditableTextProps> = ({
  text,
  onSave,
  isEditMode = false,
  className = '',
  style = {},
  type = 'input',
  tagName = 'p'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);

  useEffect(() => {
    setValue(text);
  }, [text]);

  const handleBlur = () => {
    setIsEditing(false);
    onSave(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type === 'input') {
      setIsEditing(false);
      onSave(value);
    }
    if (e.key === 'Escape') {
      setValue(text);
      setIsEditing(false);
    }
  };

  if (isEditMode) {
    if (isEditing) {
      if (type === 'textarea') {
        return (
          <textarea
            className={`editable-textarea-active ${className}`}
            style={{ 
              width: '100%', 
              background: 'rgba(230, 57, 70, 0.05)', 
              border: '1px dashed var(--accent-color)', 
              color: 'inherit',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              padding: '0.4rem',
              resize: 'vertical',
              outline: 'none',
              ...style
            }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            autoFocus
          />
        );
      }
      return (
        <input
          className={`editable-input-active ${className}`}
          style={{ 
            background: 'rgba(230, 57, 70, 0.05)', 
            border: '1px dashed var(--accent-color)', 
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            width: '100%',
            outline: 'none',
            padding: '0.2rem',
            ...style
          }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      );
    }

    const Tag = tagName as any;
    return (
      <Tag
        className={`editable-hover-target ${className}`}
        style={{ 
          cursor: 'pointer', 
          border: '1px solid transparent',
          position: 'relative',
          ...style
        }}
        onClick={() => setIsEditing(true)}
        title="Click to edit inline"
      >
        {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty (Click to edit)</span>}
        <span 
          style={{ 
            position: 'absolute', 
            top: '-15px', 
            right: 0, 
            fontSize: '0.55rem', 
            color: 'var(--accent-color)', 
            background: 'var(--bg-primary)', 
            padding: '2px 4px', 
            border: '1px solid var(--accent-color)',
            opacity: 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none'
          }}
          className="editable-tooltip"
        >
          EDIT
        </span>
        <style>{`
          .editable-hover-target:hover { border-color: rgba(230, 57, 70, 0.3) !important; background: rgba(230, 57, 70, 0.01); }
          .editable-hover-target:hover .editable-tooltip { opacity: 1 !important; }
        `}</style>
      </Tag>
    );
  }

  const Tag = tagName as any;
  return <Tag className={className} style={style}>{text}</Tag>;
};

// ----------------------------------------------------
// MAIN ROUTER ORCHESTRATOR
// ----------------------------------------------------
interface TemplateRendererProps {
  data: PortfolioData;
  isEditMode?: boolean;
  onSaveField?: (field: string, val: any) => void;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  data,
  isEditMode = false,
  onSaveField = () => {}
}) => {
  const hasText = (...values: unknown[]) => values.some((value) => typeof value === 'string' && value.trim());
  const cleanData: PortfolioData = {
    ...data,
    about: data.about?.trim() || '',
    skills: data.skills.filter((skill) => skill.trim()),
    experience: data.experience.filter((item) => hasText(item.company, item.role, item.period, item.description)),
    education: data.education.filter((item) => hasText(item.school, item.degree, item.period)),
    projects: data.projects.filter((item) => hasText(item.title, item.description, item.url) || item.tags.some((tag) => tag.trim())),
    certificates: data.certificates.filter((item) => hasText(item.title, item.issuer, item.date)),
    additionalSections: (data.additionalSections || []).map((section) => ({
      ...section,
      items: section.items.filter((item) => hasText(item.heading, item.subheading, item.period, item.description, item.url)),
    })).filter((section) => section.title.trim() && section.items.length > 0),
  };
  const currentTemplate = cleanData.template.toLowerCase();

  switch (currentTemplate) {
    case 'zenith':
      return <ZenithTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
    case 'ember':
      return <EmberTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
    case 'glacier':
      return <GlacierTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
    case 'obsidian':
      return <ObsidianTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
    case 'sakura':
      return <SakuraTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
    case 'blueprint':
      return <BlueprintTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
    case 'velour':
      return <VelourTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
    case 'solstice':
      return <SolsticeTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
    case 'marble':
      return <MarbleTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
    case 'nova':
      return <NovaTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
    case 'terra':
      return <TerraTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
    default:
      return <ZenithTemplate data={cleanData} isEditMode={isEditMode} onSaveField={onSaveField} />;
  }
};
