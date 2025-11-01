import React, { useEffect, useState, useRef } from 'react';
import { TemplateSelector } from './TemplateSelector.tsx';
import { FontSelector } from './FontSelector.tsx';
import { DownloadIcon, SparklesIcon, XCircleIcon, ClipboardIcon } from './icons.tsx';
import { PortfolioItem } from '../types.ts';

// This is a global function from the 'marked' library loaded in index.html
declare global {
    interface Window {
        marked: {
            parse(markdown: string): string;
        };
        jspdf: any;
        html2canvas: any;
    }
}

interface CVPreviewProps {
  markdownContent: string;
  isLoading: boolean;
  error: string | null;
  selectedTemplate: string;
  onTemplateChange: (id: string) => void;
  onGenerate: () => void;
  photoAlignment: 'left' | 'right' | 'center' | 'none';
  onPhotoAlignmentChange: (alignment: 'left' | 'right' | 'center' | 'none') => void;
  photoSize: 'small' | 'medium' | 'large';
  onPhotoSizeChange: (size: 'small' | 'medium' | 'large') => void;
  videoAlignment: 'left' | 'right' | 'center' | 'none';
  onVideoAlignmentChange: (alignment: 'left' | 'right' | 'center' | 'none') => void;
  videoSize: 'small' | 'medium' | 'large';
  onVideoSizeChange: (size: 'small' | 'medium' | 'large') => void;
  portfolio: PortfolioItem[];
  fontPair: string;
  onFontPairChange: (id: string) => void;
}

interface Option<T extends string> {
    id: T;
    label: string;
}

interface OptionSelectorProps<T extends string> {
    label: string;
    options: Option<T>[];
    selectedOption: T;
    onChange: (option: T) => void;
}

