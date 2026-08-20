import { useState, useEffect } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { CinematicLanding } from './landing/CinematicLanding';
import { CreationWizard } from './wizard/CreationWizard';
import { TemplateSelector } from './templates/TemplateSelector';
import { LiveEditor } from './editor/LiveEditor';
import { AuthGate, useAuth } from './auth/AuthGate';

type AppView = 'landing' | 'wizard' | 'selector' | 'editor';

function AppContent() {
  const [view, setView] = useState<AppView>('landing');
  const { setPortfolioData } = usePortfolio();
  const { user, signIn } = useAuth();

  // Add body class so CSS can hide auth-nav when editor/wizard is active
  useEffect(() => {
    if (view === 'editor' || view === 'wizard' || view === 'selector') {
      document.body.classList.add('in-editor');
    } else {
      document.body.classList.remove('in-editor');
    }
    return () => document.body.classList.remove('in-editor');
  }, [view]);

  const handleGetStarted = async () => {
    if (!user) {
      const signedIn = await signIn();
      if (!signedIn) return;
    }
    setView('wizard');
  };

  const handleSelectTemplate = (templateName: string) => {
    setPortfolioData((prev) => ({
      ...prev,
      template: templateName,
    }));

    setView('editor');
  };

  return (
    <>
      {view === 'landing' && (
        <CinematicLanding
          onGetStarted={handleGetStarted}
        />
      )}

      {view === 'wizard' && (
        <CreationWizard
          onBackToLanding={() => setView('landing')}
          onComplete={() => setView('selector')}
        />
      )}

      {view === 'selector' && (
        <TemplateSelector
          onSelectTemplate={handleSelectTemplate}
          onExitHome={() => setView('landing')}
        />
      )}

      {view === 'editor' && (
        <LiveEditor
          onBackToSelector={() => setView('selector')}
          onExitHome={() => setView('landing')}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthGate>
      <PortfolioProvider>
        <AppContent />
      </PortfolioProvider>
    </AuthGate>
  );
}
