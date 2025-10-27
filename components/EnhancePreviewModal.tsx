import React, { useEffect, useState } from 'react';

// This is a global function from the 'marked' library loaded in index.html
declare global {
    interface Window {
        marked: {
            parse(markdown: string): string;
        };
    }
}

interface EnhancePreviewModalProps {
  markdownContent: string;
  onAccept: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const EnhancePreviewModal: React.FC<EnhancePreviewModalProps> = ({ markdownContent, onAccept, onCancel, isOpen }) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (markdownContent) {
      setHtmlContent(window.marked.parse(markdownContent));
    } else {
      setHtmlContent('');
    }
  }, [markdownContent]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <header className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-stone-800">AI-Enhanced CV Preview</h2>
            <p className="text-sm text-stone-600">Review the AI's enhancements below. Accept to populate the form.</p>
          </div>
           <button onClick={onCancel} className="text-stone-400 hover:text-stone-600">&times;</button>
        </header>
        <main className="p-6 overflow-y-auto">
          { !htmlContent ? (
            <div className="text-center py-12">
                <svg className="animate-spin mx-auto h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="mt-2 text-sm text-stone-500">Generating preview...</p>
            </div>
          ) : (
            <div
              className="prose prose-indigo max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </main>
        <footer className="p-4 bg-stone-50 border-t flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Accept & Populate Form
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
        .prose-indigo a {
            color: #4f46e5;
        }
        .prose-indigo a:hover {
            color: #4338ca;
        }
      `}</style>
    </div>
  );
};