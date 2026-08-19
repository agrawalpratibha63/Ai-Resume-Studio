import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { House, ArrowLeft } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import type { PortfolioData } from '../context/PortfolioContext';
import { TemplateRenderer } from './TemplateRenderer';
import './TemplateSelector.css';

interface TemplateSelectorProps {
  onSelectTemplate: (templateName: string) => void;
  onExitHome: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, onExitHome }) => {
  const { portfolioData } = usePortfolio();
  const [showRevealText, setShowRevealText] = useState(true);

  // Show "NOW LET'S GIVE YOUR STORY A FORM" message for 2.5 seconds before loading the list
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRevealText(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const templatesList = [
    { name: 'Zenith', key: 'zenith', desc: 'Cosmic 3D Depth Showcase' },
    { name: 'Ember', key: 'ember', desc: 'Warm Copper Editorial Split' },
    { name: 'Glacier', key: 'glacier', desc: 'Frosted Glass Fullbleed' },
    { name: 'Obsidian', key: 'obsidian', desc: 'Neon Editorial Asymmetry' },
    { name: 'Sakura', key: 'sakura', desc: 'Soft Floating Timeline' },
    { name: 'Blueprint', key: 'blueprint', desc: 'Technical Drafting Schematic' },
    { name: 'Velour', key: 'velour', desc: 'Emerald & Gold Rotating Showcase' },
    { name: 'Solstice', key: 'solstice', desc: 'Sunset Gradient Stacked Motion' },
    { name: 'Marble', key: 'marble', desc: 'Monochrome Luxury Editorial' },
    { name: 'Nova', key: 'nova', desc: 'Cyberpunk Glitch Reveal' },
    { name: 'Terra', key: 'terra', desc: 'Earthy Organic Flow' }
  ];

  return (
    <div className="selector-viewport">
      <div className="selector-nav-actions">
        <button className="exit-home-btn" onClick={onExitHome}><House size={19} /> Exit to Home</button>
        {!showRevealText && <button className="secondary-nav-btn" onClick={onExitHome}><ArrowLeft size={18} /> Back</button>}
      </div>
      <AnimatePresence mode="wait">
        {showRevealText ? (
          <motion.div 
            key="reveal-text"
            style={{ 
              position: 'fixed', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'var(--bg-primary)',
              zIndex: 100
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <motion.span 
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.3em', color: 'var(--accent-color)', textTransform: 'uppercase' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                COMPILATION COMPLETE
              </motion.span>
              <motion.h1 
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 800, textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: '#fff' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                NOW LET'S GIVE<br/>
                YOUR STORY<br/>
                A FORM.
              </motion.h1>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="showroom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%' }}
          >
            <div className="selector-header">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-color)', letterSpacing: '0.25em' }}>SELECT A VISUAL CONTAINER</span>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', textTransform: 'uppercase', fontWeight: 800, marginTop: '1rem', color: '#fff' }}>Portfolio Archetypes</h1>
            </div>

            <div className="selector-grid">
              {templatesList.map((tpl) => {
                // Construct a mock preview data block injecting the user's details but forcing this specific template
                const previewData: PortfolioData = {
                  ...portfolioData,
                  template: tpl.key
                };

                return (
                  <div 
                    key={tpl.key} 
                    className="tpl-select-card"
                    onClick={() => onSelectTemplate(tpl.key)}
                  >
                    {/* Render the actual React template component scaled down inside a card */}
                    <div className="mini-preview-container">
                      <div className="mini-preview-scale">
                        <TemplateRenderer data={previewData} isEditMode={false} />
                      </div>
                    </div>
                    
                    <div className="tpl-card-details">
                      <div>
                        <h2 className="tpl-card-name">{tpl.name}</h2>
                        <span className="tpl-card-desc">{tpl.desc}</span>
                      </div>
                      <button className="use-design-btn">Use</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
