import React, { useRef, useState, useCallback } from 'react';
import { CVData, PersonalDetails, Experience, Education, SectionId, Project, Certification, PortfolioItem, SocialLink } from '../types.ts';
import { PlusIcon, TrashIcon, SparklesIcon, DragHandleIcon, UploadIcon, FileIcon, XCircleIcon, RecordIcon, VideoPlusIcon, CameraIcon, BriefcaseIcon, CheckCircleIcon, SearchIcon, MailIcon, LinkIcon, FacebookIcon, InstagramIcon, TwitterIcon, GithubIcon } from './icons.tsx';
import { VideoRecorderModal } from './VideoRecorderModal.tsx';
import { SignaturePad } from './SignaturePad.tsx';

interface CVFormProps {
  cvData: CVData;
  onPersonalChange: (field: keyof Omit<PersonalDetails, 'photo' | 'socialLinks'>, value: string) => void;
  onPhotoChange: (base64: string) => void;
  onAddSocialLink: () => void;
  onUpdateSocialLink: (id: string, field: keyof Omit<SocialLink, 'id'>, value: string) => void;
  onRemoveSocialLink: (id: string) => void;
  onReorderSocialLinks: (startIndex: number, endIndex: number) => void;
  onAddExperience: () => void;
  onUpdateExperience: (id: string, field: keyof Omit<Experience, 'id'>, value: string) => void;
  onRemoveExperience: (id: string) => void;
  onReorderExperience: (startIndex: number, endIndex: number) => void;
  onAddEducation: () => void;
  onUpdateEducation: (id: string, field: keyof Omit<Education, 'id'>, value: string) => void;
  onRemoveEducation: (id: string) => void;
  onReorderEducation: (startIndex: number, endIndex: number) => void;
  onSkillsChange: (value: string) => void;
  onAddProject: () => void;
  onUpdateProject: (id: string, field: keyof Omit<Project, 'id'>, value: string) => void;
  onRemoveProject: (id: string) => void;
  onReorderProject: (startIndex: number, endIndex: number) => void;
  onAddCertification: () => void;
  onUpdateCertification: (id: string, field: keyof Omit<Certification, 'id'>, value: string) => void;
  onRemoveCertification: (id: string) => void;
  onReorderCertification: (startIndex: number, endIndex: number) => void;
  onAddPortfolioItem: () => void;
  onUpdatePortfolioItem: (id: string, field: keyof Omit<PortfolioItem, 'id'>, value: string) => void;
  onRemovePortfolioItem: (id: string) => void;
  onReorderPortfolioItem: (startIndex: number, endIndex: number) => void;
  onProfessionalNarrativeChange: (value: string) => void;
  onVideoUrlChange: (url: string) => void;
  onSignatureChange: (base64: string) => void;
  sections: SectionId[];
  onSectionOrderChange: (sections: SectionId[]) => void;
  onEnhanceCV: (file: File) => void;
  isEnhancing: boolean;
  language: string;
  onOpenJobModal: () => void;
  onOpenCoverLetterModal: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-stone-200/50">
    <div className="flex items-center justify-between border-b border-stone-200 pb-2 cursor-grab active:cursor-grabbing">
        <h3 className="text-xl font-semibold text-stone-800">{title}</h3>
        <DragHandleIcon className="w-6 h-6 text-stone-400" />
    </div>
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: React.ReactNode }> = ({ label, icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
    <div className="relative rounded-md shadow-sm">
        {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {icon}
            </div>
        )}
        <input
            {...props}
            className={`w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white/50 ${icon ? 'pl-10' : ''}`}
        />
    </div>
  </div>
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
    <textarea
      {...props}
      rows={4}
      className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white/50"
    />
  </div>
);

const renderVideoPreview = (url: string) => {
    if (!url) return null;

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
        const videoId = youtubeMatch[1];
        return (
            <iframe
              className='max-h-full max-w-full rounded-md shadow-inner w-full h-full'
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded YouTube Video"
            ></iframe>
        );
    }
    
    if (url.startsWith('blob:') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')) {
        return <video key={url} controls src={url} className='max-h-full max-w-full rounded-md shadow-inner'></video>;
    }

    // Fallback for other URLs
    return (
        <div className="w-full h-full flex items-center justify-center bg-stone-100 p-4 rounded-md">
            <div className='text-center'>
                <p className="text-sm text-stone-700">Video link added:</p>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">{url}</a>
            </div>
        </div>
    );
};


