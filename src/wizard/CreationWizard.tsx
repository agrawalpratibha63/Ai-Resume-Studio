import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Upload, X, Sparkles, Plus, 
  Trash2, FileText, Check, Briefcase, GraduationCap, 
  Mail, Link as LinkIcon, User, AlertCircle, Code 
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import type { PortfolioData, Project, Experience, Education, Certificate } from '../context/PortfolioContext';
import './CreationWizard.css';
import { auth } from '../lib/firebase';

interface CreationWizardProps {
  onBackToLanding: () => void;
  onComplete: (data: PortfolioData) => void;
}

type Path = 'choice' | 'import' | 'import-processing' | 'import-review' | 'create';

export const CreationWizard: React.FC<CreationWizardProps> = ({ onBackToLanding, onComplete }) => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  
  // Navigation states
  const [currentPath, setCurrentPath] = useState<Path>('choice');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form State fields (initialized from context)
  const [profile, setProfile] = useState(portfolioData.profile);
  const [about, setAbout] = useState(portfolioData.about);
  const [skills, setSkills] = useState<string[]>(portfolioData.skills);
  const [projects, setProjects] = useState<Project[]>(portfolioData.projects);
  const [experience, setExperience] = useState<Experience[]>(portfolioData.experience);
  const [education, setEducation] = useState<Education[]>(portfolioData.education);
  const [certificates, setCertificates] = useState<Certificate[]>(portfolioData.certificates);
  const [contact, setContact] = useState(portfolioData.contact);
  const [socialLinks, setSocialLinks] = useState(portfolioData.socialLinks);

  // UI inputs helper
  const [skillInput, setSkillInput] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  
  // AI assistant state
  const [aiState, setAiState] = useState<{
    isActive: boolean;
    targetField: string;
    text: string;
    originalText: string;
    isGenerating: boolean;
  }>({
    isActive: false,
    targetField: '',
    text: '',
    originalText: '',
    isGenerating: false
  });

  // Simulated AI responses
  const aiSuggestions: { [key: string]: string[] } = {
    bio: [
    ],
    project: [
    ],
    experience: [
    ]
  };

  // AI assistant triggers
  const triggerAi = (field: string, currentText: string) => {
    setAiState({
      isActive: true,
      targetField: field,
      text: '',
      originalText: currentText,
      isGenerating: true
    });
  };

  // Run simulated typewriter generation
  useEffect(() => {
    if (!aiState.isGenerating) return;

    let targetText = '';
    if (aiState.targetField.includes('bio')) {
      targetText = aiSuggestions.bio[Math.floor(Math.random() * aiSuggestions.bio.length)];
    } else if (aiState.targetField.includes('project')) {
      targetText = aiSuggestions.project[Math.floor(Math.random() * aiSuggestions.project.length)];
    } else {
      targetText = aiSuggestions.experience[Math.floor(Math.random() * aiSuggestions.experience.length)];
    }

    let index = 0;
    const interval = setInterval(() => {
      setAiState(prev => ({
        ...prev,
        text: targetText.substring(0, index + 1)
      }));
      index++;
      if (index >= targetText.length) {
        clearInterval(interval);
        setAiState(prev => ({ ...prev, isGenerating: false }));
      }
    }, 25);

    return () => clearInterval(interval);
  }, [aiState.isGenerating]);

  const acceptAi = () => {
    const refinedText = aiState.text;
    const field = aiState.targetField;

    if (field === 'bio') {
      setAbout(refinedText);
    } else if (field.startsWith('project-')) {
      const idx = parseInt(field.split('-')[1]);
      const updated = [...projects];
      updated[idx].description = refinedText;
      setProjects(updated);
    } else if (field.startsWith('experience-')) {
      const idx = parseInt(field.split('-')[1]);
      const updated = [...experience];
      updated[idx].description = refinedText;
      setExperience(updated);
    }

    setAiState(prev => ({ ...prev, isActive: false }));
  };

  const cancelAi = () => {
    setAiState(prev => ({ ...prev, isActive: false }));
  };

  // Image uploads (photo & projects)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    let file: File | null = null;
    
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (file) {
      if (!file.type.startsWith('image/')) {
        setFileError("Please upload an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setProfile(prev => ({ ...prev, photo: uploadEvent.target!.result as string }));
          setFileError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProjectImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const updated = [...projects];
          updated[index].image = uploadEvent.target.result as string;
          setProjects(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const updated = [...certificates];
          updated[index].image = uploadEvent.target.result as string;
          setCertificates(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Skill Tags management
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  // Add/Remove experiences, projects, education, certificates
  const addProject = () => {
    setProjects(prev => [...prev, { title: '', description: '', image: '', tags: [], url: '' }]);
  };
  const removeProject = (index: number) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };
  const updateProjectField = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addExperience = () => {
    setExperience(prev => [...prev, { company: '', role: '', period: '', description: '' }]);
  };
  const removeExperience = (index: number) => {
    setExperience(prev => prev.filter((_, i) => i !== index));
  };
  const updateExperienceField = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const addEducation = () => {
    setEducation(prev => [...prev, { school: '', degree: '', period: '' }]);
  };
  const removeEducation = (index: number) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
  };
  const updateEducationField = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const addCertificate = () => {
    setCertificates(prev => [...prev, { title: '', issuer: '', date: '', image: '' }]);
  };
  const removeCertificate = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
  };
  const updateCertificateField = (index: number, field: keyof Certificate, value: string) => {
    const updated = [...certificates];
    updated[index] = { ...updated[index], [field]: value };
    setCertificates(updated);
  };

  // File Resume Import flow triggers
  const handleResumeFileSelect = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    let file: File | null = null;
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }
    
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        setFileError("Unsupported file type. Please upload a PDF or DOCX file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFileError("This file is larger than 10MB. Please upload a smaller resume.");
        return;
      }
      setFileError(null);
      setCurrentPath('import-processing');

      try {
        const formData = new FormData();
        formData.append('resume', file);
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error('Your session expired. Please sign in again.');
        const response = await fetch('/api/resume/parse', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}` },
          body: formData,
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'We could not read this resume. Please try again.');

        const data = result.data as PortfolioData;
        setProfile({ ...data.profile, photo: '' });
        setAbout(data.about || '');
        setSkills(data.skills || []);
        setProjects(data.projects || []);
        setExperience(data.experience || []);
        setEducation(data.education || []);
        setCertificates(data.certificates || []);
        setContact(data.contact || { email: '', phone: '', address: '' });
        setSocialLinks(data.socialLinks || {});
        setCurrentPath('import-review');
      } catch (error) {
        setFileError(error instanceof Error ? error.message : 'Resume parsing failed. Please try again.');
        setCurrentPath('import');
      }
    }
  };

  const handleFinishWizard = () => {
    // Collect all local forms and update context
    const finalData: PortfolioData = {
      ...portfolioData,
      profile,
      about,
      skills,
      projects,
      experience,
      education,
      certificates,
      contact,
      socialLinks
    };
    setPortfolioData(finalData);
    onComplete(finalData);
  };

  // Nav helpers
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinishWizard();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      setCurrentPath('choice');
    }
  };

  return (
    <div className="wizard-viewport">
      <div className="wizard-header">
        <div className="wizard-logo">AURA</div>
        <button className="wizard-exit" onClick={onBackToLanding}>Exit To Landing</button>
      </div>

      <div className="wizard-body">
        <AnimatePresence mode="wait">
          {/* Path Split Selection */}
          {currentPath === 'choice' && (
            <motion.div 
              key="split"
              className="split-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="path-option" onClick={() => setCurrentPath('import')}>
                <div>
                  <div className="path-header">Path 01 / Quick Parse</div>
                  <h2 className="path-title">Import<br/>Resume</h2>
                  <p className="path-desc">Drag and drop your existing PDF or DOCX resume. Our visual scanner will analyze your details and instantly structure them.</p>
                </div>
                <div style={{ alignSelf: 'flex-end', opacity: 0.5 }}><FileText size={48} strokeWidth={1} /></div>
              </div>

              <div className="path-option" onClick={() => setCurrentPath('create')}>
                <div>
                  <div className="path-header">Path 02 / Raw Narrative</div>
                  <h2 className="path-title">Create<br/>From Scratch</h2>
                  <p className="path-desc">Build your digital presence frame-by-frame. A progressive, narrative wizard to assemble your details from ground zero.</p>
                </div>
                <div style={{ alignSelf: 'flex-end', opacity: 0.5 }}><Plus size={48} strokeWidth={1} /></div>
              </div>
            </motion.div>
          )}

          {/* Import Upload Screen */}
          {currentPath === 'import' && (
            <motion.div 
              key="import-upload"
              className="wizard-card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <div>
                <button className="photo-action-btn" style={{ marginBottom: '2rem' }} onClick={() => setCurrentPath('choice')}>
                  <ArrowLeft size={12} style={{ marginRight: '0.5rem' }} /> Back
                </button>
                <div className="step-number">Resume Deconstruction</div>
                <h1 className="step-title">Upload your file</h1>
                
                <div 
                  className="photo-uploader"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleResumeFileSelect}
                  style={{ minHeight: '260px' }}
                >
                  <input 
                    type="file" 
                    id="resume-file" 
                    style={{ display: 'none' }} 
                    accept=".pdf,.docx" 
                    onChange={handleResumeFileSelect}
                  />
                  <label htmlFor="resume-file" style={{ cursor: 'pointer', width: '100%' }}>
                    <Upload size={40} strokeWidth={1} style={{ color: 'var(--accent-color)', marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>DRAG & DROP OR BROWSE</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports PDF and DOCX formats (Up to 10MB)</p>
                  </label>
                </div>
                {fileError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff4d4d', fontSize: '0.8rem', marginTop: '1rem' }}>
                    <AlertCircle size={16} /> {fileError}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Import Scanning State */}
          {currentPath === 'import-processing' && (
            <motion.div 
              key="processing"
              className="scanner-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="radar-sweep">
                <FileText size={48} strokeWidth={1} style={{ color: 'var(--accent-color)' }} />
                <div className="scanner-lines" />
              </div>
              <div className="scanner-text">Reading your resume with AI...</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Extracting profile, projects, experience, education, skills and links</p>
            </motion.div>
          )}

          {/* Import Review Page */}
          {currentPath === 'import-review' && (
            <motion.div 
              key="review"
              className="wizard-card"
              style={{ maxWidth: '800px' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h1 className="import-review-title">Review Extracted Identity</h1>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2.5rem' }}>We parsed your resume. Verify and tweak the information before compiling your portfolio site.</p>
                
                {/* Profile review */}
                <div className="review-section">
                  <div className="review-section-title"><User size={14} /> Profile Identity</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="creative-input-group">
                      <input 
                        className="creative-input" 
                        value={profile.name} 
                        onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                      />
                      <label className="creative-label">Full Name</label>
                    </div>
                    <div className="creative-input-group">
                      <input 
                        className="creative-input" 
                        value={profile.title} 
                        onChange={(e) => setProfile(p => ({ ...p, title: e.target.value }))}
                      />
                      <label className="creative-label">Professional Title</label>
                    </div>
                  </div>
                </div>

                {/* About & Bio review */}
                <div className="review-section">
                  <div className="review-section-title"><Sparkles size={14} /> Professional Narrative</div>
                  <div className="creative-input-group">
                    <textarea 
                      className="creative-input" 
                      style={{ height: '80px', resize: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                      value={about} 
                      onChange={(e) => setAbout(e.target.value)}
                    />
                    <label className="creative-label">About Bio</label>
                  </div>
                </div>

                {/* Skills Review */}
<div className="review-section">
  <div className="review-section-title">
    <Code size={14} /> Core Capabilities
  </div>

  {/* Add Skill */}
  <div
    className="creative-input-group"
    style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
  >
    <input
      className="creative-input"
      value={skillInput}
      onChange={(e) => setSkillInput(e.target.value)}
      placeholder=""
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addSkill();
        }
      }}
    />

    <button
      type="button"
      className="photo-action-btn"
      onClick={addSkill}
    >
      Add
    </button>
  </div>

  {/* Edit Skills */}
  {skills.length === 0 ? (
    <p
      style={{
        color: "var(--text-muted)",
        fontSize: "0.8rem",
        fontStyle: "italic",
      }}
    >
      No skills extracted.
    </p>
  ) : (
    skills.map((skill, idx) => (
      <div
        key={idx}
        className="creative-input-group"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <input
          className="creative-input"
          value={skill}
          onChange={(e) => {
            const updatedSkills = [...skills];
            updatedSkills[idx] = e.target.value;
            setSkills(updatedSkills);
          }}
          placeholder="Skill"
        />

        <button
          type="button"
          className="tag-delete-btn"
          onClick={() => {
            const updatedSkills = skills.filter((_, i) => i !== idx);
            setSkills(updatedSkills);
          }}
        >
          <X size={12} />
        </button>
      </div>
    ))
  )}
</div>

                {/* Projects Review */}
<div className="review-section">
  <div className="review-section-title">
    <FileText size={14} /> Projects
  </div>

  {projects.length === 0 ? (
    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
      No projects extracted.
    </p>
  ) : (
    projects.map((project, idx) => (
      <div key={idx} className="wizard-list-item">
        <div className="creative-input-group">
          <input
            className="creative-input"
            value={project.title}
            onChange={(e) => updateProjectField(idx, "title", e.target.value)}
          />
          <label className="creative-label">Project Title</label>
        </div>

        <div className="creative-input-group">
          <textarea
            className="creative-input"
            style={{ height: "70px", resize: "none" }}
            value={project.description}
            onChange={(e) =>
              updateProjectField(idx, "description", e.target.value)
            }
          />
          <label className="creative-label">Description</label>
        </div>
      </div>
    ))
  )}
</div>

{/* Experience Review */}
<div className="review-section">
  <div className="review-section-title">
    <Briefcase size={14} /> Experience
  </div>

  {experience.length === 0 ? (
    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
      No experience extracted.
    </p>
  ) : (
    experience.map((exp, idx) => (
      <div key={idx} className="wizard-list-item">
        <div className="creative-input-group">
          <input
            className="creative-input"
            value={exp.company}
            onChange={(e) =>
              updateExperienceField(idx, "company", e.target.value)
            }
          />
          <label className="creative-label">Company</label>
        </div>

        <div className="creative-input-group">
          <input
            className="creative-input"
            value={exp.role}
            onChange={(e) =>
              updateExperienceField(idx, "role", e.target.value)
            }
          />
          <label className="creative-label">Role</label>
        </div>

        <div className="creative-input-group">
          <textarea
            className="creative-input"
            value={exp.description}
            onChange={(e) =>
              updateExperienceField(idx, "description", e.target.value)
            }
          />
          <label className="creative-label">Description</label>
        </div>
      </div>
    ))
  )}
</div>

{/* Education Review */}
<div className="review-section">
  <div className="review-section-title">
    <GraduationCap size={14} /> Education
  </div>

  {education.length === 0 ? (
    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
      No education extracted.
    </p>
  ) : (
    education.map((edu, idx) => (
      <div key={idx} className="wizard-list-item">
        <div className="creative-input-group">
          <input
            className="creative-input"
            value={edu.school}
            onChange={(e) =>
              updateEducationField(idx, "school", e.target.value)
            }
          />
          <label className="creative-label">School</label>
        </div>

        <div className="creative-input-group">
          <input
            className="creative-input"
            value={edu.degree}
            onChange={(e) =>
              updateEducationField(idx, "degree", e.target.value)
            }
          />
          <label className="creative-label">Degree</label>
        </div>
      </div>
    ))
  )}
</div>

{/* Certificates Review */}
<div className="review-section">
  <div className="review-section-title">
    <Check size={14} /> Certificates
  </div>

  {certificates.length === 0 ? (
    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
      No certificates extracted.
    </p>
  ) : (
    certificates.map((cert, idx) => (
      <div key={idx} className="wizard-list-item">
        <div className="creative-input-group">
          <input
            className="creative-input"
            value={cert.title}
            onChange={(e) =>
              updateCertificateField(idx, "title", e.target.value)
            }
          />
          <label className="creative-label">Certificate</label>
        </div>

        <div className="creative-input-group">
          <input
            className="creative-input"
            value={cert.issuer}
            onChange={(e) =>
              updateCertificateField(idx, "issuer", e.target.value)
            }
          />
          <label className="creative-label">Issuer</label>
        </div>
      </div>
    ))
  )}
</div>

{/* Contact Review */}
<div className="review-section">
  <div className="review-section-title">
    <Mail size={14} /> Contact
  </div>

  <div className="creative-input-group">
    <input
      className="creative-input"
      value={contact.email}
      onChange={(e) =>
        setContact((c) => ({ ...c, email: e.target.value }))
      }
    />
    <label className="creative-label">Email</label>
  </div>

  <div className="creative-input-group">
    <input
      className="creative-input"
      value={contact.phone || ""}
      onChange={(e) =>
        setContact((c) => ({ ...c, phone: e.target.value }))
      }
    />
    <label className="creative-label">Phone</label>
  </div>
</div>

{/* Social Links Review */}
<div className="review-section">
  <div className="review-section-title">
    <LinkIcon size={14} /> Social Links
  </div>

  <div className="creative-input-group">
    <input
      className="creative-input"
      value={socialLinks.github || ""}
      onChange={(e) =>
        setSocialLinks((s) => ({ ...s, github: e.target.value }))
      }
    />
    <label className="creative-label">GitHub</label>
  </div>

  <div className="creative-input-group">
    <input
      className="creative-input"
      value={socialLinks.linkedin || ""}
      onChange={(e) =>
        setSocialLinks((s) => ({ ...s, linkedin: e.target.value }))
      }
    />
    <label className="creative-label">LinkedIn</label>
  </div>

  <div className="creative-input-group">
    <input
      className="creative-input"
      value={socialLinks.twitter || ""}
      onChange={(e) =>
        setSocialLinks((s) => ({ ...s, twitter: e.target.value }))
      }
    />
    <label className="creative-label">Twitter</label>
  </div>
</div>

                {/* Edit options trigger */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                  <button className="photo-action-btn" onClick={() => setCurrentPath('choice')}>
                    Re-upload
                  </button>
                  <button className="cinematic-btn accent" onClick={handleFinishWizard}>
                    Compile Portfolio <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Conversational Wizard steps */}
          {currentPath === 'create' && (
            <motion.div 
              key={`step-${currentStep}`}
              className="wizard-card"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{ flex: 1 }}>
                <div className="step-number">Step 0{currentStep} / 06</div>

                {/* STEP 1: Who are you */}
                {currentStep === 1 && (
                  <div>
                    <h1 className="step-title">About You</h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                      <div>
                        <div className="creative-input-group">
                          <input 
                            className="creative-input" 
                            value={profile.name} 
                            onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Lucas Sterling"
                          />
                          <label className="creative-label">Your Name</label>
                        </div>

                        <div className="creative-input-group">
                          <input 
                            className="creative-input" 
                            value={profile.title} 
                            onChange={(e) => setProfile(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Creative Interaction Designer"
                          />
                          <label className="creative-label">Professional Title</label>
                        </div>

                        <div className="creative-input-group">
                          <input 
                            className="creative-input" 
                            value={profile.location} 
                            onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
                            placeholder="e.g. Tokyo, JP"
                          />
                          <label className="creative-label">Location</label>
                        </div>
                      </div>

                      <div>
                        <span className="creative-label" style={{ marginBottom: '1rem', display: 'block' }}>Identity Portrait</span>
                        
                        {profile.photo ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="photo-preview-wrapper">
                              <img src={profile.photo} className="photo-preview" alt="Preview" />
                            </div>
                            <div className="photo-actions">
                              <button className="photo-action-btn" onClick={() => setProfile(p => ({ ...p, photo: '' }))}>Remove</button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="photo-uploader"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handlePhotoUpload}
                            style={{ height: '180px' }}
                          >
                            <input 
                              type="file" 
                              id="photo-file" 
                              style={{ display: 'none' }} 
                              accept="image/*"
                              onChange={handlePhotoUpload}
                            />
                            <label htmlFor="photo-file" style={{ cursor: 'pointer' }}>
                              <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                              <span style={{ fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Upload Portrait</span>
                            </label>
                          </div>
                        )}
                        {fileError && <p style={{ color: '#ff4d4d', fontSize: '0.7rem', marginTop: '0.5rem' }}>{fileError}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Bio & Skills */}
                {currentStep === 2 && (
                  <div>
                    <h1 className="step-title">Bio & Skills</h1>
                    
                    <div className="creative-input-group" style={{ marginBottom: '1rem' }}>
                      <textarea 
                        className="creative-input" 
                        style={{ height: '110px', resize: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                        value={about} 
                        onChange={(e) => setAbout(e.target.value)}
                        placeholder="Describe your design vision, engineering focus, and core narrative."
                      />
                      <label className="creative-label">Professional Narrative</label>
                      <button className="ai-trigger-btn" onClick={() => triggerAi('bio', about)}>
                        <Sparkles size={12} /> Refine bio with AI
                      </button>
                    </div>

                    {/* AI assistant box inside form */}
                    {aiState.isActive && aiState.targetField === 'bio' && (
                      <div className="ai-generating-overlay">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-color)' }}>AI NARRATIVE ASSISTANT</span>
                          {aiState.isGenerating && <span className="ai-cursor" />}
                        </div>
                        <p className="ai-typewriter-text">{aiState.text}</p>
                        {!aiState.isGenerating && (
                          <div className="ai-options">
                            <button className="photo-action-btn" onClick={acceptAi} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2ec4b6' }}>
                              <Check size={12} /> Accept
                            </button>
                            <button className="photo-action-btn" onClick={() => triggerAi('bio', about)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              Regenerate
                            </button>
                            <button className="photo-action-btn" onClick={cancelAi} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              Revert
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginTop: '2.5rem' }}>
                      <div className="creative-input-group" style={{ display: 'flex', gap: '1rem', borderBottom: 'none' }}>
                        <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <input 
                            className="creative-input" 
                            value={skillInput} 
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                            placeholder="Type a skill and hit enter"
                          />
                          <label className="creative-label">Core Capabilities</label>
                        </div>
                        <button className="photo-action-btn" style={{ height: '40px', marginTop: '10px' }} onClick={addSkill}>
                          Add
                        </button>
                      </div>

                      <div className="tags-container">
                        {skills.length === 0 ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No skills added yet</span>
                        ) : (
                          skills.map((skill, idx) => (
                            <span key={idx} className="tag-badge">
                              {skill}
                              <button className="tag-delete-btn" onClick={() => removeSkill(skill)}>
                                <X size={10} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Projects */}
                {currentStep === 3 && (
                  <div>
                    <h1 className="step-title">Projects</h1>
                    
                    <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {projects.map((project, idx) => (
                        <div key={idx} className="wizard-list-item">
                          <button className="item-delete-btn" onClick={() => removeProject(idx)}><Trash2 size={16} /></button>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                            <div>
                              <div className="creative-input-group">
                                <input 
                                  className="creative-input" 
                                  value={project.title} 
                                  onChange={(e) => updateProjectField(idx, 'title', e.target.value)}
                                  placeholder="e.g. Soundscape VR"
                                />
                                <label className="creative-label">Project Title</label>
                              </div>

                              <div className="creative-input-group" style={{ marginBottom: '0.5rem' }}>
                                <textarea 
                                  className="creative-input" 
                                  style={{ height: '70px', resize: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                                  value={project.description} 
                                  onChange={(e) => updateProjectField(idx, 'description', e.target.value)}
                                  placeholder="Explain the form, logic, and output."
                                />
                                <label className="creative-label">Description</label>
                                <button className="ai-trigger-btn" onClick={() => triggerAi(`project-${idx}`, project.description)}>
                                  <Sparkles size={12} /> Refine Description
                                </button>
                              </div>

                              {aiState.isActive && aiState.targetField === `project-${idx}` && (
                                <div className="ai-generating-overlay">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-color)' }}>AI PROJECT WRITER</span>
                                    {aiState.isGenerating && <span className="ai-cursor" />}
                                  </div>
                                  <p className="ai-typewriter-text">{aiState.text}</p>
                                  {!aiState.isGenerating && (
                                    <div className="ai-options">
                                      <button className="photo-action-btn" onClick={acceptAi} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2ec4b6' }}>
                                        <Check size={12} /> Accept
                                      </button>
                                      <button className="photo-action-btn" onClick={() => triggerAi(`project-${idx}`, project.description)}>Regenerate</button>
                                      <button className="photo-action-btn" onClick={cancelAi}>Revert</button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="creative-label" style={{ marginBottom: '0.5rem' }}>Visual Asset</span>
                              {project.image ? (
                                <div style={{ position: 'relative', width: '100%', height: '100px' }}>
                                  <img src={project.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="Project" />
                                  <button 
                                    className="photo-action-btn" 
                                    style={{ position: 'absolute', top: '0.2rem', right: '0.2rem', padding: '0.2rem', background: '#000' }}
                                    onClick={() => updateProjectField(idx, 'image', '')}
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ) : (
                                <div style={{ border: '1px dashed rgba(255,255,255,0.1)', width: '100%', height: '100px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <input 
                                    type="file" 
                                    id={`project-file-${idx}`} 
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={(e) => handleProjectImageUpload(idx, e)}
                                  />
                                  <label htmlFor={`project-file-${idx}`} style={{ cursor: 'pointer', textAlign: 'center' }}>
                                    <Upload size={18} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Upload</span>
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div className="creative-input-group" style={{ marginBottom: 0 }}>
                              <input 
                                className="creative-input" 
                                value={project.tags.join(', ')} 
                                onChange={(e) => updateProjectField(idx, 'tags', e.target.value.split(',').map(s => s.trim()))}
                                placeholder="Comma separated, e.g. Unity, Shaders"
                              />
                              <label className="creative-label">Technologies (Comma Separated)</label>
                            </div>
                            <div className="creative-input-group" style={{ marginBottom: 0 }}>
                              <input 
                                className="creative-input" 
                                value={project.url || ''} 
                                onChange={(e) => updateProjectField(idx, 'url', e.target.value)}
                                placeholder="e.g. github.com/user/repo"
                              />
                              <label className="creative-label">Project URL (Optional)</label>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button className="add-item-btn" onClick={addProject}>
                        <Plus size={14} /> Add Project
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Experience & Education */}
                {currentStep === 4 && (
                  <div>
                    <h1 className="step-title">Experience & Education</h1>
                    
                    <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      <div className="review-section-title" style={{ marginTop: '1rem' }}><Briefcase size={14} /> WORK TIMELINE</div>
                      
                      {experience.map((exp, idx) => (
                        <div key={`exp-${idx}`} className="wizard-list-item">
                          <button className="item-delete-btn" onClick={() => removeExperience(idx)}><Trash2 size={16} /></button>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="creative-input-group">
                              <input 
                                className="creative-input" 
                                value={exp.company} 
                                onChange={(e) => updateExperienceField(idx, 'company', e.target.value)}
                                placeholder="e.g. Reality Labs"
                              />
                              <label className="creative-label">Company Name</label>
                            </div>
                            <div className="creative-input-group">
                              <input 
                                className="creative-input" 
                                value={exp.role} 
                                onChange={(e) => updateExperienceField(idx, 'role', e.target.value)}
                                placeholder="e.g. Lead Dev"
                              />
                              <label className="creative-label">Role Title</label>
                            </div>
                          </div>

                          <div className="creative-input-group">
                            <input 
                              className="creative-input" 
                              value={exp.period} 
                              onChange={(e) => updateExperienceField(idx, 'period', e.target.value)}
                              placeholder="e.g. 2024 - Present"
                            />
                            <label className="creative-label">Duration Period</label>
                          </div>

                          <div className="creative-input-group" style={{ marginBottom: 0 }}>
                            <textarea 
                              className="creative-input" 
                              style={{ height: '70px', resize: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                              value={exp.description} 
                              onChange={(e) => updateExperienceField(idx, 'description', e.target.value)}
                              placeholder="Describe accomplishments, tools and outputs."
                            />
                            <label className="creative-label">Role Description</label>
                            <button className="ai-trigger-btn" onClick={() => triggerAi(`experience-${idx}`, exp.description)}>
                              <Sparkles size={12} /> Refine Description
                            </button>
                          </div>

                          {aiState.isActive && aiState.targetField === `experience-${idx}` && (
                            <div className="ai-generating-overlay">
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-color)' }}>AI ROLE REWRITER</span>
                                {aiState.isGenerating && <span className="ai-cursor" />}
                              </div>
                              <p className="ai-typewriter-text">{aiState.text}</p>
                              {!aiState.isGenerating && (
                                <div className="ai-options">
                                  <button className="photo-action-btn" onClick={acceptAi} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2ec4b6' }}>
                                    <Check size={12} /> Accept
                                  </button>
                                  <button className="photo-action-btn" onClick={() => triggerAi(`experience-${idx}`, exp.description)}>Regenerate</button>
                                  <button className="photo-action-btn" onClick={cancelAi}>Revert</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      <button className="add-item-btn" style={{ marginBottom: '2.5rem' }} onClick={addExperience}>
                        <Plus size={14} /> Add Experience
                      </button>

                      <div className="review-section-title"><GraduationCap size={14} /> ACADEMIC STUDIES</div>

                      {education.map((edu, idx) => (
                        <div key={`edu-${idx}`} className="wizard-list-item">
                          <button className="item-delete-btn" onClick={() => removeEducation(idx)}><Trash2 size={16} /></button>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="creative-input-group">
                              <input 
                                className="creative-input" 
                                value={edu.school} 
                                onChange={(e) => updateEducationField(idx, 'school', e.target.value)}
                                placeholder="e.g. New York University"
                              />
                              <label className="creative-label">School Name</label>
                            </div>
                            <div className="creative-input-group">
                              <input 
                                className="creative-input" 
                                value={edu.degree} 
                                onChange={(e) => updateEducationField(idx, 'degree', e.target.value)}
                                placeholder="e.g. BS in Spatial Computing"
                              />
                              <label className="creative-label">Degree Earned</label>
                            </div>
                          </div>

                          <div className="creative-input-group" style={{ marginBottom: 0 }}>
                            <input 
                              className="creative-input" 
                              value={edu.period} 
                              onChange={(e) => updateEducationField(idx, 'period', e.target.value)}
                              placeholder="e.g. 2017 - 2021"
                            />
                            <label className="creative-label">Academic Duration</label>
                          </div>
                        </div>
                      ))}

                      <button className="add-item-btn" onClick={addEducation}>
                        <Plus size={14} /> Add Education
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: Certificates */}
                {currentStep === 5 && (
                  <div>
                    <h1 className="step-title">Your Certifications</h1>
                    
                    <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {certificates.map((cert, idx) => (
                        <div key={idx} className="wizard-list-item">
                          <button className="item-delete-btn" onClick={() => removeCertificate(idx)}><Trash2 size={16} /></button>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                            <div>
                              <div className="creative-input-group">
                                <input 
                                  className="creative-input" 
                                  value={cert.title} 
                                  onChange={(e) => updateCertificateField(idx, 'title', e.target.value)}
                                  placeholder="e.g. XR Architecture"
                                />
                                <label className="creative-label">Certificate Title</label>
                              </div>
                              
                              <div className="creative-input-group">
                                <input 
                                  className="creative-input" 
                                  value={cert.issuer} 
                                  onChange={(e) => updateCertificateField(idx, 'issuer', e.target.value)}
                                  placeholder="e.g. Circuit Stream Studio"
                                />
                                <label className="creative-label">Issuing Organization</label>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="creative-label" style={{ marginBottom: '0.5rem' }}>Credential Preview</span>
                              {cert.image ? (
                                <div style={{ position: 'relative', width: '100%', height: '80px' }}>
                                  <img src={cert.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="Certificate" />
                                  <button 
                                    className="photo-action-btn" 
                                    style={{ position: 'absolute', top: '0.2rem', right: '0.2rem', padding: '0.2rem', background: '#000' }}
                                    onClick={() => updateCertificateField(idx, 'image', '')}
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ) : (
                                <div style={{ border: '1px dashed rgba(255,255,255,0.1)', width: '100%', height: '80px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <input 
                                    type="file" 
                                    id={`cert-file-${idx}`} 
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={(e) => handleCertificateImageUpload(idx, e)}
                                  />
                                  <label htmlFor={`cert-file-${idx}`} style={{ cursor: 'pointer', textAlign: 'center' }}>
                                    <Upload size={16} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ fontSize: '0.6rem', display: 'block', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Upload</span>
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="creative-input-group" style={{ marginBottom: 0 }}>
                            <input 
                              className="creative-input" 
                              value={cert.date} 
                              onChange={(e) => updateCertificateField(idx, 'date', e.target.value)}
                              placeholder="e.g. 2023"
                            />
                            <label className="creative-label">Date Issued</label>
                          </div>
                        </div>
                      ))}

                      <button className="add-item-btn" onClick={addCertificate}>
                        <Plus size={14} /> Add Certificate
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: Contact & Socials */}
                {currentStep === 6 && (
                  <div>
                    <h1 className="step-title">How can people find you?</h1>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      <div>
                        <div className="review-section-title"><Mail size={14} /> Direct Channels</div>
                        
                        <div className="creative-input-group">
                          <input 
                            className="creative-input" 
                            value={contact.email} 
                            onChange={(e) => setContact(c => ({ ...c, email: e.target.value }))}
                            placeholder="e.g. hello@lucassterling.dev"
                          />
                          <label className="creative-label">Email Address</label>
                        </div>

                        <div className="creative-input-group">
                          <input 
                            className="creative-input" 
                            value={contact.phone || ''} 
                            onChange={(e) => setContact(c => ({ ...c, phone: e.target.value }))}
                            placeholder="e.g. +81 90-8888-9999"
                          />
                          <label className="creative-label">Phone Number (Optional)</label>
                        </div>

                        <div className="creative-input-group">
                          <input 
                            className="creative-input" 
                            value={contact.address || ''} 
                            onChange={(e) => setContact(c => ({ ...c, address: e.target.value }))}
                            placeholder="e.g. Tokyo, Japan"
                          />
                          <label className="creative-label">Office Address (Optional)</label>
                        </div>
                      </div>

                      <div>
                        <div className="review-section-title"><LinkIcon size={14} /> Social Identities</div>
                        
                        <div className="creative-input-group">
                          <input 
                            className="creative-input" 
                            value={socialLinks.github || ''} 
                            onChange={(e) => setSocialLinks(s => ({ ...s, github: e.target.value }))}
                            placeholder="github.com/username"
                          />
                          <label className="creative-label">GitHub</label>
                        </div>

                        <div className="creative-input-group">
                          <input 
                            className="creative-input" 
                            value={socialLinks.linkedin || ''} 
                            onChange={(e) => setSocialLinks(s => ({ ...s, linkedin: e.target.value }))}
                            placeholder="linkedin.com/in/username"
                          />
                          <label className="creative-label">LinkedIn</label>
                        </div>

                        <div className="creative-input-group">
                          <input 
                            className="creative-input" 
                            value={socialLinks.twitter || ''} 
                            onChange={(e) => setSocialLinks(s => ({ ...s, twitter: e.target.value }))}
                            placeholder="twitter.com/username"
                          />
                          <label className="creative-label">Twitter</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stepper progress footer */}
              <div className="wizard-footer">
                <button className="photo-action-btn" onClick={prevStep}>
                  <ArrowLeft size={12} style={{ marginRight: '0.5rem' }} /> Back
                </button>
                
                <div className="step-indicator-dots">
                  {Array.from({ length: totalSteps }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`step-dot ${currentStep === idx + 1 ? 'active' : ''}`}
                    />
                  ))}
                </div>

                <button className="cinematic-btn accent" onClick={nextStep}>
                  {currentStep === totalSteps ? 'Compile Identity' : 'Next'} <ArrowRight size={14} style={{ marginLeft: '0.5rem' }} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
