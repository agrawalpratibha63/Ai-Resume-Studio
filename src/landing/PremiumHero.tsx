import { motion } from 'framer-motion';
import { ArrowRight, FileUp, PenLine, Sparkles, LayoutTemplate, WandSparkles, Check } from 'lucide-react';
import './PremiumHero.css';

interface Props { onGetStarted: () => void; }
const steps = [
  ['01','Add your story','Upload a resume or enter your details yourself. You always stay in control.'],
  ['02','Choose your style','Preview distinct portfolio templates and choose one that fits your work.'],
  ['03','Make it yours','Refine the copy, edit sections and preview the final website.'],
];

export default function PremiumHero({ onGetStarted }: Props) {
  return <main className="studio-home">
    <nav className="studio-nav"><a className="studio-brand" href="#studio-top"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{display:'inline',verticalAlign:'middle',marginRight:'6px'}}><rect x="3" y="3" width="8" height="8" rx="2" fill="#e63946"/><rect x="13" y="3" width="8" height="8" rx="2" fill="#e63946" opacity="0.6"/><rect x="3" y="13" width="8" height="8" rx="2" fill="#e63946" opacity="0.6"/><rect x="13" y="13" width="8" height="8" rx="2" fill="#e63946" opacity="0.35"/></svg><span>Portfolio</span>Studio</a><div className="studio-links"><a href="#how">How it works</a><a href="#create">Create</a><a href="#templates">Templates</a></div><button onClick={onGetStarted}>Start building <ArrowRight size={15}/></button></nav>
    <section className="studio-hero" id="studio-top">
      <motion.div className="studio-kicker" initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>A portfolio studio for real people</motion.div>
      <motion.h1 initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>Your experience,<br/><em>beautifully presented.</em></motion.h1>
      <p>Turn the work you have already done into a clear, personal portfolio website—without writing code or fighting with complicated tools.</p>
      <div className="studio-hero-actions"><button className="studio-primary" onClick={onGetStarted}>Create my portfolio <ArrowRight size={17}/></button><a href="#how">See how it works</a></div>
      <div className="studio-proof"><span><Check size={14}/> PDF & DOCX</span><span><Check size={14}/> Editable content</span><span><Check size={14}/> Multiple templates</span></div>
    </section>
    <section className="studio-process" id="how"><div className="studio-section-heading"><span>Simple by design</span><h2>From information to a finished website.</h2><p>A guided flow keeps every step understandable.</p></div><div className="studio-step-grid">{steps.map(s=><article key={s[0]}><small>{s[0]}</small><h3>{s[1]}</h3><p>{s[2]}</p></article>)}</div></section>
    <section className="studio-create" id="create"><div className="studio-section-heading"><span>Choose your starting point</span><h2>Bring a resume—or begin fresh.</h2></div><div className="studio-choice-grid">
      <motion.button onClick={onGetStarted} whileHover={{y:-6}}><div className="choice-icon"><FileUp size={23}/></div><small>Fastest route</small><h3>Import my resume</h3><p>Let AI organise your resume into portfolio sections, then review everything before using it.</p><b>Upload resume <ArrowRight size={15}/></b></motion.button>
      <motion.button onClick={onGetStarted} whileHover={{y:-6}}><div className="choice-icon"><PenLine size={23}/></div><small>Guided route</small><h3>Enter details myself</h3><p>Build step by step with AI bio refinement and relevant skill recommendations.</p><b>Start from scratch <ArrowRight size={15}/></b></motion.button>
    </div></section>
    <section className="studio-features" id="templates"><div className="studio-feature-copy"><span>Made around your content</span><h2>No empty sections.<br/>No generic filler.</h2><p>Your final website only shows the information you add. Balanced typography and spacing keep long content easy to read.</p><button onClick={onGetStarted}>Explore templates <ArrowRight size={15}/></button></div><div className="studio-feature-list">
      <article><LayoutTemplate/><div><h3>Curated templates</h3><p>Responsive layouts designed for different professions.</p></div></article><article><Sparkles/><div><h3>Thoughtful AI assistance</h3><p>Improve your words without replacing your voice or inventing facts.</p></div></article><article><WandSparkles/><div><h3>Easy customisation</h3><p>Adjust content, colours and presentation before downloading.</p></div></article>
    </div></section>
    <section className="studio-final"><span>Ready when you are</span><h2>A professional home for your work.</h2><p>Start with what you have. Refine it as you grow.</p><button onClick={onGetStarted}>Build my portfolio <ArrowRight size={17}/></button></section>
    <footer className="studio-footer"><div className="studio-brand"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{display:'inline',verticalAlign:'middle',marginRight:'5px'}}><rect x="3" y="3" width="8" height="8" rx="2" fill="#e63946"/><rect x="13" y="3" width="8" height="8" rx="2" fill="#e63946" opacity="0.6"/><rect x="3" y="13" width="8" height="8" rx="2" fill="#e63946" opacity="0.6"/><rect x="13" y="13" width="8" height="8" rx="2" fill="#e63946" opacity="0.35"/></svg><span>Portfolio</span>Studio</div><p>Resume to portfolio, made simple.</p><small>© 2026 PortfolioStudio</small></footer>
  </main>;
}
