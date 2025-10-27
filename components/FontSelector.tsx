import React from 'react';

interface FontPair {
  id: string;
  name: string;
  description: string;
}

const fontPairs: FontPair[] = [
  { id: 'inter-lora', name: 'Modern', description: 'Inter (Sans) & Lora (Serif). Balanced and readable.' },
  { id: 'roboto', name: 'Roboto', description: 'A clean, modern sans-serif font for a professional look.' },
  { id: 'arial', name: 'Arial', description: 'A classic sans-serif font for maximum compatibility.' },
  { id: 'times', name: 'Times New Roman', description: 'A traditional serif font for a formal, classic appearance.' },
  { id: 'verdana', name: 'Verdana', description: 'A highly readable sans-serif font, excellent for screen display.' },
];

interface FontSelectorProps {
  selectedFontPair: string;
  onChange: (id: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({ selectedFontPair, onChange }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-stone-800 mb-2">Typography</h3>
      <div className="flex space-x-2 rounded-md bg-stone-100 p-1">
        {fontPairs.map(pair => (
          <div key={pair.id} className="relative group flex-1">
            <button
              onClick={() => onChange(pair.id)}
              className={`w-full rounded py-1.5 text-sm font-medium transition-colors ${
                selectedFontPair === pair.id
                  ? 'bg-white shadow-sm text-indigo-600'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
              aria-pressed={selectedFontPair === pair.id}
            >
              {pair.name}
            </button>
            <div 
              role="tooltip"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-xs text-white bg-stone-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-20"
            >
              {pair.description}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-stone-800"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};