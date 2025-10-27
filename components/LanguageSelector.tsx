import React from 'react';
import { LanguageIcon } from './icons.tsx';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <div className="relative">
      <LanguageIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="appearance-none w-full bg-white border border-stone-300 text-stone-700 py-2 pl-10 pr-4 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 text-sm"
        aria-label="Select language"
      >
        <optgroup label="Global Languages">
            <option value="en">English (US)</option>
            <option value="it">Italiano</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="pt">Português</option>
            <option value="ru">Русский</option>
            <option value="tr">Türkçe</option>
            <option value="az">Azərbaycanca</option>
            <option value="ar">العربية</option>
        </optgroup>
        <optgroup label="Italian Dialects">
            <option value="it-ven">Vèneto (dialetto)</option>
            <option value="it-par">Parmense (dialetto)</option>
            <option value="it-rom">Romanesco (dialetto)</option>
            <option value="it-abr">Abruzzese (dialetto)</option>
            <option value="it-sal">Salentino (dialetto)</option>
            <option value="it-sic">Siciliano (dialetto)</option>
        </optgroup>
        <optgroup label="African Languages">
            <option value="sw">Kiswahili</option>
            <option value="yo">Yorùbá</option>
            <option value="zu">isiZulu</option>
        </optgroup>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};