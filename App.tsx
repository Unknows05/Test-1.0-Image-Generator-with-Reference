import React, { useState, useEffect, useCallback } from 'react';
import { Prompt, AspectRatio, Visibility } from './types';
import { generateImage, enhanceImage } from './services/geminiService';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import ImageDisplay from './components/ImageDisplay';
import PromptStorage from './components/PromptStorage';

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAspectRatio, setCurrentAspectRatio] = useState<AspectRatio>('1:1');
  
  // State for refinement
  const [refinementPrompt, setRefinementPrompt] = useState<string>('');
  const [basePromptForRefinement, setBasePromptForRefinement] = useState<string>('');
  const [baseFocalLengthForRefinement, setBaseFocalLengthForRefinement] = useState<string>('');
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

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
  
  const dataUrlToBlob = (dataUrl: string): { data: string; mimeType: string } | null => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) return null;
    return { mimeType: match[1], data: match[2] };
  };

  const handleGenerate = async (
    prompt: string,
    aspectRatio: AspectRatio,
    focalLength: string,
    referenceImage?: { data: string; mimeType: string }
  ) => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setRefinementPrompt('');
    
    setBasePromptForRefinement(prompt);
    setBaseFocalLengthForRefinement(focalLength);
    setCurrentAspectRatio(aspectRatio);

    try {
      const imageUrl = await generateImage(prompt, aspectRatio, focalLength, referenceImage);
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

  const handleRefine = () => {
    if (!refinementPrompt.trim() || !generatedImage) return;

    const refinedPrompt = `${basePromptForRefinement}, now ${refinementPrompt}`;
    const imagePayload = dataUrlToBlob(generatedImage);

    if (!imagePayload) {
      setError("Could not process the existing image for refinement.");
      return;
    }

    handleGenerate(
        refinedPrompt,
        currentAspectRatio,
        baseFocalLengthForRefinement,
        imagePayload
    );
  };

  const handleEnhanceAndDownload = async () => {
    if (!generatedImage) return;
  
    setIsEnhancing(true);
    setError(null);
  
    try {
      const imageBlob = dataUrlToBlob(generatedImage);
      if (!imageBlob) {
        throw new Error("Could not process the image for enhancement.");
      }
      
      const enhancedImageUrl = await enhanceImage(imageBlob.data, imageBlob.mimeType);
  
      const link = document.createElement('a');
      link.href = enhancedImageUrl;
      link.download = 'ai-enhanced-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during enhancement.');
      }
    } finally {
      setIsEnhancing(false);
    }
  };


  const handleSavePrompt = (name: string, promptText: string, category: string, visibility: Visibility) => {
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
    <div className="min-h-screen bg-base-200 dark:bg-dark-base-200 text-base-content dark:text-dark-content font-sans">
      <Header theme={theme} onToggleTheme={handleToggleTheme} />
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
              onRefine={handleRefine}
              refinementPrompt={refinementPrompt}
              setRefinementPrompt={setRefinementPrompt}
              isEnhancing={isEnhancing}
              onEnhanceAndDownload={handleEnhanceAndDownload}
            />
          </div>

          <div className="lg:col-span-2">
            <PromptStorage prompts={prompts} onUsePrompt={handleUsePrompt} />
          </div>

        </div>
      </main>
      <footer className="text-center py-6 text-sm text-base-content-secondary dark:text-dark-content-secondary">
        <p>&copy; {new Date().getFullYear()} AI Prompt Hub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;