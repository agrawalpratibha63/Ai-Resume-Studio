import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Play, Code, ArrowLeft, X,
  ExternalLink, Download, FileCode, CheckCircle, Palette, Type, Sliders 
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import './LiveEditor.css';

interface LiveEditorProps {
  onBackToSelector: () => void;
}

type EditorState = 'editing' | 'compiling' | 'success';

export const LiveEditor: React.FC<LiveEditorProps> = ({ onBackToSelector }) => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const [editorState, setEditorState] = useState<EditorState>('editing');
  const [compileMessage, setCompileMessage] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [fullViewportMode, setFullViewportMode] = useState(false);

  // Customization palettes
  const accentColors = [
    { name: 'Crimson', value: '#e63946' },
    { name: 'Cyan', value: '#00f0ff' },
    { name: 'Emerald', value: '#2ec4b6' },
    { name: 'Gold', value: '#ffb703' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Pure White', value: '#ffffff' }
  ];

  const fontOptions = [
    { name: 'Outfit (Modern Sans)', value: 'Void' },
    { name: 'Space Grotesk (Tech Sans)', value: 'Orbit' },
    { name: 'Playfair Display (Elegant Serif)', value: 'Frame' },
    { name: 'Fira Code (Monospace)', value: 'Nexus' },
    { name: 'Syne (Bold Display)', value: 'Void-Display' }
  ];

  // Inline field updater
  const handleSaveField = (field: string, value: any) => {
    setPortfolioData(prev => {
      const copy = { ...prev };
      if (field.startsWith('profile.')) {
        const sub = field.split('.')[1] as keyof typeof copy.profile;
        copy.profile = { ...copy.profile, [sub]: value };
      } else if (field === 'about') {
        copy.about = value;
      }
      return copy;
    });
  };

  // Compile visual animation triggers
  const handleCompile = () => {
    setEditorState('compiling');
    const messages = [
      'WEAVING SEMANTIC DOM PARADIGMS...',
      'INJECTING DATA VECTORS...',
      'OPTIMIZING GRAPHICS RENDERS...',
      'EVALUATING ANIMATION SCRIPTS...',
      'COMPILATION SUCCESSFUL!'
    ];

    let step = 0;
    setCompileMessage(messages[0]);
    
    const interval = setInterval(() => {
      step++;
      if (step < messages.length) {
        setCompileMessage(messages[step]);
      } else {
        clearInterval(interval);
        setEditorState('success');
      }
    }, 1000);
  };

  // Generator for static HTML copy-bundle
  const generateStaticHtml = (): string => {
    const d = portfolioData;
    const accent = d.customization.accentColor;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${d.profile.name} // Digital Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Fira+Code&family=Space+Grotesk&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #050505;
      --bg-secondary: #0d0d0d;
      --text-primary: #f5f5f7;
      --text-secondary: #a1a1a6;
      --accent: ${accent};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: 'Outfit', sans-serif;
      line-height: 1.6;
      padding: 4rem 8vw;
      -webkit-font-smoothing: antialiased;
    }
    header { border-bottom: 1px solid #1c1c1e; padding-bottom: 3rem; margin-bottom: 4rem; }
    h1 { font-size: 3rem; color: #fff; margin-bottom: 0.5rem; }
    h2 { font-size: 1rem; text-transform: uppercase; color: var(--accent); letter-spacing: 0.2em; margin-bottom: 2rem; }
    .about-section { font-size: 1.5rem; font-weight: 300; color: #e5e5e7; margin-bottom: 4rem; max-width: 800px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 4rem; }
    .card { background: var(--bg-secondary); border: 1px solid #1c1c1e; padding: 2rem; border-radius: 4px; }
    .card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .tag { display: inline-block; font-size: 0.65rem; background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; margin-right: 0.3rem; border: 1px solid rgba(255,255,255,0.1); }
    footer { border-top: 1px solid #1c1c1e; padding-top: 3rem; margin-top: 4rem; text-align: center; font-size: 0.8rem; color: var(--text-secondary); }
    a { color: var(--accent); text-decoration: none; }
  </style>
</head>
<body>
  <header>
    <h1>${d.profile.name}</h1>
    <p style="color: var(--text-secondary); font-size: 1.1rem;">${d.profile.title} | ${d.profile.location}</p>
  </header>

  <main>
    <section class="about-section">
      <h2>Concept</h2>
      <p>${d.about}</p>
    </section>

    <h2 style="margin-bottom: 1.5rem;">Exhibited Works</h2>
    <section class="grid">
      ${d.projects.map(p => `
        <div class="card">
          <h3>${p.title}</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">${p.description}</p>
          <div>
            ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </section>

    <h2 style="margin-bottom: 1.5rem;">Capabilities</h2>
    <div style="margin-bottom: 4rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
      ${d.skills.map(s => `<span class="tag" style="font-size: 0.9rem; padding: 0.5rem 1rem;">${s}</span>`).join('')}
    </div>

    <h2 style="margin-bottom: 1.5rem;">Chronology</h2>
    <section class="grid">
      ${d.experience.map(e => `
        <div class="card">
          <span style="font-size: 0.8rem; color: var(--accent);">${e.period}</span>
          <h3>${e.company}</h3>
          <p style="text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary);">${e.role}</p>
          <p style="font-size: 0.85rem; margin-top: 0.5rem; color: #888;">${e.description}</p>
        </div>
      `).join('')}
    </section>
  </main>

  <footer>
    <p>Get in touch: <a href="mailto:${d.contact.email}">${d.contact.email}</a></p>
    <p style="margin-top: 1rem;">Generated via AURA Identity Engine</p>
  </footer>
</body>
</html>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateStaticHtml());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([generateStaticHtml()], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${portfolioData.profile.name.toLowerCase().replace(/\s+/g, '-')}-portfolio.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Switch template
  const handleTemplateChange = (key: string) => {
    setPortfolioData(prev => ({ ...prev, template: key }));
  };

  // Switch accent color
  const handleAccentChange = (color: string) => {
    setPortfolioData(prev => ({
      ...prev,
      customization: { ...prev.customization, accentColor: color }
    }));
  };

  // Switch font
  const handleFontChange = (font: string) => {
    setPortfolioData(prev => ({
      ...prev,
      customization: { ...prev.customization, fontFamily: font }
    }));
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {/* EDITING STATE */}
        {editorState === 'editing' && (
          <motion.div 
            key="editing-state"
            className="editor-viewport"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Floating Glass Control deck */}
            {!fullViewportMode && (
              <div className="editor-controls glass-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button className="photo-action-btn" style={{ padding: '0.4rem' }} onClick={onBackToSelector}>
                    <ArrowLeft size={14} />
                  </button>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Tuning Console</span>
                </div>

                {/* Section 1: Template Archetypes */}
                <div>
                  <div className="ctrl-section-title"><Sliders size={12} style={{ marginRight: '0.5rem' }} /> Archetype</div>
                  <div className="font-row">
                    {['Void', 'Crimson', 'Orbit', 'Frame', 'Nexus', 'Echo'].map(tpl => (
                      <div 
                        key={tpl}
                        className={`font-option ${portfolioData.template === tpl.toLowerCase() ? 'active' : ''}`}
                        onClick={() => handleTemplateChange(tpl.toLowerCase())}
                      >
                        <span>{tpl}</span>
                        {portfolioData.template === tpl.toLowerCase() && <Check size={14} style={{ color: 'var(--accent-color)' }} />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Colors */}
                <div>
                  <div className="ctrl-section-title"><Palette size={12} style={{ marginRight: '0.5rem' }} /> Accent Color</div>
                  <div className="swatch-grid">
                    {accentColors.map(color => (
                      <div 
                        key={color.name}
                        className={`color-swatch ${portfolioData.customization.accentColor === color.value ? 'active' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => handleAccentChange(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Section 3: Typography */}
                <div>
                  <div className="ctrl-section-title"><Type size={12} style={{ marginRight: '0.5rem' }} /> Primary Font</div>
                  <div className="font-row">
                    {fontOptions.map(font => (
                      <div 
                        key={font.name}
                        className={`font-option ${portfolioData.customization.fontFamily === font.value ? 'active' : ''}`}
                        onClick={() => handleFontChange(font.value)}
                      >
                        <span>{font.name}</span>
                        {portfolioData.customization.fontFamily === font.value && <Check size={14} style={{ color: 'var(--accent-color)' }} />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button compile */}
                <button 
                  className="cinematic-btn accent"
                  onClick={handleCompile}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Compile Portfolio <Play size={14} />
                </button>
              </div>
            )}

            {/* Simulated Live Viewport Browser */}
            <div 
              className="editor-preview-container"
              style={{ paddingLeft: fullViewportMode ? '1.5rem' : '360px' }}
            >
              <div className="mock-browser-frame">
                <div className="browser-header-mock">
                  <div className="browser-dots">
                    <div className="browser-dot" />
                    <div className="browser-dot" />
                    <div className="browser-dot" />
                  </div>
                  <div className="browser-address">
                    https://{portfolioData.profile.name.toLowerCase().replace(/\s+/g, '')}.identity.aura
                  </div>
                  <button 
                    className="photo-action-btn"
                    style={{ fontSize: '0.65rem' }}
                    onClick={() => setFullViewportMode(!fullViewportMode)}
                  >
                    {fullViewportMode ? 'Show Controls' : 'Fullscreen'}
                  </button>
                </div>
                
                {/* Live rendering panel */}
                <div style={{ height: 'calc(100vh - 6rem)', overflowY: 'auto' }}>
                  <TemplateRenderer 
                    data={portfolioData} 
                    isEditMode={true} 
                    onSaveField={handleSaveField} 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* COMPILING TRANSITION LAYER */}
        {editorState === 'compiling' && (
          <motion.div 
            key="compiling-state"
            className="compile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="compile-radar">
              <Code size={40} style={{ color: 'var(--accent-color)' }} />
            </div>
            <div className="compile-message">{compileMessage}</div>
          </motion.div>
        )}

        {/* COMPILATION SUCCESS SCREEN */}
        {editorState === 'success' && (
          <motion.div 
            key="success-state"
            className="success-viewport"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="success-container">
              <div className="success-icon-wrap">
                <CheckCircle size={36} strokeWidth={1.5} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
                Your Identity is Formed
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
                We have compiled the semantic information, layouts, and animations into your custom digital space. It is production ready and optimized.
              </p>

              <div className="success-actions">
                <button 
                  className="cinematic-btn accent"
                  onClick={() => {
                    setEditorState('editing');
                    setFullViewportMode(true);
                  }}
                >
                  View Live Site <ExternalLink size={14} />
                </button>
                
                <button 
                  className="cinematic-btn"
                  onClick={() => setShowCodeModal(true)}
                >
                  Export static code <FileCode size={14} />
                </button>

                <button 
                  className="photo-action-btn"
                  onClick={() => setEditorState('editing')}
                >
                  Back to Editor
                </button>
              </div>
            </div>

            {/* Code exporter modal */}
            {showCodeModal && (
              <div className="code-modal-overlay">
                <div className="code-modal-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase', fontWeight: 700 }}>STATIC EXPORT BUNDLE</h2>
                    <button className="tag-delete-btn" onClick={() => setShowCodeModal(false)}><X size={20} /></button>
                  </div>
                  
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Copy this single-file layout representation. You can drop this directly into standard web hosts (GitHub Pages, Netlify, Vercel) for an instant online presence.
                  </p>

                  <pre className="code-pre-box">
                    <code>{generateStaticHtml()}</code>
                  </pre>

                  <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-end' }}>
                    <button className="photo-action-btn" onClick={handleDownloadCode} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Download size={12} /> Download .html
                    </button>
                    <button className="cinematic-btn accent" onClick={handleCopyCode} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.5rem', fontSize: '0.75rem' }}>
                      {copiedCode ? <><Check size={12} /> Copied</> : <><Code size={12} /> Copy Code</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
