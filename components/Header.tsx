
import React from 'react';
import { SparklesIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-base-100 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center text-center">
        <SparklesIcon className="w-8 h-8 text-brand-primary mr-3" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight">
            AI Prompt Hub & Image Generator
          </h1>
          <p className="text-sm text-base-content-secondary mt-1">
            Craft, store, and generate stunning visuals with Gemini.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
