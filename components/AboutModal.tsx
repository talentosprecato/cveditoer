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
    { icon: <SparklesIcon className="w-6 h-6 text-teal-600" />, title: 'AI-Powered CV Generation', description: 'Transform your raw data into a polished, professional CV using a variety of industry-tested templates.' },
    { icon: <UploadIcon className="w-6 h-6 text-teal-600" />, title: 'Enhance with AI', description: 'Have an existing CV? Upload a PDF or TXT file and let Gemini parse, reformat, and improve it for you.' },
    { icon: <LanguageIcon className="w-6 h-6 text-teal-600" />, title: 'Multi-Language Support', description: 'Instantly translate your CV. Select a language from the dropdown to convert your entire curriculum, making it easy to apply for jobs anywhere in the world.' },
    { icon: <VideoPlusIcon className="w-6 h-6 text-teal-600" />, title: 'Video Profile', description: 'Record a 60-second video introduction with an AI-powered script generator, teleprompter, and visual effects to make your application stand out.' },
    { icon: <BriefcaseIcon className="w-6 h-6 text-teal-600" />, title: 'Job Opportunity Finder', description: 'Discover relevant job openings based on your CV profile and search for roles in your target cities.' },
    { icon: <MailIcon className="w-6 h-6 text-teal-600" />, title: 'Cover Letter Composer', description: 'Instantly generate a tailored cover letter for any job application, based on your CV and the company details.' },
    { icon: <SignatureIcon className="w-6 h-6 text-teal-600" />, title: 'Digital Signature', description: 'Add a personal and professional touch by drawing your own handwritten signature directly onto your CV.' },
    { icon: <TypographyIcon className="w-6 h-6 text-teal-600" />, title: 'Font Customization', description: 'Choose from a curated list of professional font pairings to perfectly match your style and industry.' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 font-sans">
      <div className="bg-stone-50/80 backdrop-blur-lg rounded-xl shadow-2xl shadow-green-300/30 w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale overflow-hidden border border-white/50">
        <header className="p-4 border-b border-green-100/80 flex justify-between items-center bg-white/60 backdrop-blur-sm flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold font-['Poppins'] text-stone-800">About Veravox</h2>
            <p className="text-sm text-stone-600">Craft your professional story with the power of Gemini.</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-full text-2xl leading-none">&times;</button>
        </header>
        <main className="flex-grow overflow-y-auto p-6 space-y-6">
            <p className="text-stone-700 leading-relaxed">
                Welcome to the Veravox AI CV Editor, your intelligent partner in crafting the perfect professional narrative. This application leverages the power of Google's Gemini API to provide a suite of powerful tools designed to make CV writing faster, smarter, and more effective.
            </p>
            <div className="bg-gradient-to-r from-green-100 to-yellow-100 border border-green-200/50 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-teal-900 mb-2 font-['Poppins']">Did you find this app useful?</h3>
                <p className="text-sm text-teal-800 mb-4">
                    Consider supporting the developer with a small contribution. It helps cover server costs and supports the many cats who assisted during development!
                </p>
                <a href="https://paypal.me/indennitate" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-teal-500 to-green-500 hover:shadow-lg hover:shadow-green-300/40 transform hover:-translate-y-0.5 transition-all duration-300">
                    <CoffeeIcon className="w-5 h-5 mr-2" />
                    Buy me a coffee
                </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold font-['Poppins'] text-stone-700 mb-4">Key Features</h3>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1 bg-green-100 p-2 rounded-full">{feature.icon}</div>
                    <div>
                      <p className="font-semibold text-stone-800">{feature.title}</p>
                      <p className="text-sm text-stone-600">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
             <div className="text-center pt-6 border-t border-green-200/80">
                <p className="text-xs text-stone-500">
                    Developed by <b>Indennitate Maria Grazia (aka veravox)</b> with AI support.
                </p>
                <p className="text-xs text-stone-500 mt-1">
                    For feedback or feature requests, please email <a href="mailto:veravoxdev@gmail.com" className="font-medium text-teal-600 hover:underline">veravoxdev@gmail.com</a>.
                </p>
            </div>
        </main>
        <footer className="p-4 bg-white/60 backdrop-blur-sm border-t border-green-100/80 flex justify-end space-x-4 rounded-b-lg flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-green-500 hover:shadow-lg hover:shadow-green-300/40 transform hover:-translate-y-0.5 transition-all duration-300"
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