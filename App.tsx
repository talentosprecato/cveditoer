
import React, { useState, useCallback, useEffect } from 'react';
import { CVForm } from './components/CVForm.tsx';
import { CVPreview } from './components/CVPreview.tsx';
import { useCVData } from './hooks/useCVData.ts';
import { generateCV, parseAndEnhanceCVFromFile } from './services/geminiService.ts';
import { CVData, SectionId } from './types.ts';
import { GithubIcon, SparklesIcon, CheckCircleIcon, XCircleIcon, InfoIcon, CoffeeIcon } from './components/icons.tsx';
import { EnhancePreviewModal } from './components/EnhancePreviewModal.tsx';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { JobOpportunityModal } from './components/JobOpportunityModal.tsx';
import { AboutModal } from './components/AboutModal.tsx';
import { CoverLetterModal } from './components/CoverLetterModal.tsx';

const SaveStatusIndicator: React.FC<{ status: 'idle' | 'saving' | 'saved' | 'error' }> = ({ status }) => {
    const visible = status !== 'idle';
    
    // Use 'saved' config for layout calculations when idle to prevent shift
    const placeholderConfig = {
        icon: <CheckCircleIcon className="h-4 w-4" />,
        text: 'Saved',
        className: 'text-green-500',
    };
    
    const statusConfig = {
        saving: {
            icon: <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
            text: 'Saving...',
            className: 'text-stone-500',
        },
        saved: placeholderConfig,
        error: {
            icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
            text: 'Save error',
            className: 'text-red-500',
        },
    };

    const currentStatus = status === 'idle' ? placeholderConfig : statusConfig[status];

    return (
        <div className={`flex items-center justify-center space-x-2 text-sm font-medium w-24 transition-opacity duration-300 ${currentStatus.className} ${visible ? 'opacity-100' : 'opacity-0'}`}>
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
        </div>
    );
};

const App: React.FC = () => {
  const { 
    cvData, 
    saveStatus,
    loadCVData, 
    updatePersonal, 
    updatePhoto,
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
    reorderSocialLinks,
    addExperience, 
    updateExperience, 
    removeExperience, 
    reorderExperience,
    addEducation, 
    updateEducation, 
    removeEducation, 
    reorderEducation,
    updateSkills,
    addProject,
    updateProject,
    removeProject,
    reorderProject,
    addCertification,
    updateCertification,
    removeCertification,
    reorderCertification,
    addPortfolioItem,
    updatePortfolioItem,
    removePortfolioItem,
    reorderPortfolioItem,
    updateProfessionalNarrative,
    updateVideoUrl,
    updateSignature,
  } = useCVData();
  const [generatedMd, setGeneratedMd] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const [photoAlignment, setPhotoAlignment] = useState<'left' | 'right' | 'none'>('right');
  const [photoSize, setPhotoSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [videoAlignment, setVideoAlignment] = useState<'left' | 'right' | 'center' | 'full'>('full');
  const [videoSize, setVideoSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [fontPair, setFontPair] = useState<string>('inter-lora');
  const [sections, setSections] = useState<SectionId[]>(['personal', 'experience', 'education', 'skills', 'projects', 'portfolio', 'certifications', 'professionalNarrative', 'signature', 'coverLetter', 'jobSearch']);
  const [language, setLanguage] = useState('en');
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showEnhancePreviewModal, setShowEnhancePreviewModal] = useState(false);
  const [pendingEnhancedData, setPendingEnhancedData] = useState<CVData | null>(null);
  const [enhancedPreviewMd, setEnhancedPreviewMd] = useState('');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const handleGenerateCV = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedMd('');
    try {
      const sectionsForAI = sections.filter(s => s !== 'portfolio' && s !== 'jobSearch' && s !== 'signature' && s !== 'coverLetter');
      // FIX: Await the promise that resolves to an async generator before iterating.
      const stream = await generateCV(cvData as CVData, selectedTemplate, sectionsForAI, language, photoAlignment);
      let fullCv = '';
      for await (const chunk of stream) {
        fullCv += chunk;
      }
      setGeneratedMd(fullCv);
    } catch (e) {
      setError('Failed to generate CV. Please check your API key and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [cvData, selectedTemplate, sections, language, photoAlignment]);
  
  const handleEnhanceCV = useCallback(async (file: File) => {
    setIsEnhancing(true);
    setError(null);
    setEnhancedPreviewMd('');
    try {
        const result = await parseAndEnhanceCVFromFile(file, language);
        const processedData: CVData = {
            ...result,
            personal: { ...result.personal, photo: result.personal.photo || '', socialLinks: result.personal.socialLinks || [] },
            experience: result.experience.map(exp => ({ ...exp, id: crypto.randomUUID() })),
            education: result.education.map(edu => ({ ...edu, id: crypto.randomUUID() })),
            projects: result.projects.map(proj => ({...proj, id: crypto.randomUUID()})),
            certifications: result.certifications.map(cert => ({...cert, id: crypto.randomUUID()})),
            portfolio: result.portfolio.map(item => ({...item, id: crypto.randomUUID()})),
            videoUrl: result.videoUrl || '',
            signature: '',
        };
        setPendingEnhancedData(processedData);

        // FIX: Explicitly type the array as SectionId[] to match the function signature.
        const sectionsForPreview: SectionId[] = ['personal', 'experience', 'education', 'skills', 'projects', 'certifications', 'professionalNarrative'];
        // FIX: Await the promise that resolves to an async generator before iterating.
        const stream = await generateCV(processedData, 'modern', sectionsForPreview, language, 'right');
        
        let markdownPreview = '';
        for await (const chunk of stream) {
            markdownPreview += chunk;
        }
        
        setEnhancedPreviewMd(markdownPreview);
        setShowEnhancePreviewModal(true);

    } catch (e) {
        setError('Failed to parse and enhance CV. The AI could not understand the format. Please try again with a different file.');
        console.error(e);
    } finally {
        setIsEnhancing(false);
    }
  }, [language]);

  const handleAcceptEnhancement = () => {
    if (pendingEnhancedData) {
        loadCVData(pendingEnhancedData);
    }
    setShowEnhancePreviewModal(false);
    setPendingEnhancedData(null);
    setEnhancedPreviewMd('');
  };

  const handleCancelEnhancement = () => {
    setShowEnhancePreviewModal(false);
    setPendingEnhancedData(null);
    setEnhancedPreviewMd('');
  };

  return (
    <div className="min-h-screen text-stone-800 font-sans flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
                <SparklesIcon className="w-8 h-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Veravox AI CV Editor for us</h1>
                <SaveStatusIndicator status={saveStatus} />
            </div>
            <div className="flex items-center space-x-4">
                <a href="https://paypal.me/indennitate" target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-indigo-600 font-medium text-sm flex items-center space-x-1.5 transition-colors">
                  <CoffeeIcon className="w-5 h-5" />
                  <span>Support</span>
                </a>
                <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} />
                 <button onClick={() => setIsAboutModalOpen(true)} className="text-stone-500 hover:text-stone-900" aria-label="About this app">
                    <InfoIcon className="w-7 h-7" />
                </button>
                <a href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/applications/web" target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-900">
                    <GithubIcon className="w-7 h-7" />
                </a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start flex-grow">
        <CVForm
          cvData={cvData}
          onPersonalChange={updatePersonal}
          onPhotoChange={updatePhoto}
          onAddSocialLink={addSocialLink}
          onUpdateSocialLink={updateSocialLink}
          onRemoveSocialLink={removeSocialLink}
          onReorderSocialLinks={reorderSocialLinks}
          onAddExperience={addExperience}
          onUpdateExperience={updateExperience}
          onRemoveExperience={removeExperience}
          onReorderExperience={reorderExperience}
          onAddEducation={addEducation}
          onUpdateEducation={updateEducation}
          onRemoveEducation={removeEducation}
          onReorderEducation={reorderEducation}
          onSkillsChange={updateSkills}
          onAddProject={addProject}
          onUpdateProject={updateProject}
          onRemoveProject={removeProject}
          onReorderProject={reorderProject}
          onAddCertification={addCertification}
          onUpdateCertification={updateCertification}
          onRemoveCertification={removeCertification}
          onReorderCertification={reorderCertification}
          onAddPortfolioItem={addPortfolioItem}
          onUpdatePortfolioItem={updatePortfolioItem}
          onRemovePortfolioItem={removePortfolioItem}
          onReorderPortfolioItem={reorderPortfolioItem}
          onProfessionalNarrativeChange={updateProfessionalNarrative}
          onVideoUrlChange={updateVideoUrl}
          onSignatureChange={updateSignature}
          sections={sections}
          onSectionOrderChange={setSections}
          onEnhanceCV={handleEnhanceCV}
          isEnhancing={isEnhancing}
          language={language}
          onOpenJobModal={() => setIsJobModalOpen(true)}
          onOpenCoverLetterModal={() => setIsCoverLetterModalOpen(true)}
        />
        <CVPreview 
          markdownContent={generatedMd} 
          isLoading={isLoading} 
          error={error}
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
          onGenerate={handleGenerateCV}
          videoUrl={cvData.videoUrl}
          photoAlignment={photoAlignment}
          onPhotoAlignmentChange={setPhotoAlignment}
          photoSize={photoSize}
          onPhotoSizeChange={setPhotoSize}
          videoAlignment={videoAlignment}
          onVideoAlignmentChange={setVideoAlignment}
          videoSize={videoSize}
          onVideoSizeChange={setVideoSize}
          portfolio={cvData.portfolio}
          fontPair={fontPair}
          onFontPairChange={setFontPair}
        />
      </main>

      <footer className="text-center py-6 text-sm text-stone-600">
        <div className="container mx-auto px-4">
            <p>
                Developed by <b>Indennitate Maria Grazia (aka veravox)</b> with AI support.
            </p>
            <p className="mt-1">
                For feedback or feature requests, please email <a href="mailto:veravoxdev@gmail.com" className="font-semibold text-indigo-600 hover:underline">veravoxdev@gmail.com</a>.
            </p>
            <div className="mt-4 pt-4 border-t border-stone-200/70 text-xs text-stone-500 italic">
              <p>
                  Are you using this app? <a href="https://paypal.me/indennitate" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline not-italic inline-flex items-center">
                      <CoffeeIcon className="w-4 h-4 mr-1.5" />
                      BUY ME a coffee
                  </a> so I can buy something for one of my 20 cats today.
                  They helped me to create this! My PayPal is <a href="https://paypal.me/indennitate" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline not-italic">@indennitate</a>.
              </p>
          </div>
        </div>
      </footer>

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <EnhancePreviewModal
        isOpen={showEnhancePreviewModal}
        markdownContent={enhancedPreviewMd}
        onAccept={handleAcceptEnhancement}
        onCancel={handleCancelEnhancement}
      />

      <JobOpportunityModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        cvData={cvData}
        language={language}
      />

      <CoverLetterModal
        isOpen={isCoverLetterModalOpen}
        onClose={() => setIsCoverLetterModalOpen(false)}
        cvData={cvData}
        language={language}
      />
    </div>
  );
};

export default App;
