import React, { useState } from 'react';
import { CVData, JobSuggestion } from '../types.ts';
import { findJobOpportunities, draftCoverLetter } from '../services/geminiService.ts';
import { BriefcaseIcon, MailIcon, XCircleIcon } from './icons.tsx';

interface JobOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  language: string;
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
      {...props}
      className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

export const JobOpportunityModal: React.FC<JobOpportunityModalProps> = ({ isOpen, onClose, cvData, language }) => {
    const [cities, setCities] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<JobSuggestion[] | null>(null);
    
    const [isComposing, setIsComposing] = useState(false);
    const [isDrafting, setIsDrafting] = useState(false);
    const [draft, setDraft] = useState('');
    const [currentTarget, setCurrentTarget] = useState<{ jobTitle: string, companyName: string } | null>(null);

    const resetState = () => {
        setCities('');
        setIsLoading(false);
        setError(null);
        setResults(null);
        setIsComposing(false);
        setIsDrafting(false);
        setDraft('');
        setCurrentTarget(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleSearch = async () => {
        if (!cities) return;
        setIsLoading(true);
        setError(null);
        setResults(null);
        try {
            const opportunities = await findJobOpportunities(cvData, cities, language);
            setResults(opportunities);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDraftEmail = async (jobTitle: string, companyName: string) => {
        setCurrentTarget({ jobTitle, companyName });
        setIsComposing(true);
        setIsDrafting(true);
        setDraft('');
        try {
            const coverLetter = await draftCoverLetter(cvData, jobTitle, companyName, language);
            const fullEmail = `Dear Hiring Manager at ${companyName},\n\n${coverLetter}\n\nSincerely,\n${cvData.personal.fullName}`;
            setDraft(fullEmail);
        } catch (e) {
            console.error(e);
            setDraft("Sorry, we couldn't draft an email at this time.");
        } finally {
            setIsDrafting(false);
        }
    };

    const createMailtoLink = () => {
        if (!currentTarget) return '';
        const subject = `Application for ${currentTarget.jobTitle} position`;
        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`;
    };

    const renderContent = () => {
        if (isComposing && currentTarget) {
            return (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-stone-800">Drafting Email</h3>
                            <p className="text-sm text-stone-500">To: {currentTarget.companyName} | Role: {currentTarget.jobTitle}</p>
                        </div>
                        <button onClick={() => setIsComposing(false)} className="text-sm text-indigo-600 hover:underline">
                            &larr; Back to Results
                        </button>
                    </div>
                    {isDrafting ? <LoadingSpinner text="Drafting your email..." /> : (
                        <div className="space-y-4">
                            <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                rows={15}
                                className="w-full text-sm px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <a
                                href={createMailtoLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <MailIcon className="w-5 h-5 mr-2" />
                                Open in Email Client
                            </a>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div>
                 <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-3 space-y-2 sm:space-y-0 mb-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Target Cities</label>
                        <Input
                            placeholder="e.g., London, New York, Remote"
                            value={cities}
                            onChange={(e) => setCities(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={!cities || isLoading}
                        className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Searching...
                            </>
                        ) : (
                            <>
                                <BriefcaseIcon className="w-5 h-5 mr-2" />
                                Find Opportunities
                            </>
                        )}
                    </button>
                </div>

                {isLoading && <LoadingSpinner text="Searching for opportunities..." />}
                
                {error && (
                    <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        <XCircleIcon className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}

                {results && (
                    <div className="space-y-6">
                        {results.length > 0 ? results.map((result, index) => (
                            <div key={index} className="bg-stone-50 p-4 rounded-md border">
                                <h3 className="text-lg font-semibold text-stone-800 mb-3">{result.jobTitle}</h3>
                                <div className="space-y-3">
                                    {result.companies.map((company, cIndex) => (
                                        <div key={cIndex} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white rounded-md border">
                                            <div>
                                                <p className="font-medium text-stone-900">{company.name}</p>
                                                <a href={company.careersUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                                                    Careers Page &rarr;
                                                </a>
                                            </div>
                                            <button 
                                                onClick={() => handleDraftEmail(result.jobTitle, company.name)}
                                                className="mt-2 sm:mt-0 flex items-center justify-center px-3 py-1.5 border border-stone-300 text-sm font-medium rounded-md shadow-sm text-stone-700 bg-white hover:bg-stone-50"
                                            >
                                                <MailIcon className="w-4 h-4 mr-2" />
                                                Draft Email
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-stone-500">No opportunities found for your query. Try different cities or check your CV details.</p>
                        )}
                    </div>
                )}
            </div>
        );
    }
    

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-stone-800">Job Opportunity Finder</h2>
                    <button onClick={handleClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-full text-2xl leading-none">&times;</button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {renderContent()}
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