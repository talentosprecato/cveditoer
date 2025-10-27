import React from 'react';

export interface Template {
  id: string;
  name: string;
  description: string;
  longDescription: string;
}

const templates: Template[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'A clean, professional single-column layout.',
    longDescription: 'Ideal for tech, startups, and modern industries. Features a clean, single-column layout that emphasizes skills and recent achievements. Designed for readability on any device.'
  },
  {
    id: 'two-column-professional',
    name: 'Two-Column Pro',
    description: 'A modern layout with a sidebar for key info.',
    longDescription: 'A professional two-column layout that separates contact details and skills into a sidebar for quick scanning, while giving ample space for detailed experience and education history.'
  },
  {
    id: 'two-column-creative',
    name: 'Two-Column Creative',
    description: 'A stylish, asymmetric layout for creative roles.',
    longDescription: 'A dynamic two-column layout perfect for creatives. A narrow sidebar holds contact info and skills, giving maximum space to showcase your experience and projects in the main column.'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'A stylish layout for roles in design, marketing, etc.',
    longDescription: 'Perfect for designers, marketers, and creative professionals. This layout uses more visual flair to highlight a portfolio or key projects. Designed to be memorable and stand out.'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'A traditional, formal layout for conservative fields.',
    longDescription: 'Best suited for traditional industries like law, finance, or academia. Follows a formal structure with a clear chronological order, prioritizing professionalism over visual embellishments.'
  },
  {
    id: 'eu-cv',
    name: 'EU CV',
    description: 'A standard, minimal European format.',
    longDescription: 'Follows the standard European CV format. A clean, structured, and comprehensive layout ideal for applications within the EU. Focuses on clarity and detailed information.'
  },
  {
    id: 'ai-content-editor',
    name: 'AI Content Editor',
    description: 'Highlights AI skills and content creation experience.',
    longDescription: 'Tailored for roles in AI content, prompt engineering, and digital strategy. This template emphasizes technical skills alongside creative content portfolios, showcasing a blend of analytical and artistic abilities.'
  },
  {
    id: 'social-media-creative',
    name: 'Social Media Creative',
    description: 'Visually engaging, perfect for social media roles.',
    longDescription: 'A vibrant, visually-driven template for social media managers, content creators, and digital marketers. It\'s designed to highlight engagement metrics, successful campaigns, and platform-specific expertise in a modern, stylish format.'
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Data-dense, for engineering and IT roles.',
    longDescription: 'A clean, information-rich template for technical roles like software engineering. Prioritizes skills, projects, and tools in a highly scannable format.'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Elegant and simple, focusing on typography.',
    longDescription: 'A sophisticated, minimalist design that uses typography and white space to create a polished look. Perfect for roles where clarity and elegance are key.'
  }
];

const SingleColumnSVG = () => (
    <svg viewBox="0 0 32 44" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="5" width="24" height="4" rx="1" />
        <line x1="4" y1="13" x2="28" y2="13" />
        <line x1="4" y1="16" x2="22" y2="16" />
        <line x1="4" y1="21" x2="28" y2="21" />
        <line x1="4" y1="24" x2="28" y2="24" />
        <line x1="4" y1="27" x2="24" y2="27" />
    </svg>
);

const TwoColumnProSVG = () => (
    <svg viewBox="0 0 32 44" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="5" width="24" height="4" rx="1" />
        <line x1="4" y1="13" x2="18" y2="13" />
        <line x1="4" y1="16" x2="18" y2="16" />
        <line x1="4" y1="19" x2="18" y2="19" />
        <line x1="4" y1="22" x2="18" y2="22" />
        <line x1="20" y1="13" x2="28" y2="13" />
        <line x1="20" y1="16" x2="28" y2="16" />
        <line x1="20" y1="21" x2="28" y2="21" />
    </svg>
);

