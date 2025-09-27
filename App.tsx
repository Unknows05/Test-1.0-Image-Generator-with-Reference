import React, { useState, useEffect, useCallback } from 'react';
import { Prompt, AspectRatio, Visibility } from './types';
import { generateImage } from './services/geminiService';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import ImageDisplay from './components/ImageDisplay';
import PromptStorage from './components/PromptStorage';

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAspectRatio, setCurrentAspectRatio] = useState<AspectRatio>('1:1');
  
  useEffect(() => {
    try {
      const storedPrompts = localStorage.getItem('ai-prompts');
      if (storedPrompts) {
        setPrompts(JSON.parse(storedPrompts));
      }
    } catch (e) {
      console.error("Failed to load prompts from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ai-prompts', JSON.stringify(prompts));
    } catch (e) {
      console.error("Failed to save prompts to localStorage", e);
    }
  }, [prompts]);

  const handleGenerate = async (
    prompt: string,
    aspectRatio: AspectRatio,
    referenceImage?: { data: string; mimeType: string }
  ) => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    
    // When a reference image is used, aspect ratio is derived from it by the model.
    // For the placeholder, we'll use the last selected aspect ratio.
    if (!referenceImage) {
        setCurrentAspectRatio(aspectRatio);
    }

    try {
      const imageUrl = await generateImage(prompt, aspectRatio, referenceImage);
      setGeneratedImage(imageUrl);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrompt = (name: string, promptText: string, category: string, visibility: Visibility) => {
    // Prevent saving empty prompts
    if (!promptText.trim() || !name.trim()) return;
    
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      name,
      text: promptText,
      category,
      visibility,
      createdAt: Date.now(),
    };
    setPrompts(prevPrompts => [newPrompt, ...prevPrompts]);
  };
  
  const handleUsePrompt = useCallback((promptText: string) => {
    setCurrentPrompt(promptText);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-sans">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-3 space-y-8">
            <PromptForm 
              onGenerate={handleGenerate}
              onSave={handleSavePrompt}
              isLoading={isLoading}
              currentPrompt={currentPrompt}
              setCurrentPrompt={setCurrentPrompt}
            />
            <ImageDisplay 
              isLoading={isLoading}
              error={error}
              generatedImage={generatedImage}
              aspectRatio={currentAspectRatio}
            />
          </div>

          <div className="lg:col-span-2">
            <PromptStorage prompts={prompts} onUsePrompt={handleUsePrompt} />
          </div>

        </div>
      </main>
      <footer className="text-center py-6 text-sm text-base-content-secondary">
        <p>&copy; {new Date().getFullYear()} AI Prompt Hub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;