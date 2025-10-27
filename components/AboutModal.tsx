

import React from 'react';
import { SparklesIcon, UploadIcon, LanguageIcon, VideoPlusIcon, BriefcaseIcon, MailIcon, SignatureIcon, TypographyIcon, CoffeeIcon } from './icons.tsx';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const features = [
    { icon: <SparklesIcon className="w-6 h-6 text-indigo-600" />, title: 'AI-Powered CV Generation', description: 'Transform your raw data into a polished, professional CV using a variety of industry-tested templates.' },
    { icon: <UploadIcon className="w-6 h-6 text-indigo-600" />, title: 'Enhance with AI', description: 'Have an existing CV? Upload a PDF or TXT file and let Gemini parse, reformat, and improve it for you.' },
    { icon: <LanguageIcon className="w-6 h-6 text-indigo-600" />, title: 'Multi-Language Support', description: 'Instantly translate your CV. Select a language from the dropdown to convert your entire curriculum, making it easy to apply for jobs anywhere in the world.' },
    { icon: <VideoPlusIcon className="w-6 h-6 text-indigo-600" />, title: 'Video Presentation', description: 'Record a compelling video introduction with a built-in teleprompter, AI script generation, and professional video filters.' },
    { icon: <BriefcaseIcon className="w-6 h-6 text-indigo-600" />, title: 'Job Opportunity Finder', description: 'Discover relevant job openings based on your CV profile and search for roles in your target cities.' },
    { icon: <MailIcon className="w-6 h-6 text-indigo-600" />, title: 'Cover Letter Composer', description: 'Instantly generate a tailored cover letter for any job application, based on your CV and the company details.' },
    { icon: <SignatureIcon className="w-6 h-6 text-indigo-600" />, title: 'Digital Signature', description: 'Add a personal and professional touch by drawing your own handwritten signature directly onto your CV.' },
    { icon: <TypographyIcon className="w-6 h-6 text-indigo-600" />, title: 'Font Customization', description: 'Choose from a curated list of professional font pairings to perfectly match your style and industry.' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 font-sans">
      <div className="bg-stone-50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale overflow-hidden">
        <header className="p-4 border-b border-stone-200/80 flex justify-between items-center bg-white/60 backdrop-blur-sm flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold font-lora text-stone-800">About Veravox AI CV Editor for us</h2>
            <p className="text-sm text-stone-600">Craft your professional story with the power of Gemini.</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-full text-2xl leading-none">&times;</button>
        </header>
        <main className="flex-grow overflow-y-auto p-6 space-y-6">
            <p className="text-stone-700 leading-relaxed">
                Welcome to the Veravox AI CV Editor, your intelligent partner in crafting the perfect professional narrative. This application leverages the power of Google's Gemini API to provide a suite of powerful tools designed to make CV writing faster, smarter, and more effective.
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Did you find this app useful?</h3>
                <p className="text-sm text-indigo-800 mb-4">
                    Consider supporting the developer with a small contribution. It helps cover server costs and supports the many cats who assisted during development!
                </p>
                <a href="https://paypal.me/indennitate" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    <CoffeeIcon className="w-5 h-5 mr-2" />
                    Buy me a coffee
                </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold font-lora text-stone-700 mb-4">Key Features</h3>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1 bg-indigo-100 p-2 rounded-full">{feature.icon}</div>
                    <div>
                      <p className="font-semibold text-stone-800">{feature.title}</p>
                      <p className="text-sm text-stone-600">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
             <div className="text-center pt-6 border-t border-stone-200/80">
                <p className="text-xs text-stone-500">
                    Developed by <b>Indennitate Maria Grazia (aka veravox)</b> with AI support.
                </p>
                <p className="text-xs text-stone-500 mt-1">
                    For feedback or feature requests, please email <a href="mailto:veravoxdev@gmail.com" className="font-medium text-indigo-600 hover:underline">veravoxdev@gmail.com</a>.
                </p>
            </div>
        </main>
        <footer className="p-4 bg-white/60 backdrop-blur-sm border-t border-stone-200/80 flex justify-end space-x-4 rounded-b-lg flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </footer>
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