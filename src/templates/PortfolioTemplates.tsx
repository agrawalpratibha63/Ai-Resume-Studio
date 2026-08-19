import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import type { PortfolioData, Project } from '../context/PortfolioContext';
import { EditableText, GithubIcon, LinkedinIcon, TwitterIcon, GlobeIcon } from './TemplateRenderer';
import './PortfolioTemplates.css';

type TplProps = { data: PortfolioData; isEditMode?: boolean; onSaveField: (field: string, val: any) => void };

/* =========================================================================
   SHARED PRIMITIVES
   ========================================================================= */

// Scroll-triggered reveal, direction-aware
const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  dir?: 'up' | 'left' | 'right' | 'scale';
}> = ({ children, className, delay = 0, dir = 'up' }) => {
  const variants = {
    up: { opacity: 0, y: 56 },
    left: { opacity: 0, x: -56 },
    right: { opacity: 0, x: 56 },
    scale: { opacity: 0, scale: 0.86 },
  }[dir];
  return (
    <motion.div
      className={className}
      initial={variants}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Real-time 3D mouse-tilt card (pointer-follow rotateX/rotateY)
const TiltCard: React.FC<{ children: React.ReactNode; className?: string; intensity?: number }> = ({ children, className, intensity = 14 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({
      transform: `perspective(1000px) rotateX(${-py * intensity}deg) rotateY(${px * intensity}deg) translateZ(10px)`,
    });
  };
  const onLeave = () => setStyle({ transform: 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)' });

  return (
    <div ref={ref} className={`tilt-card ${className || ''}`} style={style} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
};

const Media: React.FC<{ project: Project; className?: string; accent?: string; accent2?: string }> = ({ project, className, accent = '#888', accent2 = '#333' }) => {
  if (project.image) return <img src={project.image} alt={project.title} className={className} />;
  return (
    <div className={className} style={{ background: `linear-gradient(135deg, ${accent2} 0%, ${accent}22 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
      <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: accent, textTransform: 'uppercase', fontWeight: 600 }}>{project.title || 'Untitled'}</span>
    </div>
  );
};

const Socials: React.FC<{ data: PortfolioData; color: string; variant?: 'icon' | 'text' }> = ({ data, color, variant = 'icon' }) => {
  const { socialLinks } = data;
  const items: { key: string; href?: string; icon: React.ReactNode; label: string }[] = [
    { key: 'gh', href: socialLinks.github, icon: <GithubIcon size={18} />, label: 'GitHub' },
    { key: 'li', href: socialLinks.linkedin, icon: <LinkedinIcon size={18} />, label: 'LinkedIn' },
    { key: 'tw', href: socialLinks.twitter, icon: <TwitterIcon size={18} />, label: 'Twitter' },
    { key: 'po', href: socialLinks.portfolio, icon: <GlobeIcon size={18} />, label: 'Web' },
  ];
  return (
    <div className="pt-socials">
      {items.filter((i) => i.href).map((i) => (
        <a key={i.key} href={`https://${i.href}`} target="_blank" rel="noreferrer" style={{ color }} title={i.label}>
          {variant === 'icon' ? i.icon : i.label}
        </a>
      ))}
    </div>
  );
};

/* =========================================================================
   THEME REGISTRY
   Each theme is a fully distinct palette + pattern + layout combination.
   ========================================================================= */

type HeroVariant = 'centered-cosmic' | 'split-portrait' | 'fullbleed-glass' | 'asymmetric-editorial' | 'vertical-monogram' | 'schematic' | 'showcase-rotate' | 'stacked-sunset' | 'columns-serif' | 'glitch-terminal' | 'organic-flow';
type GridVariant = 'tilt-3d' | 'stacked-cards' | 'glass-panels' | 'mag-grid' | 'circular-orbit' | 'blueprint-cells' | 'gold-frames' | 'diagonal-scroll' | 'column-marble' | 'neon-cells' | 'blob-cluster';
type PatternVariant = 'stars' | 'grain' | 'aurora' | 'grid-glow' | 'petals' | 'blueprint' | 'gold-dust' | 'sunset-waves' | 'marble-veins' | 'scanlines' | 'organic-blobs';

interface Theme {
  id: string;
  name: string;
  desc: string;
  bg: string;
  bg2: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  accent2: string;
  font: string;
  displayFont: string;
  radius: string;
  hero: HeroVariant;
  grid: GridVariant;
  pattern: PatternVariant;
  uppercase?: boolean;
}

const THEMES: Record<string, Theme> = {
  zenith: {
    id: 'zenith', name: 'Zenith', desc: 'Cosmic 3D Depth Showcase',
    bg: '#05060f', bg2: '#0b0e21', surface: '#0f1330', text: '#f4f2ea', textMuted: '#9295b8',
    accent: '#e8c37a', accent2: '#6d5bd0', font: 'var(--font-sans)', displayFont: 'var(--font-serif)',
    radius: '2px', hero: 'centered-cosmic', grid: 'tilt-3d', pattern: 'stars',
  },
  ember: {
    id: 'ember', name: 'Ember', desc: 'Warm Copper Editorial Split',
    bg: '#1c1410', bg2: '#241a14', surface: '#2b1f18', text: '#f6ece0', textMuted: '#c7a68c',
    accent: '#e8703a', accent2: '#c04e2b', font: 'var(--font-modern)', displayFont: 'var(--font-display)',
    radius: '4px', hero: 'split-portrait', grid: 'stacked-cards', pattern: 'grain',
  },
  glacier: {
    id: 'glacier', name: 'Glacier', desc: 'Frosted Glass Fullbleed',
    bg: '#eef4f8', bg2: '#dce8f0', surface: 'rgba(255,255,255,0.55)', text: '#0c1a24', textMuted: '#5a7383',
    accent: '#2f8fc4', accent2: '#7fc9e8', font: 'var(--font-sans)', displayFont: 'var(--font-sans)',
    radius: '18px', hero: 'fullbleed-glass', grid: 'glass-panels', pattern: 'aurora',
  },
  obsidian: {
    id: 'obsidian', name: 'Obsidian', desc: 'Neon Editorial Asymmetry',
    bg: '#020203', bg2: '#0a0710', surface: '#0f0a1a', text: '#f0eaff', textMuted: '#8b82a8',
    accent: '#b565ff', accent2: '#33e6c9', font: 'var(--font-mono)', displayFont: 'var(--font-display)',
    radius: '0px', hero: 'asymmetric-editorial', grid: 'mag-grid', pattern: 'grid-glow', uppercase: true,
  },
  sakura: {
    id: 'sakura', name: 'Sakura', desc: 'Soft Floating Timeline',
    bg: '#fdf5f3', bg2: '#f9e7e3', surface: '#ffffff', text: '#3a2a2c', textMuted: '#946f74',
    accent: '#e08b9c', accent2: '#c9698e', font: 'var(--font-sans)', displayFont: 'var(--font-serif)',
    radius: '999px', hero: 'vertical-monogram', grid: 'circular-orbit', pattern: 'petals',
  },
  blueprint: {
    id: 'blueprint', name: 'Blueprint', desc: 'Technical Drafting Schematic',
    bg: '#0b1a2e', bg2: '#0e2138', surface: '#122943', text: '#dbeeff', textMuted: '#7fa0bd',
    accent: '#ffb347', accent2: '#6fb7e8', font: 'var(--font-mono)', displayFont: 'var(--font-mono)',
    radius: '0px', hero: 'schematic', grid: 'blueprint-cells', pattern: 'blueprint', uppercase: true,
  },
  velour: {
    id: 'velour', name: 'Velour', desc: 'Emerald & Gold Rotating Showcase',
    bg: '#0a1712', bg2: '#0f2119', surface: '#123023', text: '#f2ead2', textMuted: '#9db8a9',
    accent: '#d4af6a', accent2: '#3fae7a', font: 'var(--font-serif)', displayFont: 'var(--font-serif)',
    radius: '3px', hero: 'showcase-rotate', grid: 'gold-frames', pattern: 'gold-dust',
  },
  solstice: {
    id: 'solstice', name: 'Solstice', desc: 'Sunset Gradient Stacked Motion',
    bg: '#1a0f1f', bg2: '#2c1230', surface: '#33163a', text: '#fdf1ec', textMuted: '#d3a7c4',
    accent: '#ff8a5b', accent2: '#c65bd6', font: 'var(--font-modern)', displayFont: 'var(--font-display)',
    radius: '10px', hero: 'stacked-sunset', grid: 'diagonal-scroll', pattern: 'sunset-waves',
  },
  marble: {
    id: 'marble', name: 'Marble', desc: 'Monochrome Luxury Editorial',
    bg: '#f7f5f2', bg2: '#eceae5', surface: '#ffffff', text: '#141210', textMuted: '#6b665f',
    accent: '#141210', accent2: '#a08a5f', font: 'var(--font-sans)', displayFont: 'var(--font-serif)',
    radius: '0px', hero: 'columns-serif', grid: 'column-marble', pattern: 'marble-veins',
  },
  nova: {
    id: 'nova', name: 'Nova', desc: 'Cyberpunk Glitch Reveal',
    bg: '#040014', bg2: '#0a0326', surface: '#0f0836', text: '#eafcff', textMuted: '#8593c9',
    accent: '#00f0ff', accent2: '#ff2ea6', font: 'var(--font-mono)', displayFont: 'var(--font-mono)',
    radius: '2px', hero: 'glitch-terminal', grid: 'neon-cells', pattern: 'scanlines', uppercase: true,
  },
  terra: {
    id: 'terra', name: 'Terra', desc: 'Earthy Organic Flow',
    bg: '#f4efe4', bg2: '#e9e0cc', surface: '#fbf8f0', text: '#2e2a1f', textMuted: '#786f56',
    accent: '#8a6d3b', accent2: '#5c7a52', font: 'var(--font-sans)', displayFont: 'var(--font-serif)',
    radius: '28px', hero: 'organic-flow', grid: 'blob-cluster', pattern: 'organic-blobs',
  },
};

/* =========================================================================
   BACKGROUND PATTERN LAYER
   ========================================================================= */
const PatternLayer: React.FC<{ pattern: PatternVariant; theme: Theme }> = ({ pattern, theme }) => {
  switch (pattern) {
    case 'stars':
      return (
        <div className="pt-bg pt-bg-stars">
          {Array.from({ length: 60 }).map((_, i) => (
            <span key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 10) * 0.4}s`, width: i % 5 === 0 ? 3 : 1.5, height: i % 5 === 0 ? 3 : 1.5 }} />
          ))}
        </div>
      );
    case 'grain':
      return <div className="pt-bg pt-bg-grain" />;
    case 'aurora':
      return (
        <div className="pt-bg pt-bg-aurora">
          <span style={{ background: theme.accent }} />
          <span style={{ background: theme.accent2 }} />
        </div>
      );
    case 'grid-glow':
      return <div className="pt-bg pt-bg-gridglow" style={{ ['--gg' as any]: theme.accent }} />;
    case 'petals':
      return (
        <div className="pt-bg pt-bg-petals">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} style={{ left: `${(i * 23) % 100}%`, animationDelay: `${i * 1.1}s`, animationDuration: `${14 + (i % 5) * 2}s` }} />
          ))}
        </div>
      );
    case 'blueprint':
      return <div className="pt-bg pt-bg-blueprint" />;
    case 'gold-dust':
      return (
        <div className="pt-bg pt-bg-golddust">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} style={{ left: `${(i * 41) % 100}%`, top: `${(i * 29) % 100}%`, animationDelay: `${(i % 8) * 0.5}s` }} />
          ))}
        </div>
      );
    case 'sunset-waves':
      return <div className="pt-bg pt-bg-sunset" />;
    case 'marble-veins':
      return <div className="pt-bg pt-bg-marble" />;
    case 'scanlines':
      return <div className="pt-bg pt-bg-scanlines" />;
    case 'organic-blobs':
      return (
        <div className="pt-bg pt-bg-blobs">
          <span style={{ background: theme.accent }} />
          <span style={{ background: theme.accent2 }} />
        </div>
      );
    default:
      return null;
  }
};

/* =========================================================================
   HERO VARIANTS
   ========================================================================= */
const Hero: React.FC<TplProps & { theme: Theme }> = ({ data, isEditMode, onSaveField, theme }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 6]);

  const nameEl = (extraClass = '') => (
    <EditableText tagName="h1" className={`pt-hero-name ${extraClass}`} text={data.profile.name} onSave={(v) => onSaveField('profile.name', v)} isEditMode={isEditMode} />
  );
  const titleEl = (extraClass = '') => (
    <EditableText tagName="p" className={`pt-hero-title ${extraClass}`} text={data.profile.title} onSave={(v) => onSaveField('profile.title', v)} isEditMode={isEditMode} />
  );

  switch (theme.hero) {
    case 'split-portrait':
      return (
        <div ref={heroRef} className="pt-hero pt-hero-split">
          <motion.div className="pt-hero-split-text" style={{ opacity }}>
            <span className="pt-kicker">{data.profile.location || 'Portfolio'}</span>
            {nameEl()}
            {titleEl()}
            <Socials data={data} color={theme.accent} />
          </motion.div>
          <motion.div className="pt-hero-split-visual" style={{ scale, y }}>
            {data.profile.photo ? <img src={data.profile.photo} alt={data.profile.name} /> : <div className="pt-hero-split-placeholder" />}
            <div className="pt-hero-split-frame" />
          </motion.div>
        </div>
      );
    case 'fullbleed-glass':
      return (
        <div ref={heroRef} className="pt-hero pt-hero-fullbleed">
          <motion.div className="pt-glasspanel pt-hero-glasspanel" style={{ scale, opacity }}>
            {data.profile.photo && <img src={data.profile.photo} alt={data.profile.name} className="pt-hero-avatar-round" />}
            {nameEl()}
            {titleEl()}
            <Socials data={data} color={theme.accent} />
          </motion.div>
        </div>
      );
    case 'asymmetric-editorial':
      return (
        <div ref={heroRef} className="pt-hero pt-hero-asym">
          <motion.div style={{ y, opacity }} className="pt-hero-asym-big">
            {nameEl('pt-glow-text')}
          </motion.div>
          <div className="pt-hero-asym-side">
            {titleEl()}
            <span className="pt-mono-tag">// {data.profile.location || 'LOCATION_UNSET'}</span>
            <Socials data={data} color={theme.accent} />
          </div>
        </div>
      );
    case 'vertical-monogram':
      return (
        <div ref={heroRef} className="pt-hero pt-hero-vmono">
          <motion.span className="pt-vmono-word" style={{ opacity }}>{data.profile.title || 'PORTFOLIO'}</motion.span>
          <motion.div className="pt-vmono-center" style={{ scale, opacity }}>
            {data.profile.photo ? <img src={data.profile.photo} alt="" /> : <div className="pt-vmono-placeholder" />}
          </motion.div>
          {nameEl()}
          <Socials data={data} color={theme.accent} />
        </div>
      );
    case 'schematic':
      return (
        <div ref={heroRef} className="pt-hero pt-hero-schematic">
          <div className="pt-schematic-frame">
            <span className="pt-schematic-corner tl" /><span className="pt-schematic-corner tr" />
            <span className="pt-schematic-corner bl" /><span className="pt-schematic-corner br" />
            <span className="pt-mono-tag">FIG. 01 — SUBJECT PROFILE</span>
            {nameEl()}
            {titleEl()}
            <div className="pt-schematic-meta">
              <span>LOC: {data.profile.location || '—'}</span>
              <span>MAIL: {data.contact.email || '—'}</span>
            </div>
            <Socials data={data} color={theme.accent} />
          </div>
        </div>
      );
    case 'showcase-rotate':
      return (
        <div ref={heroRef} className="pt-hero pt-hero-showcase">
          <motion.div className="pt-showcase-ring" style={{ rotate }} />
          <motion.div style={{ opacity, scale }} className="pt-showcase-center">
            <span className="pt-kicker">{data.profile.location || 'Est.'}</span>
            {nameEl()}
            {titleEl()}
            <Socials data={data} color={theme.accent} />
          </motion.div>
        </div>
      );
    case 'stacked-sunset':
      return (
        <div ref={heroRef} className="pt-hero pt-hero-sunset">
          <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -60]) }} className="pt-sunset-layer l1">{nameEl()}</motion.div>
          <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -20]) }} className="pt-sunset-layer l2">{titleEl()}</motion.div>
          <motion.div style={{ opacity }} className="pt-sunset-layer l3"><Socials data={data} color={theme.accent} /></motion.div>
        </div>
      );
    case 'columns-serif':
      return (
        <div ref={heroRef} className="pt-hero pt-hero-columns">
          <div className="pt-columns-left">
            <span className="pt-kicker">Portfolio No. 01</span>
            {nameEl()}
          </div>
          <div className="pt-columns-right">
            {titleEl()}
            <p className="pt-columns-loc">{data.profile.location}</p>
            <Socials data={data} color={theme.accent} variant="text" />
          </div>
        </div>
      );
    case 'glitch-terminal':
      return (
        <div ref={heroRef} className="pt-hero pt-hero-glitch">
          <div className="pt-terminal-bar"><span /><span /><span /><em>~/portfolio/{(data.profile.name || 'user').toLowerCase().replace(/\s+/g, '_')}</em></div>
          <motion.div style={{ opacity }} className="pt-glitch-content">
            {nameEl('pt-glitch-name')}
            <div className="pt-terminal-caret">{titleEl()}</div>
            <Socials data={data} color={theme.accent} />
          </motion.div>
        </div>
      );
    case 'organic-flow':
      return (
        <div ref={heroRef} className="pt-hero pt-hero-organic">
          <motion.div className="pt-organic-blob-shape" style={{ scale }} />
          <motion.div style={{ opacity, y }} className="pt-organic-content">
            {data.profile.photo && <img src={data.profile.photo} alt="" className="pt-organic-photo" />}
            {nameEl()}
            {titleEl()}
            <Socials data={data} color={theme.accent} />
          </motion.div>
        </div>
      );
    default: // centered-cosmic
      return (
        <div ref={heroRef} className="pt-hero pt-hero-cosmic">
          <motion.div style={{ scale, opacity, y }} className="pt-cosmic-content">
            <span className="pt-kicker">{data.profile.location || 'A Digital Presence'}</span>
            {data.profile.photo && <img src={data.profile.photo} alt="" className="pt-hero-avatar-round" />}
            {nameEl()}
            {titleEl()}
            <Socials data={data} color={theme.accent} />
          </motion.div>
          <div className="pt-scrollcue">Scroll <span>↓</span></div>
        </div>
      );
  }
};

/* =========================================================================
   PROJECT GRID VARIANTS
   ========================================================================= */
const ProjectGrid: React.FC<{ data: PortfolioData; theme: Theme }> = ({ data, theme }) => {
  const variant = theme.grid;
  if (variant === 'tilt-3d' || variant === 'neon-cells' || variant === 'glass-panels') {
    return (
      <div className="pt-grid pt-grid-tilt">
        {data.projects.map((p, i) => (
          <Reveal key={i} delay={i * 0.08} dir="scale">
            <TiltCard className={`pt-projcard variant-${variant}`}>
              <div className="pt-projimgwrap"><Media project={p} className="pt-projimg" accent={theme.accent} accent2={theme.surface} /></div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="pt-tags">{p.tags?.map((t, ti) => <span key={ti}>{t}</span>)}</div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    );
  }
  if (variant === 'stacked-cards' || variant === 'gold-frames' || variant === 'column-marble') {
    return (
      <div className="pt-grid pt-grid-stack">
        {data.projects.map((p, i) => (
          <Reveal key={i} delay={i * 0.1} dir={i % 2 === 0 ? 'left' : 'right'}>
            <div className={`pt-projrow variant-${variant}`}>
              <div className="pt-projimgwrap"><Media project={p} className="pt-projimg" accent={theme.accent} accent2={theme.surface} /></div>
              <div className="pt-projinfo">
                <span className="pt-mono-tag">0{i + 1}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="pt-tags">{p.tags?.map((t, ti) => <span key={ti}>{t}</span>)}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    );
  }
  if (variant === 'mag-grid') {
    return (
      <div className="pt-grid pt-grid-mag">
        {data.projects.map((p, i) => (
          <Reveal key={i} delay={i * 0.06} dir="up" className={i % 3 === 0 ? 'pt-mag-wide' : ''}>
            <TiltCard className="pt-projcard variant-mag" intensity={8}>
              <div className="pt-projimgwrap"><Media project={p} className="pt-projimg" accent={theme.accent} accent2={theme.surface} /></div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    );
  }
  if (variant === 'circular-orbit') {
    return (
      <div className="pt-grid pt-grid-orbit">
        {data.projects.map((p, i) => (
          <Reveal key={i} delay={i * 0.09} dir="scale">
            <div className="pt-orbit-card">
              <div className="pt-orbit-imgwrap"><Media project={p} className="pt-orbit-img" accent={theme.accent} accent2={theme.surface} /></div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    );
  }
  if (variant === 'blueprint-cells') {
    return (
      <div className="pt-grid pt-grid-blueprint">
        {data.projects.map((p, i) => (
          <Reveal key={i} delay={i * 0.07} dir="up">
            <div className="pt-bp-cell">
              <span className="pt-mono-tag">FIG.{String(i + 2).padStart(2, '0')}</span>
              <div className="pt-projimgwrap"><Media project={p} className="pt-projimg" accent={theme.accent} accent2={theme.surface} /></div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="pt-tags">{p.tags?.map((t, ti) => <span key={ti}>{t}</span>)}</div>
            </div>
          </Reveal>
        ))}
      </div>
    );
  }
  if (variant === 'diagonal-scroll') {
    return (
      <div className="pt-grid pt-grid-diagonal">
        {data.projects.map((p, i) => (
          <Reveal key={i} delay={i * 0.1} dir={i % 2 === 0 ? 'left' : 'right'} className="pt-diag-item" >
            <TiltCard className="pt-projcard variant-diagonal" intensity={10}>
              <div className="pt-projimgwrap"><Media project={p} className="pt-projimg" accent={theme.accent} accent2={theme.surface} /></div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    );
  }
  // blob-cluster
  return (
    <div className="pt-grid pt-grid-blob">
      {data.projects.map((p, i) => (
        <Reveal key={i} delay={i * 0.08} dir="scale">
          <div className="pt-blob-card">
            <div className="pt-projimgwrap"><Media project={p} className="pt-projimg" accent={theme.accent} accent2={theme.surface} /></div>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
};

/* =========================================================================
   MASTER TEMPLATE BODY (shared section rhythm, theme-skinned)
   ========================================================================= */
const ThemeTemplate: React.FC<TplProps & { theme: Theme }> = ({ data, isEditMode, onSaveField, theme }) => {
  const { scrollYProgress } = useScroll();
  const barScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const cssVars: React.CSSProperties = {
    ['--pt-bg' as any]: theme.bg,
    ['--pt-bg2' as any]: theme.bg2,
    ['--pt-surface' as any]: theme.surface,
    ['--pt-text' as any]: theme.text,
    ['--pt-muted' as any]: theme.textMuted,
    ['--pt-accent' as any]: theme.accent,
    ['--pt-accent2' as any]: theme.accent2,
    ['--pt-font' as any]: theme.font,
    ['--pt-display' as any]: theme.displayFont,
    ['--pt-radius' as any]: theme.radius,
  };

  return (
    <div className={`pt-root theme-${theme.id} ${theme.uppercase ? 'pt-uppercase' : ''}`} style={cssVars}>
      <motion.div className="pt-progress" style={{ scaleX: barScale, background: theme.accent }} />
      <PatternLayer pattern={theme.pattern} theme={theme} />

      <Hero data={data} isEditMode={isEditMode} onSaveField={onSaveField} theme={theme} />

      <section className="pt-section">
        <Reveal><span className="pt-kicker">01 — About</span></Reveal>
        <Reveal delay={0.08}>
          <EditableText tagName="p" type="textarea" className="pt-about" text={data.about} onSave={(v) => onSaveField('about', v)} isEditMode={isEditMode} />
        </Reveal>
      </section>

      {data.skills.length > 0 && (
        <section className="pt-section">
          <Reveal><span className="pt-kicker">02 — Capabilities</span></Reveal>
          <div className="pt-skillrow">
            {data.skills.map((s, i) => (
              <Reveal key={i} delay={Math.min(i * 0.04, 0.5)} dir="scale" className="pt-skillpill">{s}</Reveal>
            ))}
          </div>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="pt-section">
          <Reveal><span className="pt-kicker">03 — Experience</span></Reveal>
          <div className="pt-timeline">
            {data.experience.map((e, i) => (
              <Reveal key={i} delay={i * 0.08} dir={i % 2 === 0 ? 'left' : 'right'} className="pt-exprow">
                <div className="pt-expdot" />
                <div>
                  <div className="pt-exphead"><strong>{e.role}</strong><span className="pt-mono-tag">{e.period}</span></div>
                  <div className="pt-expcompany">{e.company}</div>
                  <p className="pt-expdesc">{e.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="pt-section">
          <Reveal><span className="pt-kicker">04 — Selected Work</span></Reveal>
          <ProjectGrid data={data} theme={theme} />
        </section>
      )}

      {(data.education.length > 0 || data.certificates.length > 0) && (
        <section className="pt-section">
          <Reveal><span className="pt-kicker">05 — Credentials</span></Reveal>
          <div className="pt-credgrid">
            {data.education.length > 0 && (
              <Reveal dir="left" className="pt-credcol">
                <h4 className="pt-credtitle">Education</h4>
                {data.education.map((edu, i) => (
                  <div key={i} className="pt-creditem">
                    <strong>{edu.school}</strong>
                    <span>{edu.degree} · {edu.period}</span>
                  </div>
                ))}
              </Reveal>
            )}
            {data.certificates.length > 0 && (
              <Reveal dir="right" className="pt-credcol">
                <h4 className="pt-credtitle">Certifications</h4>
                {data.certificates.map((c, i) => (
                  <div key={i} className="pt-creditem">
                    <strong>{c.title}</strong>
                    <span>{c.issuer} · {c.date}</span>
                  </div>
                ))}
              </Reveal>
            )}
          </div>
        </section>
      )}

      {data.additionalSections?.map((section, sectionIndex) => (
        <section className="pt-section" key={`${section.title}-${sectionIndex}`}>
          <Reveal>
            <span className="pt-kicker">
              {String(sectionIndex + 6).padStart(2, '0')} — {section.title}
            </span>
          </Reveal>
          <div className="pt-extra-grid">
            {section.items.map((item, itemIndex) => (
              <Reveal key={itemIndex} delay={Math.min(itemIndex * 0.07, 0.35)} dir="up">
                <article className="pt-extra-card">
                  <div className="pt-exphead">
                    <strong>{item.heading}</strong>
                    {item.period && <span className="pt-mono-tag">{item.period}</span>}
                  </div>
                  {item.subheading && <div className="pt-expcompany">{item.subheading}</div>}
                  {item.description && <p className="pt-expdesc">{item.description}</p>}
                  {item.url && <a className="pt-extra-link" href={item.url} target="_blank" rel="noreferrer">View reference ↗</a>}
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      ))}

      <footer className="pt-footer">
        <Reveal dir="scale">
          <span className="pt-kicker">Get in touch</span>
          <a href={`mailto:${data.contact.email}`} className="pt-footer-email">{data.contact.email}</a>
          <Socials data={data} color={theme.accent} />
        </Reveal>
      </footer>
    </div>
  );
};

/* =========================================================================
   EXPORTED TEMPLATES — 11 distinct, cinematic, premium designs
   ========================================================================= */
export const ZenithTemplate: React.FC<TplProps> = (props) => <ThemeTemplate {...props} theme={THEMES.zenith} />;
export const EmberTemplate: React.FC<TplProps> = (props) => <ThemeTemplate {...props} theme={THEMES.ember} />;
export const GlacierTemplate: React.FC<TplProps> = (props) => <ThemeTemplate {...props} theme={THEMES.glacier} />;
export const ObsidianTemplate: React.FC<TplProps> = (props) => <ThemeTemplate {...props} theme={THEMES.obsidian} />;
export const SakuraTemplate: React.FC<TplProps> = (props) => <ThemeTemplate {...props} theme={THEMES.sakura} />;
export const BlueprintTemplate: React.FC<TplProps> = (props) => <ThemeTemplate {...props} theme={THEMES.blueprint} />;
export const VelourTemplate: React.FC<TplProps> = (props) => <ThemeTemplate {...props} theme={THEMES.velour} />;
export const SolsticeTemplate: React.FC<TplProps> = (props) => <ThemeTemplate {...props} theme={THEMES.solstice} />;
export const MarbleTemplate: React.FC<TplProps> = (props) => <ThemeTemplate {...props} theme={THEMES.marble} />;
export const NovaTemplate: React.FC<TplProps> = (props) => <ThemeTemplate {...props} theme={THEMES.nova} />;
export const TerraTemplate: React.FC<TplProps> = (props) => <ThemeTemplate {...props} theme={THEMES.terra} />;

export const PORTFOLIO_THEMES = THEMES;
