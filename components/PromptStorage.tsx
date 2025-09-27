import React, { useState, useMemo } from 'react';
import { Prompt, Visibility } from '../types';
import { GlobeIcon, LockIcon } from './icons';

interface PromptStorageProps {
  prompts: Prompt[];
  onUsePrompt: (promptText: string) => void;
}

enum Tab {
  RECENT = 'Recent',
  PUBLIC = 'Public',
  PRIVATE = 'My Prompts',
}

const PromptCard: React.FC<{ prompt: Prompt; onUsePrompt: (text: string) => void; }> = ({ prompt, onUsePrompt }) => {
  const isPublic = prompt.visibility === Visibility.PUBLIC;
  return (
    <div className="bg-base-100 dark:bg-dark-base-100 p-4 rounded-lg shadow transition-transform hover:scale-105 group" title={prompt.text}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-base-content dark:text-dark-content flex-1 pr-2 truncate">{prompt.name}</p>
        <div 
          className={`flex items-center text-xs px-2 py-1 rounded-full ${isPublic ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'}`}
          title={prompt.visibility}
        >
          {isPublic ? <GlobeIcon className="w-3 h-3 mr-1" /> : <LockIcon className="w-3 h-3 mr-1" />}
          {prompt.visibility}
        </div>
      </div>
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs font-medium bg-base-300 dark:bg-dark-base-300 text-base-content-secondary dark:text-dark-content-secondary px-2 py-1 rounded">
          {prompt.category}
        </span>
        <button
          onClick={() => onUsePrompt(prompt.text)}
          className="text-sm font-semibold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Use
        </button>
      </div>
    </div>
  );
};

const PromptStorage: React.FC<PromptStorageProps> = ({ prompts, onUsePrompt }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.RECENT);

  const filteredPrompts = useMemo(() => {
    switch (activeTab) {
      case Tab.PUBLIC:
        return prompts.filter(p => p.visibility === Visibility.PUBLIC).sort((a, b) => b.createdAt - a.createdAt);
      case Tab.PRIVATE:
        return prompts.filter(p => p.visibility === Visibility.PRIVATE).sort((a, b) => b.createdAt - a.createdAt);
      case Tab.RECENT:
      default:
        return [...prompts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
    }
  }, [prompts, activeTab]);
  
  const TABS = [Tab.RECENT, Tab.PUBLIC, Tab.PRIVATE];

  return (
    <div className="w-full bg-base-100 dark:bg-dark-base-100 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-base-content dark:text-dark-content mb-4">Prompt Storage</h2>
      <div className="border-b border-base-300 dark:border-dark-base-300 mb-4">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-base-content-secondary dark:text-dark-content-secondary hover:text-base-content dark:hover:text-dark-content hover:border-gray-300 dark:hover:border-gray-500'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {filteredPrompts.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {filteredPrompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} onUsePrompt={onUsePrompt} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-base-content-secondary dark:text-dark-content-secondary">
          <p>No prompts found in this category.</p>
          <p className="text-sm mt-1">
            {activeTab === Tab.RECENT ? 'Generate an image and save the prompt to see it here.' : `Save a prompt as "${activeTab === Tab.PUBLIC ? 'Public': 'Private'}" to see it here.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptStorage;