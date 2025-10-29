import React, { useState, useCallback, useEffect } from 'react';
import { CVForm } from './components/CVForm.tsx';
import { CVPreview } from './components/CVPreview.tsx';
import { useCVData } from './hooks/useCVData.ts';
import { generateCV, parseAndEnhanceCVFromFile } from './services/geminiService.ts';
import { CVData, SectionId } from './types.ts';
import { GithubIcon, InfoIcon, CoffeeIcon } from './components/icons.tsx';
import { EnhancePreviewModal } from './components/EnhancePreviewModal.tsx';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { JobOpportunityModal } from './components/JobOpportunityModal.tsx';
import { AboutModal } from './components/AboutModal.tsx';
import { CoverLetterModal } from './components/CoverLetterModal.tsx';
import { Logo } from './components/Logo.tsx';
import { VideoRecorderModal } from './components/VideoRecorderModal.tsx';

const App: React.FC = () => {
  const { 
    cvData, 
    loadCVData, 
    updatePersonal, 
    updatePhoto,
    updateVideoProfile,
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
    updateSignature,
  } = useCVData();
  const [generatedMd, setGeneratedMd] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const [photoAlignment, setPhotoAlignment] = useState<'left' | 'right' | 'center' | 'none'>('right');
  const [photoSize, setPhotoSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [videoAlignment, setVideoAlignment] = useState<'left' | 'right' | 'center' | 'none'>('center');
  const [videoSize, setVideoSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [fontPair, setFontPair] = useState<string>('inter-lora');
  const [sections, setSections] = useState<SectionId[]>(['personal', 'experience', 'education', 'skills', 'projects', 'portfolio', 'certifications', 'professionalNarrative', 'signature', 'videoProfile', 'coverLetter', 'jobSearch']);
  const [language, setLanguage] = useState('en');
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showEnhancePreviewModal, setShowEnhancePreviewModal] = useState(false);
  const [pendingEnhancedData, setPendingEnhancedData] = useState<CVData | null>(null);
  const [enhancedPreviewMd, setEnhancedPreviewMd] = useState('');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleGenerateCV = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedMd('');
    try {
      const sectionsForAI = sections.filter(s => s !== 'portfolio' && s !== 'jobSearch' && s !== 'signature' && s !== 'coverLetter' && s !== 'videoProfile');
      const stream = await generateCV(cvData as CVData, selectedTemplate, sectionsForAI, language, photoAlignment, videoAlignment, videoSize);
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
  }, [cvData, selectedTemplate, sections, language, photoAlignment, videoAlignment, videoSize]);
  
  const handleEnhanceCV = useCallback(async (file: File) => {
    setIsEnhancing(true);
    setError(null);
    setEnhancedPreviewMd('');
    try {
        const result = await parseAndEnhanceCVFromFile(file, language);
        const processedData: CVData = {
            ...result,
            personal: { ...result.personal, photo: result.personal.photo || '', socialLinks: result.personal.socialLinks || [], videoProfileUrl: result.personal.videoProfileUrl || '' },
            experience: result.experience.map(exp => ({ ...exp, id: crypto.randomUUID() })),
            education: result.education.map(edu => ({ ...edu, id: crypto.randomUUID() })),
            projects: result.projects.map(proj => ({...proj, id: crypto.randomUUID()})),
            certifications: result.certifications.map(cert => ({...cert, id: crypto.randomUUID()})),
            portfolio: result.portfolio.map(item => ({...item, id: crypto.randomUUID()})),
            signature: '',
        };
        setPendingEnhancedData(processedData);

        const sectionsForPreview: SectionId[] = ['personal', 'experience', 'education', 'skills', 'projects', 'certifications', 'professionalNarrative'];
        const stream = await generateCV(processedData, 'modern', sectionsForPreview, language, 'right', 'center', 'medium');
        
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
      <header className="bg-white/60 backdrop-blur-lg shadow-lg border-b border-green-200/80 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo />
            <div className="flex items-center space-x-4">
                <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} />
                 <button onClick={() => setIsAboutModalOpen(true)} className="text-stone-500 hover:text-orange-500 transition-colors" aria-label="About this app">
                    <InfoIcon className="w-7 h-7" />
                </button>
                <a href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/applications/web" target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-orange-500 transition-colors">
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
          onUpdateVideoProfile={updateVideoProfile}
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
          onSignatureChange={updateSignature}
          sections={sections}
          onSectionOrderChange={setSections}
          onEnhanceCV={handleEnhanceCV}
          isEnhancing={isEnhancing}
          language={language}
          onOpenJobModal={() => setIsJobModalOpen(true)}
          onOpenCoverLetterModal={() => setIsCoverLetterModalOpen(true)}
          onOpenVideoModal={() => setIsVideoModalOpen(true)}
        />
        <CVPreview 
          markdownContent={generatedMd} 
          isLoading={isLoading} 
          error={error}
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
          onGenerate={handleGenerateCV}
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
                For feedback or feature requests, please email <a href="mailto:veravoxdev@gmail.com" className="font-semibold text-teal-600 hover:underline">veravoxdev@gmail.com</a>.
            </p>
            <div className="mt-4 pt-4 border-t border-green-200/70 text-xs text-stone-500 italic">
              <p>
                  Are you using this app? <a href="https://paypal.me/indennitate" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-600 hover:underline not-italic inline-flex items-center">
                      <CoffeeIcon className="w-4 h-4 mr-1.5" />
                      BUY ME a coffee
                  </a> so I can buy something for one of my 20 cats today.
                  They helped me to create this! My PayPal is <a href="https://paypal.me/indennitate" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-600 hover:underline not-italic">@indennitate</a>.
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

      <VideoRecorderModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSave={(videoBlob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateVideoProfile(reader.result as string);
                setIsVideoModalOpen(false);
            };
            reader.readAsDataURL(videoBlob);
        }}
        cvData={cvData}
        language={language}
      />
    </div>
  );
};

export default App;