import React, { createContext, useContext, useState } from 'react';

export interface Profile {
  name: string;
  title: string;
  photo: string;
  location: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  period: string;
}

export interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  url?: string;
}

export interface Certificate {
  title: string;
  issuer: string;
  date: string;
  image?: string;
}

export interface Contact {
  email: string;
  phone?: string;
  address?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
}

export interface AdditionalSectionItem {
  heading: string;
  subheading: string;
  period: string;
  description: string;
  url?: string;
}

export interface AdditionalSection {
  title: string;
  items: AdditionalSectionItem[];
}

export interface Customization {
  accentColor: string;
  fontFamily: string; // 'Void' (sans), 'Crimson' (serif), 'Orbit' (modern), 'Frame' (serif), 'Nexus' (mono), 'Echo' (clean)
  animationSpeed: 'low' | 'normal' | 'high';
  backgroundStyle: 'solid' | 'grid' | 'grain' | 'ambient';
}

export interface PortfolioData {
  profile: Profile;
  about: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certificates: Certificate[];
  contact: Contact;
  socialLinks: SocialLinks;
  additionalSections: AdditionalSection[];
  template: string; // 'zenith' | 'ember' | 'glacier' | 'obsidian' | 'sakura' | 'blueprint' | 'velour' | 'solstice' | 'marble' | 'nova' | 'terra'
  customization: Customization;
}

interface PortfolioContextType {
  portfolioData: PortfolioData;
  setPortfolioData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  updateProfile: (profile: Partial<Profile>) => void;
  updateCustomization: (customization: Partial<Customization>) => void;
  resetPortfolioData: () => void;
}

const defaultMockData: PortfolioData = {
  profile: {
    name: '',
    title: '',
    photo: '',
    location: '',
  },
  about: '',
  skills: [
    
  ],
  projects: [
    
    {
      title: '',
      description: '',
      image: '',
      tags: [],
    }
  ],
  experience: [
    
    {
      company: '',
      role: '',
      period: '',
      description: '',
    }
  ],
  education: [
    {
      school: '',
      degree: '',
      period: '',
    }
  ],
  certificates: [
    
    {
      title: '',
      issuer: '',
      date: '',
    }
  ],
  contact: {
    email: '',
    phone: '',
    address: '',
  },
  socialLinks: {
    github: '',
    linkedin: '',
    twitter: '',
  },
  additionalSections: [],
  template: 'zenith',
  customization: {
    accentColor: '#e63946',
    fontFamily: 'Void',
    animationSpeed: 'normal',
    backgroundStyle: 'solid',
  }
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(defaultMockData);

  const updateProfile = (profile: Partial<Profile>) => {
    setPortfolioData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profile },
    }));
  };

  const updateCustomization = (customization: Partial<Customization>) => {
    setPortfolioData((prev) => ({
      ...prev,
      customization: { ...prev.customization, ...customization },
    }));
  };

  const resetPortfolioData = () => {
    setPortfolioData(defaultMockData);
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolioData,
        setPortfolioData,
        updateProfile,
        updateCustomization,
        resetPortfolioData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
