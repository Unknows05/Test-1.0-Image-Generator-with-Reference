import React from 'react';
import { SparklesIcon, SunIcon, MoonIcon } from './icons';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  return (
    <header className="bg-base-100 dark:bg-dark-base-100 shadow-md relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center text-center">
        <SparklesIcon className="w-8 h-8 text-brand-primary mr-3" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content dark:text-dark-content tracking-tight">
            AI Prompt Hub & Image Generator
          </h1>
          <p className="text-sm text-base-content-secondary dark:text-dark-content-secondary mt-1">
            Craft, store, and generate stunning visuals with Gemini.
          </p>
        </div>
      </div>
      <button
        onClick={onToggleTheme}
        className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full text-base-content-secondary dark:text-dark-content-secondary hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
      </button>
    </header>
  );
};

export default Header;