const TwoColumnCreativeSVG = () => (
    <svg viewBox="0 0 32 44" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="5" width="24" height="4" rx="1" />
        <line x1="4" y1="13" x2="12" y2="13" />
        <line x1="4" y1="16" x2="12" y2="16" />
        <line x1="4" y1="21" x2="12" y2="21" />
        <line x1="14" y1="13" x2="28" y2="13" />
        <line x1="14" y1="16" x2="28" y2="16" />
        <line x1="14" y1="19" x2="28" y2="19" />
        <line x1="14" y1="22" x2="28" y2="22" />
    </svg>
);

const CreativeSVG = () => (
    <svg viewBox="0 0 32 44" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="10" r="4" />
        <line x1="4" y1="19" x2="28" y2="19" />
        <line x1="4" y1="22" x2="22" y2="22" />
        <line x1="4" y1="27" x2="28" y2="27" />
        <line x1="4" y1="30" x2="24" y2="30" />
    </svg>
);

const ClassicSVG = () => (
    <svg viewBox="0 0 32 44" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="5" width="24" height="4" rx="1" fill="none"/>
        <line x1="4" y1="11" x2="28" y2="11" strokeWidth="1" />
        <line x1="4" y1="14" x2="28" y2="14" />
        <line x1="4" y1="17" x2="28" y2="17" />
        <line x1="4" y1="22" x2="28" y2="22" />
        <line x1="4" y1="25" x2="28" y2="25" />
    </svg>
);

const TechnicalSVG = () => (
    <svg viewBox="0 0 32 44" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="5" width="24" height="3" rx="1" />
        <line x1="4" y1="10" x2="28" y2="10" />
        <line x1="4" y1="12.5" x2="22" y2="12.5" />
        <line x1="4" y1="15" x2="28" y2="15" />
        <line x1="4" y1="17.5" x2="28" y2="17.5" />
        <line x1="4" y1="20" x2="24" y2="20" />
        <line x1="4" y1="22.5" x2="28" y2="22.5" />
        <line x1="4" y1="25" x2="22" y2="25" />
    </svg>
);


const TemplatePreview: React.FC<{ id: string }> = ({ id }) => {
    const baseClasses = "w-full h-20 mb-3 rounded-md border bg-stone-50/50 border-stone-200 p-1.5 transition-colors duration-200 group-hover:border-indigo-300";
    
    const svgs: Record<string, React.ReactNode> = {
        'modern': <SingleColumnSVG />,
        'two-column-professional': <TwoColumnProSVG />,
        'two-column-creative': <TwoColumnCreativeSVG />,
        'creative': <CreativeSVG />,
        'classic': <ClassicSVG />,
        'eu-cv': <SingleColumnSVG />,
        'ai-content-editor': <TwoColumnProSVG />,
        'social-media-creative': <CreativeSVG />,
        'technical': <TechnicalSVG />,
        'minimalist': <SingleColumnSVG />,
    };
    
    const svgContent = svgs[id] || svgs['modern'];
    
    return (
        <div className={baseClasses}>
            {svgContent}
        </div>
    );
};


interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (id: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onTemplateChange }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-stone-800 mb-3">Choose a Template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="relative group">
            <button
              onClick={() => onTemplateChange(template.id)}
              className={`w-full h-full p-3 border rounded-lg text-left transition-all duration-200 flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                selectedTemplate === template.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-indigo-500 hover:text-indigo-600'
              }`}
              aria-pressed={selectedTemplate === template.id}
            >
              <TemplatePreview id={template.id} />
              <p className={`font-semibold text-sm transition-colors ${selectedTemplate === template.id ? 'text-indigo-900' : 'text-stone-800 group-hover:text-indigo-700'}`}>{template.name}</p>
              <p className={`text-xs mt-1 text-center transition-colors ${selectedTemplate === template.id ? 'text-indigo-700' : 'text-stone-600 group-hover:text-indigo-600'}`}>{template.description}</p>
            </button>
            <div 
              role="tooltip"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-sm text-white bg-stone-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 invisible group-hover:visible group-focus-within:visible pointer-events-none z-20"
            >
              {template.longDescription}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-stone-800"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};