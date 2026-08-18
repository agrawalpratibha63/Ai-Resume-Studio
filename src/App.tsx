import { useState } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { CinematicLanding } from './landing/CinematicLanding';
import { CreationWizard } from './wizard/CreationWizard';
import { TemplateSelector } from './templates/TemplateSelector';
import { LiveEditor } from './editor/LiveEditor';

type AppView = 'landing' | 'wizard' | 'selector' | 'editor';

function AppContent() {
  const [view, setView] = useState<AppView>('landing');
  const { setPortfolioData } = usePortfolio();

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
          onGetStarted={() => setView('wizard')}
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
        />
      )}

      {view === 'editor' && (
        <LiveEditor
          onBackToSelector={() => setView('selector')}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}