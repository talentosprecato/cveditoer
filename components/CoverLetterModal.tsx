import React, { useState } from 'react';
import { CVData } from '../types.ts';
import { draftCoverLetter } from '../services/geminiService.ts';
import { MailIcon, XCircleIcon, SparklesIcon, ClipboardIcon } from './icons.tsx';

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  language: string;
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
      {...props}
      className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white/50"
    />
);

const LoadingSpinner: React.FC<{text: string}> = ({ text }) => (
    <div className="flex flex-col items-center justify-center space-y-2 text-stone-500">
        <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{text}</span>
    </div>
);

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({ isOpen, onClose, cvData, language }) => {
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState('');
    const [copyStatus, setCopyStatus] = useState('Copy');

    const resetState = () => {
        setJobTitle('');
        setCompanyName('');
        setIsLoading(false);
        setError(null);
        setDraft('');
        setCopyStatus('Copy');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleGenerate = async () => {
        if (!jobTitle || !companyName) return;
        setIsLoading(true);
        setError(null);
        setDraft('');
        try {
            const coverLetter = await draftCoverLetter(cvData, jobTitle, companyName, language);
            setDraft(coverLetter);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred while drafting the letter.');
        } finally {
            setIsLoading(false);
        }
    };

    const createMailtoLink = () => {
        const subject = `Application for ${jobTitle} at ${companyName}`;
        const body = `Dear Hiring Manager at ${companyName},\n\n${draft}\n\nSincerely,\n${cvData.personal.fullName}`;
        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleCopy = () => {
        const fullText = `Dear Hiring Manager at ${companyName},\n\n${draft}\n\nSincerely,\n${cvData.personal.fullName}`;
        navigator.clipboard.writeText(fullText).then(() => {
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setCopyStatus('Error');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        });
    };

    const renderContent = () => {
        if (draft) {
            return (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-stone-800">Your Drafted Cover Letter</h3>
                        <button onClick={resetState} className="text-sm text-indigo-600 hover:underline">
                            &larr; Start Over
                        </button>
                    </div>
                    <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={15}
                        className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                    />
                    <div className="flex space-x-3">
                        <button
                            onClick={handleCopy}
                            className="flex-1 flex items-center justify-center px-4 py-2 border border-stone-300 text-sm font-medium rounded-md shadow-sm text-stone-700 bg-white hover:bg-stone-50"
                        >
                            <ClipboardIcon className="w-5 h-5 mr-2" />
                            {copyStatus}
                        </button>
                        <a
                            href={createMailtoLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <MailIcon className="w-5 h-5 mr-2" />
                            Open in Email Client
                        </a>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Job Title</label>
                        <Input
                            placeholder="e.g., Senior Software Engineer"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Company Name</label>
                        <Input
                            placeholder="e.g., Tech Solutions Inc."
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!jobTitle || !companyName || isLoading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Generating...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Generate Draft
                        </>
                    )}
                </button>

                {error && (
                    <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        <XCircleIcon className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        );
    }
    

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <header className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-stone-800">Cover Letter Composer</h2>
                        <p className="text-sm text-stone-600">Generate a tailored cover letter for a specific job.</p>
                    </div>
                    <button onClick={handleClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-full text-2xl leading-none">&times;</button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {isLoading ? <LoadingSpinner text="Drafting your cover letter..." /> : renderContent()}
                </main>
            </div>
             <style>{`
                @keyframes fade-in-scale {
                  from {
                    transform: scale(0.95);
                    opacity: 0;
                  }
                  to {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
                .animate-fade-in-scale {
                  animation: fade-in-scale 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};