export const CVForm: React.FC<CVFormProps> = ({
  cvData,
  onPersonalChange,
  onPhotoChange,
  onAddSocialLink,
  onUpdateSocialLink,
  onRemoveSocialLink,
  onReorderSocialLinks,
  onAddExperience,
  onUpdateExperience,
  onRemoveExperience,
  onReorderExperience,
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation,
  onReorderEducation,
  onSkillsChange,
  onAddProject,
  onUpdateProject,
  onRemoveProject,
  onReorderProject,
  onAddCertification,
  onUpdateCertification,
  onRemoveCertification,
  onReorderCertification,
  onAddPortfolioItem,
  onUpdatePortfolioItem,
  onRemovePortfolioItem,
  onReorderPortfolioItem,
  onProfessionalNarrativeChange,
  onVideoUrlChange,
  onSignatureChange,
  sections,
  onSectionOrderChange,
  onEnhanceCV,
  isEnhancing,
  language,
  onOpenJobModal,
  onOpenCoverLetterModal,
}) => {
  const sectionDragItem = useRef<number | null>(null);
  const sectionDragOverItem = useRef<number | null>(null);
  const [isSectionDragging, setIsSectionDragging] = useState(false);
  
  const expDragItem = useRef<number | null>(null);
  const expDragOverItem = useRef<number | null>(null);
  
  const eduDragItem = useRef<number | null>(null);
  const eduDragOverItem = useRef<number | null>(null);

  const projDragItem = useRef<number | null>(null);
  const projDragOverItem = useRef<number | null>(null);

  const certDragItem = useRef<number | null>(null);
  const certDragOverItem = useRef<number | null>(null);

  const portfolioDragItem = useRef<number | null>(null);
  const portfolioDragOverItem = useRef<number | null>(null);
  
  const socialLinkDragItem = useRef<number | null>(null);
  const socialLinkDragOverItem = useRef<number | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const [isVideoRecorderOpen, setIsVideoRecorderOpen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        setSelectedFile(event.target.files[0]);
    }
  };

  const handleEnhanceClick = () => {
    if (selectedFile) {
        onEnhanceCV(selectedFile);
    }
  };

  const handleSectionDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    sectionDragItem.current = position;
    setIsSectionDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragEnter = (_e: React.DragEvent<HTMLDivElement>, position: number) => {
    sectionDragOverItem.current = position;
  };
  
  const handleSectionDrop = () => {
    if (sectionDragItem.current === null || sectionDragOverItem.current === null) return;
    const newSections = [...sections];
    const dragItemContent = newSections[sectionDragItem.current];
    newSections.splice(sectionDragItem.current, 1);
    newSections.splice(sectionDragOverItem.current, 0, dragItemContent);
    onSectionOrderChange(newSections);
  };
  
  const handleSectionDragEnd = () => {
    sectionDragItem.current = null;
    sectionDragOverItem.current = null;
    setIsSectionDragging(false);
  };
  
  const createDragHandlers = (
    itemRef: React.MutableRefObject<number | null>,
    overItemRef: React.MutableRefObject<number | null>,
    reorderFn: (start: number, end: number) => void
  ) => ({
    onDragStart: (e: React.DragEvent<HTMLDivElement>, position: number) => {
        itemRef.current = position;
        e.dataTransfer.effectAllowed = 'move';
    },
    onDragEnter: (_e: React.DragEvent<HTMLDivElement>, position: number) => {
        overItemRef.current = position;
    },
    onDrop: () => {
        if (itemRef.current !== null && overItemRef.current !== null) {
          reorderFn(itemRef.current, overItemRef.current);
        }
    },
    onDragEnd: () => {
        itemRef.current = null;
        overItemRef.current = null;
    },
  });

  const expDragHandlers = createDragHandlers(expDragItem, expDragOverItem, onReorderExperience);
  const eduDragHandlers = createDragHandlers(eduDragItem, eduDragOverItem, onReorderEducation);
  const projDragHandlers = createDragHandlers(projDragItem, projDragOverItem, onReorderProject);
  const certDragHandlers = createDragHandlers(certDragItem, certDragOverItem, onReorderCertification);
  const portfolioDragHandlers = createDragHandlers(portfolioDragItem, portfolioDragOverItem, onReorderPortfolioItem);
  const socialLinkDragHandlers = createDragHandlers(socialLinkDragItem, socialLinkDragOverItem, onReorderSocialLinks);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPhoto = () => {
    if (photoPreviewUrl) {
      onPhotoChange(photoPreviewUrl);
      setPhotoPreviewUrl(null);
    }
  };

  const handleCancelPhoto = () => {
    setPhotoPreviewUrl(null);
    if (photoInputRef.current) {
        photoInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
      onPhotoChange('');
  }

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            setVideoError('File size should not exceed 50MB.');
            return;
        }
        setVideoError(null);
        const url = URL.createObjectURL(file);
        onVideoUrlChange(url);
    }
  };
  
  const handleVideoUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrlInput(e.target.value);
  };
  
  const handleVideoUrlInputBlur = () => {
    if(videoUrlInput) {
        onVideoUrlChange(videoUrlInput);
    }
  };
  
  const handleVideoSave = (videoBlob: Blob) => {
    const url = URL.createObjectURL(videoBlob);
    onVideoUrlChange(url);
    setIsVideoRecorderOpen(false);
  };

  const sectionMatchesQuery = useCallback((sectionId: SectionId, query: string): boolean => {
    const lowerCaseQuery = query.toLowerCase();
    if (!lowerCaseQuery) return true;

    const sectionTitles: Record<SectionId, string> = {
      personal: 'Personal Details',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
      certifications: 'Certifications',
      portfolio: 'Portfolio Gallery',
      professionalNarrative: 'Professional Narrative',
      jobSearch: 'Job Opportunity Finder',
      coverLetter: 'Cover Letter Composer',
      signature: 'Signature',
    };

    if (sectionTitles[sectionId].toLowerCase().includes(lowerCaseQuery)) {
      return true;
    }

    const checkString = (val: any) => String(val).toLowerCase().includes(lowerCaseQuery);

    switch (sectionId) {
      case 'personal':
        return Object.values(cvData.personal).some(val => {
            if (Array.isArray(val)) {
                return val.some(item => Object.values(item).some(checkString));
            }
            return checkString(val);
        });
      case 'experience':
        return cvData.experience.some(item => Object.values(item).some(checkString));
      case 'education':
        return cvData.education.some(item => Object.values(item).some(checkString));
      case 'skills':
        return checkString(cvData.skills);
      case 'projects':
        return cvData.projects.some(item => Object.values(item).some(checkString));
      case 'certifications':
        return cvData.certifications.some(item => Object.values(item).some(checkString));
      case 'portfolio':
        return cvData.portfolio.some(item => Object.values(item).some(checkString));
      case 'professionalNarrative':
        return checkString(cvData.professionalNarrative);
      case 'jobSearch':
        return 'job opportunity finder launch'.includes(lowerCaseQuery);
      case 'coverLetter':
        return 'cover letter composer draft email'.includes(lowerCaseQuery);
      case 'signature':
        return 'signature sign draw handwritten'.includes(lowerCaseQuery);
      default:
        return false;
    }
  }, [cvData]);

  const getIconForPlatform = (platform: string) => {
    const key = platform.toLowerCase();
    const props = { className: "w-5 h-5 text-stone-500" };
    if (key.includes('facebook')) return <FacebookIcon {...props} />;
    if (key.includes('instagram')) return <InstagramIcon {...props} />;
    if (key.includes('twitter')) return <TwitterIcon {...props} />;
    if (key.includes('github')) return <GithubIcon {...props} />;
    return <LinkIcon {...props} />;
  };

  const photoToShow = photoPreviewUrl || cvData.personal.photo;

  const sectionsMap: Record<SectionId, React.ReactNode> = {
    personal: (
      <Section title="Personal Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={cvData.personal.fullName} onChange={(e) => onPersonalChange('fullName', e.target.value)} />
            <Input 
                label="Email" 
                type="email" 
                value={cvData.personal.email} 
                onChange={(e) => onPersonalChange('email', e.target.value)} 
                icon={<MailIcon className="h-5 w-5 text-stone-400" />}
            />
            <Input label="Phone" type="tel" value={cvData.personal.phone} onChange={(e) => onPersonalChange('phone', e.target.value)} />
            <Input label="Residence" value={cvData.personal.residence} onChange={(e) => onPersonalChange('residence', e.target.value)} />
            <Input label="Date of Birth" type="date" value={cvData.personal.dateOfBirth} onChange={(e) => onPersonalChange('dateOfBirth', e.target.value)} />
            <Input label="Place of Birth" value={cvData.personal.placeOfBirth} onChange={(e) => onPersonalChange('placeOfBirth', e.target.value)} />
            <Input label="LinkedIn Profile URL" value={cvData.personal.linkedin} onChange={(e) => onPersonalChange('linkedin', e.target.value)} />
            <Input label="Website/Portfolio URL" value={cvData.personal.website} onChange={(e) => onPersonalChange('website', e.target.value)} />
            <Input label="GitHub Profile URL" value={cvData.personal.github} onChange={(e) => onPersonalChange('github', e.target.value)} />
            <Input label="Twitter Profile URL" value={cvData.personal.twitter} onChange={(e) => onPersonalChange('twitter', e.target.value)} />
        </div>

        <div className="mt-4 pt-4 border-t border-stone-200 space-y-4">
            <h4 className="text-sm font-semibold text-stone-700">Social & Other Links</h4>
             <div className="space-y-3">
                {cvData.personal.socialLinks.map((link, index) => (
                    <div
                        key={link.id}
                        draggable
                        onDragStart={(e) => socialLinkDragHandlers.onDragStart(e, index)}
                        onDragEnter={(e) => socialLinkDragHandlers.onDragEnter(e, index)}
                        onDragEnd={socialLinkDragHandlers.onDragEnd}
                        onDrop={socialLinkDragHandlers.onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="p-3 border border-stone-200 rounded-md bg-stone-50/50"
                    >
                        <div className="flex items-center gap-3">
                             <div className="cursor-grab active:cursor-grabbing text-stone-400">
                                <DragHandleIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-shrink-0">{getIconForPlatform(link.platform)}</div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Platform (e.g., Facebook)"
                                    value={link.platform}
                                    onChange={(e) => onUpdateSocialLink(link.id, 'platform', e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white/50"
                                />
                                <input
                                    type="url"
                                    placeholder="URL"
                                    value={link.url}
                                    onChange={(e) => onUpdateSocialLink(link.id, 'url', e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white/50"
                                />
                            </div>
                            <button onClick={() => onRemoveSocialLink(link.id)} className="text-stone-400 hover:text-indigo-500">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onAddSocialLink} className="flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                <PlusIcon className="w-5 h-5" />
                <span>Add Link</span>
            </button>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-200 space-y-6">
            <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Profile Photo</label>
                <div className="flex items-center space-x-4">
                    {photoToShow ? (
                        <img src={photoToShow} alt="Profile" className={`w-16 h-16 rounded-full object-cover transition-all ${photoPreviewUrl ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`} />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                            <CameraIcon className="w-8 h-8" />
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} ref={photoInputRef} className="hidden" />
                    
                    {photoPreviewUrl ? (
                        <div className="flex items-center space-x-2">
                             <button
                                onClick={handleConfirmPhoto}
                                className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={handleCancelPhoto}
                                className="px-3 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => photoInputRef.current?.click()}
                                className="px-3 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50"
                            >
                                {cvData.personal.photo ? 'Change Photo' : 'Upload Photo'}
                            </button>
                            {cvData.personal.photo && (
                                <button onClick={handleRemovePhoto} className="flex items-center space-x-1.5 px-3 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-indigo-600">
                                    <TrashIcon className="w-4 h-4"/>
                                    <span>Remove</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Profile Video</label>
                <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 flex-shrink-0">
                        {cvData.videoUrl ? (
                           <CheckCircleIcon className="w-8 h-8 text-green-500" />
                        ) : (
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="6" y="6" width="12" height="12" rx="1"></rect>
                            </svg>
                        )}
                    </div>
                    <div className="flex-grow">
                        <input type="file" accept="video/*" onChange={handleVideoFileChange} ref={videoInputRef} className="hidden" />
                        <button onClick={() => videoInputRef.current?.click()} className="px-3 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50">
                            Upload Video
                        </button>
                        <div className="mt-2 text-xs text-stone-500">
                            Or{' '}
                            <button onClick={() => setIsVideoRecorderOpen(true)} className="text-indigo-600 hover:underline">record a new one</button>.
                        </div>
                    </div>
                </div>
                 <div className="mt-4">
                    <Input 
                        label="Or paste a video link"
                        type="url"
                        placeholder="e.g., https://www.youtube.com/watch?v=..."
                        value={videoUrlInput}
                        onChange={handleVideoUrlInputChange}
                        onBlur={handleVideoUrlInputBlur}
                    />
                </div>
                {videoError && <p className="text-sm text-indigo-600 mt-1">{videoError}</p>}
                
                {cvData.videoUrl && (
                    <div className="mt-4">
                        <div className='flex items-center justify-between mb-1'>
                            <label className="block text-sm font-medium text-stone-700">Preview</label>
                            <button onClick={() => onVideoUrlChange('')} className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center">
                                <TrashIcon className="w-3 h-3 mr-1" /> Remove
                            </button>
                        </div>
                        <div className='w-full aspect-video bg-stone-100 rounded-md overflow-hidden'>
                            {renderVideoPreview(cvData.videoUrl)}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </Section>
    ),
    experience: (
      <Section title="Work Experience">
        <div className="space-y-4">
          {cvData.experience.map((exp, index) => (
            <div key={exp.id} 
                draggable 
                onDragStart={(e) => expDragHandlers.onDragStart(e, index)}
                onDragEnter={(e) => expDragHandlers.onDragEnter(e, index)}
                onDragEnd={expDragHandlers.onDragEnd}
                onDrop={expDragHandlers.onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="p-4 border border-stone-200 rounded-md bg-stone-50/50"
            >
              <div className="flex justify-between items-start mb-2">
                  <div className='flex items-center gap-2'>
                    <div className="cursor-grab active:cursor-grabbing text-stone-400">
                        <DragHandleIcon className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-md text-stone-800">{exp.jobTitle || 'New Position'}</h4>
                  </div>
                <button onClick={() => onRemoveExperience(exp.id)} className="text-stone-400 hover:text-indigo-500">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Job Title" value={exp.jobTitle} onChange={(e) => onUpdateExperience(exp.id, 'jobTitle', e.target.value)} />
                <Input label="Company" value={exp.company} onChange={(e) => onUpdateExperience(exp.id, 'company', e.target.value)} />
                <Input label="Location" value={exp.location} onChange={(e) => onUpdateExperience(exp.id, 'location', e.target.value)} />
                <div className="flex space-x-2">
                    <Input label="Start Date" type="month" value={exp.startDate} onChange={(e) => onUpdateExperience(exp.id, 'startDate', e.target.value)} />
                    <Input label="End Date" type="month" value={exp.endDate} onChange={(e) => onUpdateExperience(exp.id, 'endDate', e.target.value)} />
                </div>
              </div>
              <div className="mt-4">
                <Textarea label="Responsibilities" value={exp.responsibilities} onChange={(e) => onUpdateExperience(exp.id, 'responsibilities', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={onAddExperience} className="mt-4 flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
          <PlusIcon className="w-5 h-5" />
          <span>Add Experience</span>
        </button>
      </Section>
    ),
    education: (
      <Section title="Education">
        <div className="space-y-4">
          {cvData.education.map((edu, index) => (
             <div key={edu.id} 
                draggable 
                onDragStart={(e) => eduDragHandlers.onDragStart(e, index)}
                onDragEnter={(e) => eduDragHandlers.onDragEnter(e, index)}
                onDragEnd={eduDragHandlers.onDragEnd}
                onDrop={eduDragHandlers.onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="p-4 border border-stone-200 rounded-md bg-stone-50/50"
             >
                <div className="flex justify-between items-start mb-2">
                  <div className='flex items-center gap-2'>
                      <div className="cursor-grab active:cursor-grabbing text-stone-400">
                          <DragHandleIcon className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-md text-stone-800">{edu.degree || 'New Education'}</h4>
                  </div>
                  <button onClick={() => onRemoveEducation(edu.id)} className="text-stone-400 hover:text-indigo-500">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Degree / Qualification" value={edu.degree} onChange={(e) => onUpdateEducation(edu.id, 'degree', e.target.value)} />
                  <Input label="Institution" value={edu.institution} onChange={(e) => onUpdateEducation(edu.id, 'institution', e.target.value)} />
                  <Input label="Location" value={edu.location} onChange={(e) => onUpdateEducation(edu.id, 'location', e.target.value)} />
                  <div className="flex space-x-2">
                    <Input label="Start Date" type="month" value={edu.startDate} onChange={(e) => onUpdateEducation(edu.id, 'startDate', e.target.value)} />
                    <Input label="End Date" type="month" value={edu.endDate} onChange={(e) => onUpdateEducation(edu.id, 'endDate', e.target.value)} />
                   </div>
                </div>
                <div className="mt-4">
                    <Input label="Details (e.g., GPA, Honors)" value={edu.details} onChange={(e) => onUpdateEducation(edu.id, 'details', e.target.value)} />
                </div>
            </div>
          ))}
        </div>
        <button onClick={onAddEducation} className="mt-4 flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
          <PlusIcon className="w-5 h-5" />
          <span>Add Education</span>
        </button>
      </Section>
    ),
    skills: (
      <Section title="Skills">
        <Textarea label="Skills (comma-separated)" value={cvData.skills} onChange={(e) => onSkillsChange(e.target.value)} />
      </Section>
    ),
    projects: (
        <Section title="Projects">
            <div className="space-y-4">
                {cvData.projects.map((proj, index) => (
                    <div key={proj.id}
                        draggable
                        onDragStart={(e) => projDragHandlers.onDragStart(e, index)}
                        onDragEnter={(e) => projDragHandlers.onDragEnter(e, index)}
                        onDragEnd={projDragHandlers.onDragEnd}
                        onDrop={projDragHandlers.onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="p-4 border border-stone-200 rounded-md bg-stone-50/50"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className='flex items-center gap-2'>
                                <div className="cursor-grab active:cursor-grabbing text-stone-400">
                                    <DragHandleIcon className="w-5 h-5" />
                                </div>
                                <h4 className="font-semibold text-md text-stone-800">{proj.name || 'New Project'}</h4>
                            </div>
                            <button onClick={() => onRemoveProject(proj.id)} className="text-stone-400 hover:text-indigo-500">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Project Name" value={proj.name} onChange={(e) => onUpdateProject(proj.id, 'name', e.target.value)} />
                            <Input label="Technologies Used" value={proj.technologies} onChange={(e) => onUpdateProject(proj.id, 'technologies', e.target.value)} />
                        </div>
                         <div className="mt-4">
                            <Input label="Project Link" value={proj.link} onChange={(e) => onUpdateProject(proj.id, 'link', e.target.value)} />
                        </div>
                        <div className="mt-4">
                            <Textarea label="Description" value={proj.description} onChange={(e) => onUpdateProject(proj.id, 'description', e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onAddProject} className="mt-4 flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                <PlusIcon className="w-5 h-5" />
                <span>Add Project</span>
            </button>
        </Section>
    ),
    certifications: (
        <Section title="Certifications">
            <div className="space-y-4">
                {cvData.certifications.map((cert, index) => (
                    <div key={cert.id}
                        draggable
                        onDragStart={(e) => certDragHandlers.onDragStart(e, index)}
                        onDragEnter={(e) => certDragHandlers.onDragEnter(e, index)}
                        onDragEnd={certDragHandlers.onDragEnd}
                        onDrop={certDragHandlers.onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="p-4 border border-stone-200 rounded-md bg-stone-50/50"
                    >
                        <div className="flex justify-between items-start mb-2">
                             <div className='flex items-center gap-2'>
                                <div className="cursor-grab active:cursor-grabbing text-stone-400">
                                    <DragHandleIcon className="w-5 h-5" />
                                </div>
                                <h4 className="font-semibold text-md text-stone-800">{cert.name || 'New Certification'}</h4>
                            </div>
                            <button onClick={() => onRemoveCertification(cert.id)} className="text-stone-400 hover:text-indigo-500">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Certification Name" value={cert.name} onChange={(e) => onUpdateCertification(cert.id, 'name', e.target.value)} />
                            <Input label="Issuing Organization" value={cert.issuingOrganization} onChange={(e) => onUpdateCertification(cert.id, 'issuingOrganization', e.target.value)} />
                        </div>
                         <div className="mt-4">
                            <Input label="Date" type="month" value={cert.date} onChange={(e) => onUpdateCertification(cert.id, 'date', e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onAddCertification} className="mt-4 flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                <PlusIcon className="w-5 h-5" />
                <span>Add Certification</span>
            </button>
        </Section>
    ),
    portfolio: (
        <Section title="Portfolio Gallery">
            <div className="space-y-4">
                {cvData.portfolio.map((item, index) => (
                    <div key={item.id}
                        draggable
                        onDragStart={(e) => portfolioDragHandlers.onDragStart(e, index)}
                        onDragEnter={(e) => portfolioDragHandlers.onDragEnter(e, index)}
                        onDragEnd={portfolioDragHandlers.onDragEnd}
                        onDrop={portfolioDragHandlers.onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="p-4 border border-stone-200 rounded-md bg-stone-50/50"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className='flex items-center gap-2'>
                                <div className="cursor-grab active:cursor-grabbing text-stone-400">
                                    <DragHandleIcon className="w-5 h-5" />
                                </div>
                                <h4 className="font-semibold text-md text-stone-800">{item.title || 'New Portfolio Item'}</h4>
                            </div>
                            <button onClick={() => onRemovePortfolioItem(item.id)} className="text-stone-400 hover:text-indigo-500">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                             <Input label="Title" value={item.title} onChange={(e) => onUpdatePortfolioItem(item.id, 'title', e.target.value)} />
                             <Input label="Project Link" value={item.link} onChange={(e) => onUpdatePortfolioItem(item.id, 'link', e.target.value)} />
                             <Input label="Image URL" value={item.imageUrl} onChange={(e) => onUpdatePortfolioItem(item.id, 'imageUrl', e.target.value)} />
                             <Textarea label="Description" value={item.description} onChange={(e) => onUpdatePortfolioItem(item.id, 'description', e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onAddPortfolioItem} className="mt-4 flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                <PlusIcon className="w-5 h-5" />
                <span>Add Portfolio Item</span>
            </button>
        </Section>
    ),
    professionalNarrative: (
        <Section title="Professional Narrative">
            <Textarea 
                label="What has made you the professional you are today?" 
                value={cvData.professionalNarrative} 
                onChange={(e) => onProfessionalNarrativeChange(e.target.value)} 
                rows={6}
            />
        </Section>
    ),
    signature: (
      <Section title="Signature">
        <p className="text-sm text-stone-600 mb-4">Add a handwritten signature to your CV for a personal touch. It will appear at the end of your document.</p>
        {cvData.signature ? (
          <div className="text-center">
            <img src={cvData.signature} alt="User signature" className="mx-auto border bg-white p-2 rounded-md shadow-inner" />
            <button
              onClick={() => onSignatureChange('')}
              className="mt-2 flex items-center mx-auto text-sm text-indigo-600 hover:text-indigo-800"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Clear Signature
            </button>
          </div>
        ) : (
          <SignaturePad onSignatureChange={onSignatureChange} />
        )}
      </Section>
    ),
    coverLetter: (
      <Section title="Cover Letter Composer">
        <p className="text-sm text-stone-600 mb-4">Draft a tailored cover letter for a specific job you have in mind.</p>
        <button
            onClick={onOpenCoverLetterModal}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
            <MailIcon className="w-5 h-5 mr-2" />
            Compose Cover Letter
        </button>
      </Section>
    ),
    jobSearch: (
      <Section title="Job Opportunity Finder">
        <p className="text-sm text-stone-600 mb-4">Launch the job finder to discover relevant opportunities based on your CV and target locations.</p>
        <button
            onClick={onOpenJobModal}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
            <BriefcaseIcon className="w-5 h-5 mr-2" />
            Launch Job Finder
        </button>
      </Section>
    )
  };

  const hasSearchResults = searchQuery && sections.some(id => sectionMatchesQuery(id, searchQuery));
  const noSearchResults = searchQuery && !hasSearchResults;

  return (
    <div className="space-y-6">
       <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-stone-400" aria-hidden="true" />
          </div>
          <input
              type="search"
              name="search"
              id="search"
              className="block w-full rounded-md border-stone-300 pl-10 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm bg-white/70"
              placeholder="Search sections or fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button onClick={() => setSearchQuery('')} aria-label="Clear search">
                      <XCircleIcon className="h-5 w-5 text-stone-400 hover:text-stone-600" />
                  </button>
              </div>
          )}
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-stone-200/50 space-y-3">
        <div className="flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-semibold text-stone-800">Enhance with AI</h3>
        </div>
        <p className="text-sm text-stone-600">Have an existing CV? Upload a PDF or text file, and let AI parse and populate the form for you.</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
             <div className="flex-1">
                <label htmlFor="file-upload" className="sr-only">Choose file</label>
                <div className="flex rounded-md shadow-sm">
                    <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className="px-3 inline-flex items-center border border-r-0 border-stone-300 bg-stone-50 text-stone-500 text-sm rounded-l-md cursor-pointer hover:bg-stone-100"
                    >
                        <UploadIcon className="w-5 h-5 mr-2" />
                        Browse
                    </div>
                    <div className="relative flex-1">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.txt" className="sr-only" id="file-upload" />
                        <div className="block w-full px-3 py-2 border border-stone-300 rounded-r-md text-sm text-stone-700 truncate bg-white/50">
                            {selectedFile ? (
                                <span className='flex items-center'>
                                    <FileIcon className='w-4 h-4 mr-2 text-stone-500' />
                                    {selectedFile.name}
                                </span>
                            ) : "No file selected"}
                        </div>
                         {selectedFile && (
                            <button onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <XCircleIcon className="h-5 w-5 text-stone-400 hover:text-stone-600" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <button
                onClick={handleEnhanceClick}
                disabled={!selectedFile || isEnhancing}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
                {isEnhancing ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Enhancing...
                    </>
                ) : "Enhance"}
            </button>
        </div>
      </div>

      {sections.map((sectionId, index) => {
        const isVisible = sectionMatchesQuery(sectionId, searchQuery);
        return (
          <div
            key={sectionId}
            draggable={!searchQuery}
            onDragStart={(e) => handleSectionDragStart(e, index)}
            onDragEnter={(e) => handleSectionDragEnter(e, index)}
            onDragEnd={handleSectionDragEnd}
            onDrop={handleSectionDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`transition-opacity ${isSectionDragging && sectionDragItem.current === index ? 'opacity-30' : 'opacity-100'} ${!isVisible ? 'hidden' : ''}`}
          >
            {sectionsMap[sectionId]}
          </div>
        );
      })}
      {noSearchResults && (
        <div className="text-center py-8 text-stone-500 bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200/50">
          <p className="font-medium">No results found</p>
          <p className="text-sm mt-1">No sections match your search for "{searchQuery}".</p>
        </div>
      )}
      <VideoRecorderModal
        isOpen={isVideoRecorderOpen}
        onClose={() => setIsVideoRecorderOpen(false)}
        onSave={handleVideoSave}
        cvData={cvData}
        language={language}
      />
    </div>
  );
};