const OptionSelector = <T extends string>({ label, options, selectedOption, onChange }: OptionSelectorProps<T>) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2 font-['Poppins']">{label}</h3>
            <div className="flex space-x-2 rounded-md bg-stone-100 p-1">
                {options.map(option => (
                    <button
                        key={option.id}
                        onClick={() => onChange(option.id)}
                        className={`w-full rounded py-1.5 text-sm font-medium transition-colors ${
                            selectedOption === option.id
                                ? 'bg-white shadow-sm text-teal-600'
                                : 'text-stone-600 hover:bg-stone-200'
                        }`}
                        aria-pressed={selectedOption === option.id}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

const CVPreviewStyles = () => (
    <style>{`
        :root {
            /* Default Theme Variables */
            --cv-bg-color: #fff;
            --cv-text-color: #292524; /* stone-800 */
            --cv-primary-color: #4f46e5; /* indigo-600 */
            --cv-secondary-color: #57534e; /* stone-600 */
            --cv-link-color: #4f46e5;
            --cv-border-color: #e7e5e4; /* stone-200 */
            
            --cv-font-sans: 'Inter', system-ui, sans-serif;
            --cv-font-serif: 'Lora', Georgia, serif;
            --cv-font-mono: 'Roboto Mono', monospace;

            --cv-font-size: 16px;
            --cv-line-height: 1.6;
            --cv-heading-font-weight: 700;
            --cv-heading-line-height: 1.2;
            --cv-heading-letter-spacing: -0.025em;
        }

        /* Font Pairings */
        .font-pair-inter-lora {
            --cv-font-sans: 'Inter', system-ui, sans-serif;
            --cv-font-serif: 'Lora', Georgia, serif;
        }
        .font-pair-roboto {
            --cv-font-sans: 'Roboto', Arial, sans-serif;
            --cv-font-serif: 'Roboto', Arial, sans-serif;
        }
        .font-pair-arial {
            --cv-font-sans: Arial, Helvetica, sans-serif;
            --cv-font-serif: Arial, Helvetica, sans-serif;
        }
        .font-pair-times {
            --cv-font-sans: 'Times New Roman', Times, serif;
            --cv-font-serif: 'Times New Roman', Times, serif;
        }
        .font-pair-verdana {
            --cv-font-sans: Verdana, Geneva, sans-serif;
            --cv-font-serif: Verdana, Geneva, sans-serif;
        }


        /* Template Specific Variables */
        .template-modern, .template-two-column-professional {
            --cv-primary-color: #4f46e5; /* indigo-600 */
        }
        .template-creative, .template-two-column-creative {
            --cv-primary-color: #9333ea; /* purple-600 */
            --cv-secondary-color: #944a1d; /* custom brown */
            --cv-heading-letter-spacing: -0.01em;
        }
        .template-classic {
            --cv-primary-color: #1c1917; /* stone-900 */
            --cv-secondary-color: #292524;
            --cv-line-height: 1.5;
        }
        .template-ai-content-editor {
            --cv-primary-color: #4338ca; /* indigo-700 */
            --cv-font-mono: 'Roboto Mono', monospace;
        }
        .template-social-media-creative {
            --cv-primary-color: #0ea5e9; /* sky-500 */
            --cv-secondary-color: #ea580c; /* orange-600 */
            --cv-heading-font-weight: 800;
        }
        .template-technical {
            --cv-primary-color: #334155; /* slate-700 */
            --cv-font-mono: 'Roboto Mono', monospace;
            --cv-font-size: 15px;
        }
        .template-minimalist {
            --cv-primary-color: #1c1917; /* stone-900 */
            --cv-secondary-color: #78716c; /* stone-500 */
            --cv-line-height: 1.7;
        }

        /* General CV element styling using variables */
        .cv-preview-content {
            background-color: var(--cv-bg-color);
            color: var(--cv-text-color);
            font-family: var(--cv-font-sans);
            font-size: var(--cv-font-size);
            line-height: var(--cv-line-height);
        }

        .cv-preview-content h1 {
            color: var(--cv-primary-color);
            font-family: var(--cv-font-sans);
            font-weight: 800;
            font-size: 2.25em;
            margin-bottom: 0.25em;
            line-height: var(--cv-heading-line-height);
            letter-spacing: var(--cv-heading-letter-spacing);
        }

        .cv-preview-content h2 {
            color: var(--cv-primary-color);
            font-family: var(--cv-font-sans);
            font-weight: var(--cv-heading-font-weight);
            font-size: 1.5em;
            margin-top: 1.5em;
            margin-bottom: 0.75em;
            padding-bottom: 0.25em;
            border-bottom: 2px solid var(--cv-border-color);
            line-height: var(--cv-heading-line-height);
        }

        .cv-preview-content h3 {
            color: var(--cv-secondary-color);
            font-family: var(--cv-font-sans);
            font-weight: 600;
            font-size: 1.2em;
            margin-top: 1em;
            margin-bottom: 0.5em;
        }

        .cv-preview-content p,
        .cv-preview-content ul,
        .cv-preview-content ol {
            margin-bottom: 1em;
            font-family: var(--cv-font-serif);
        }

        .template-classic .cv-preview-content p,
        .template-classic .cv-preview-content ul,
        .template-classic .cv-preview-content ol {
             font-family: var(--cv-font-sans);
        }

        .cv-preview-content a {
            color: var(--cv-link-color);
            text-decoration: none;
        }
        .cv-preview-content a:hover {
            text-decoration: underline;
        }

        .cv-preview-content strong {
            font-weight: 600;
            color: var(--cv-secondary-color);
        }
        .template-classic .cv-preview-content strong {
            color: var(--cv-primary-color);
        }

        .cv-preview-content ul {
            list-style-type: disc;
            padding-left: 1.5em;
        }
        .cv-preview-content ul li::marker {
            color: var(--cv-primary-color);
        }

        .cv-preview-content hr {
            border-top: 1px solid var(--cv-border-color);
            margin: 2em 0;
        }

        .cv-preview-content blockquote {
            border-left: 4px solid var(--cv-primary-color);
            padding-left: 1em;
            margin-left: 0;
            font-style: italic;
            color: var(--cv-secondary-color);
            font-family: var(--cv-font-serif);
        }

        .cv-preview-content code {
            background-color: #f5f5f4; /* stone-100 */
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            border-radius: 3px;
            font-family: var(--cv-font-mono);
        }
        .template-ai-content-editor .cv-preview-content code,
        .template-technical .cv-preview-content code {
            background-color: #e7e5e4; /* stone-200 */
            color: #1c1917; /* stone-900 */
        }

        .template-creative .cv-preview-content h2,
        .template-two-column-creative .cv-preview-content h2 {
            border-image: linear-gradient(to right, var(--cv-primary-color), var(--cv-secondary-color)) 1;
            border-width: 0 0 3px 0;
            border-style: solid;
        }

        /* Alignment helpers */
        .cv-preview-content .align-left { text-align: left; }
        .cv-preview-content .align-center { text-align: center; }
        .cv-preview-content .align-right { text-align: right; }
        .cv-preview-content .align-left img, .cv-preview-content .align-left video { margin-right: auto; margin-left: 0; display: block; }
        .cv-preview-content .align-center img, .cv-preview-content .align-center video { margin-left: auto; margin-right: auto; display: block; }
        .cv-preview-content .align-right img, .cv-preview-content .align-right video { margin-left: auto; margin-right: 0; display: block; }

        /* Video specific styles */
        .cv-preview-content video {
            display: block;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            margin-top: 1em;
            margin-bottom: 1em;
            background-color: #000;
        }
        .video-size-small video { max-width: 200px; }
        .video-size-medium video { max-width: 300px; }
        .video-size-large video { max-width: 400px; }


        /* Photo & Table Styles */
        .cv-preview-content table {
            border-spacing: 0;
        }
        .cv-preview-content table th, .cv-preview-content table td {
            border: 1px solid var(--cv-border-color);
            padding: 0.5em;
        }
        .cv-preview-content > table:first-of-type {
            width: 100%;
            border: none;
            margin-bottom: 2em;
        }
        .cv-preview-content > table:first-of-type td {
            border: none;
            padding: 0;
            vertical-align: middle;
        }
        .cv-preview-content > table:first-of-type img {
            max-width: 120px;
            max-height: 120px;
            border-radius: 50%;
            object-fit: cover;
            display: block;
            margin: auto;
        }

        .photo-size-small .cv-preview-content > table:first-of-type img, .photo-size-small img { max-width: 80px; max-height: 80px; border-radius: 50%; }
        .photo-size-medium .cv-preview-content > table:first-of-type img, .photo-size-medium img { max-width: 120px; max-height: 120px; border-radius: 50%; }
        .photo-size-large .cv-preview-content > table:first-of-type img, .photo-size-large img { max-width: 160px; max-height: 160px; border-radius: 50%; }


        .template-two-column-professional .cv-preview-content > table,
        .template-two-column-creative .cv-preview-content > table {
            width: 100%;
            border: none;
            border-collapse: collapse;
        }
        .template-two-column-professional .cv-preview-content > table td,
        .template-two-column-creative .cv-preview-content > table td {
            border: none;
            padding: 0 1em;
            vertical-align: top;
            display: table-cell;
        }
        .template-two-column-professional .cv-preview-content > table td:first-child {
            width: 65%;
            padding-left: 0;
        }
        .template-two-column-professional .cv-preview-content > table td:last-child {
            width: 35%;
            padding-right: 0;
        }

        .template-two-column-creative .cv-preview-content > table td:first-child {
            width: 35%;
            padding-left: 0;
        }
        .template-two-column-creative .cv-preview-content > table td:last-child {
            width: 65%;
            padding-right: 0;
        }

        .template-two-column-professional .cv-preview-content > table h2:first-child,
        .template-two-column-professional .cv-preview-content > table h3:first-child,
        .template-two-column-creative .cv-preview-content > table h2:first-child,
        .template-two-column-creative .cv-preview-content > table h3:first-child {
            margin-top: 0;
        }

        /* Portfolio Gallery */
        .portfolio-gallery-section {
            break-before: page; /* For printing */
            margin-top: 1.5em;
        }
        .portfolio-gallery-section h2 {
            margin-top: 0;
        }

        .portfolio-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1.5rem;
            margin-top: 1em;
        }

        @media (min-width: 768px) {
            .portfolio-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        .portfolio-card {
            border: 1px solid var(--cv-border-color);
            border-radius: 0.5rem; /* rounded-lg */
            overflow: hidden;
            transition: box-shadow 0.2s ease-in-out;
            background-color: var(--cv-bg-color);
            display: flex;
            flex-direction: column;
        }

        .portfolio-card:hover {
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        
        .portfolio-card a {
            text-decoration: none;
            color: inherit;
        }

        .portfolio-image-link {
            display: block;
        }

        .portfolio-image {
            width: 100%;
            aspect-ratio: 16 / 10;
            object-fit: cover;
            background-color: #f5f5f4; /* stone-100 */
            border-bottom: 1px solid var(--cv-border-color);
        }

        .portfolio-card-content {
            padding: 1rem;
            flex-grow: 1;
        }

        .portfolio-card-content h3 {
            margin: 0 0 0.5em 0;
            font-size: 1.1em;
            font-weight: 600;
            color: var(--cv-text-color);
        }
        .portfolio-card-content h3 a:hover {
            color: var(--cv-primary-color);
        }

        .portfolio-card-content p {
            font-size: 0.9em;
            line-height: 1.5;
            color: var(--cv-secondary-color);
            margin-bottom: 0;
        }

    `}</style>
);

const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-6 bg-stone-300 rounded-md w-1/3"></div>
        <div className="space-y-3">
            <div className="h-4 bg-stone-300 rounded w-full"></div>
            <div className="h-4 bg-stone-300 rounded w-5/6"></div>
        </div>
        <div className="h-6 bg-stone-300 rounded-md w-1/4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-stone-300 rounded w-1/2"></div>
            <div className="h-4 bg-stone-300 rounded w-full"></div>
            <div className="h-4 bg-stone-300 rounded w-full"></div>
        </div>
         <div className="h-6 bg-stone-300 rounded-md w-1/4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-stone-300 rounded w-1/2"></div>
            <div className="h-4 bg-stone-300 rounded w-full"></div>
            <div className="h-4 bg-stone-300 rounded w-full"></div>
        </div>
    </div>
);

const Placeholder = () => (
    <div className="text-center text-stone-500">
        <div className="bg-stone-100/50 border-2 border-dashed border-stone-300 rounded-lg p-12">
            <svg className="mx-auto h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-stone-900 font-['Poppins']">Veravox</h3>
            <p className="mt-1 text-sm text-stone-500">Fill out the form and click "Generate" to see your professional CV here.</p>
        </div>
    </div>
)

export const CVPreview: React.FC<CVPreviewProps> = ({ 
    markdownContent, 
    isLoading, 
    error,
    selectedTemplate,
    onTemplateChange,
    onGenerate,
    photoAlignment,
    onPhotoAlignmentChange,
    photoSize,
    onPhotoSizeChange,
    videoAlignment,
    onVideoAlignmentChange,
    videoSize,
    onVideoSizeChange,
    portfolio,
    fontPair,
    onFontPairChange,
}) => {
    const [htmlContent, setHtmlContent] = useState('');
    const previewRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (markdownContent) {
            const parsedHtml = window.marked.parse(markdownContent);
            setHtmlContent(parsedHtml);
        } else {
            setHtmlContent('');
        }
    }, [markdownContent]);

    const handleDownloadPDF = async () => {
        if (!previewRef.current) return;
        setIsExporting(true);

        const { jsPDF } = window.jspdf;
        const element = previewRef.current;

        // Ensure we're at the top of the scrollable element and window
        element.parentElement?.scrollTo(0, 0);
        window.scrollTo(0, 0);
        // A small delay to allow for repaint after scrolling
        await new Promise(resolve => setTimeout(resolve, 50));

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
            putOnlyUsedFonts: true,
            floatPrecision: 16
        });

        const canvas = await window.html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            width: element.scrollWidth,
            height: element.scrollHeight,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = pdfHeight;
        let position = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
        
        while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
            heightLeft -= pageHeight;
        }
        
        pdf.save('cv.pdf');
        setIsExporting(false);
    };

    const photoAlignmentOptions: Option<'left' | 'right' | 'center' | 'none'>[] = [
        { id: 'left', label: 'Left' },
        { id: 'center', label: 'Center' },
        { id: 'right', label: 'Right' },
        { id: 'none', label: 'Hide' },
    ];
     const photoSizeOptions: Option<'small' | 'medium' | 'large'>[] = [
        { id: 'small', label: 'S' },
        { id: 'medium', label: 'M' },
        { id: 'large', label: 'L' },
    ];
     const videoAlignmentOptions: Option<'left' | 'right' | 'center' | 'none'>[] = [
        { id: 'left', label: 'Left' },
        { id: 'center', label: 'Center' },
        { id: 'right', label: 'Right' },
        { id: 'none', label: 'Hide' },
    ];
     const videoSizeOptions: Option<'small' | 'medium' | 'large'>[] = [
        { id: 'small', label: 'S' },
        { id: 'medium', label: 'M' },
        { id: 'large', label: 'L' },
    ];

    return (
        <div className="sticky top-[100px] h-[calc(100vh-120px)] flex flex-col">
            <CVPreviewStyles />
            <div className="flex-shrink-0 bg-white/60 backdrop-blur-lg rounded-t-xl shadow-lg shadow-green-200/30 border border-white/30 p-4 space-y-4">
                <TemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={onTemplateChange} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <OptionSelector
                        label="Photo Alignment"
                        options={photoAlignmentOptions}
                        selectedOption={photoAlignment}
                        onChange={onPhotoAlignmentChange}
                    />
                     <OptionSelector
                        label="Photo Size"
                        options={photoSizeOptions}
                        selectedOption={photoSize}
                        onChange={onPhotoSizeChange}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <OptionSelector
                        label="Video Alignment"
                        options={videoAlignmentOptions}
                        selectedOption={videoAlignment}
                        onChange={onVideoAlignmentChange}
                    />
                     <OptionSelector
                        label="Video Size"
                        options={videoSizeOptions}
                        selectedOption={videoSize}
                        onChange={onVideoSizeChange}
                    />
                </div>
                 <FontSelector selectedFontPair={fontPair} onChange={onFontPairChange} />
                <div className="pt-4 border-t border-green-100/80">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onGenerate}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-teal-500 to-green-500 hover:shadow-lg hover:shadow-green-300/40 transform hover:-translate-y-0.5 transition-all duration-300 disabled:from-stone-300 disabled:to-stone-400 disabled:shadow-none disabled:transform-none"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {isLoading ? 'Generating...' : 'Generate / Update CV'}
                        </button>
                         <button
                            onClick={handleDownloadPDF}
                            disabled={isExporting || !markdownContent}
                            className="flex-1 flex items-center justify-center px-4 py-2 border border-stone-300 text-sm font-medium rounded-md shadow-sm text-stone-700 bg-white hover:bg-stone-50 transition-colors disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
                        >
                            <DownloadIcon className="w-5 h-5 mr-2" />
                            {isExporting ? 'Exporting PDF...' : 'Download as PDF'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex-grow bg-white rounded-b-xl shadow-lg shadow-green-200/30 overflow-y-auto p-2 border border-t-0 border-white/30 relative">
                <div 
                    ref={previewRef} 
                    className={`cv-preview-content p-8 template-${selectedTemplate} font-pair-${fontPair} photo-size-${photoSize} video-size-${videoSize}`}
                >
                    {isLoading && !markdownContent && <LoadingSkeleton />}
                    {!isLoading && error && (
                        <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                           <XCircleIcon className="h-5 w-5" />
                           <span>{error}</span>
                        </div>
                    )}
                    {!isLoading && !error && !markdownContent && <Placeholder />}
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
            </div>
        </div>
    );
};