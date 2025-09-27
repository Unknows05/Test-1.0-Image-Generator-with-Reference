import React, { useState } from 'react';
import { AspectRatio, Visibility } from '../types';
import { ASPECT_RATIOS, FOCAL_LENGTHS } from '../constants';
import { SparklesIcon, SaveIcon, UploadIcon, XCircleIcon } from './icons';

interface PromptFormProps {
  onGenerate: (prompt: string, aspectRatio: AspectRatio, focalLength: string, referenceImage?: {data: string, mimeType: string}) => void;
  onSave: (name: string, promptText: string, category: string, visibility: Visibility) => void;
  isLoading: boolean;
  currentPrompt: string;
  setCurrentPrompt: (prompt: string) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, onSave, isLoading, currentPrompt, setCurrentPrompt }) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [focalLength, setFocalLength] = useState<string>(FOCAL_LENGTHS[0].value);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [promptName, setPromptName] = useState('');
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState<Visibility>(Visibility.PRIVATE);
  const [referenceImage, setReferenceImage] = useState<{ file: File | null; preview: string | null }>({ file: null, preview: null });

  const fileToBase64 = (file: File): Promise<{data: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve({ data: base64Data, mimeType: file.type });
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (referenceImage.preview) {
        URL.revokeObjectURL(referenceImage.preview);
      }
      setReferenceImage({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleClearImage = () => {
    if (referenceImage.preview) {
      URL.revokeObjectURL(referenceImage.preview);
    }
    setReferenceImage({ file: null, preview: null });
  };

  const handleGenerateClick = async () => {
    if (currentPrompt.trim() || referenceImage.file) {
      let imagePayload;
      if (referenceImage.file) {
        imagePayload = await fileToBase64(referenceImage.file);
      }
      onGenerate(currentPrompt, aspectRatio, focalLength, imagePayload);
      setShowSaveOptions(true);
    }
  };

  const handleSaveClick = () => {
    if (currentPrompt.trim() && category.trim() && promptName.trim()) {
      onSave(promptName, currentPrompt, category, visibility);
      setShowSaveOptions(false);
      setPromptName('');
      setCategory('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-base-100 dark:bg-dark-base-100 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-base-content dark:text-dark-content mb-4">Image Generator</h2>
      <p className="text-sm text-base-content-secondary dark:text-dark-content-secondary mb-4">
        Describe the image you want to create. For consistent results, upload a reference image.
      </p>
      
      <div className="space-y-4">
        <textarea
          value={currentPrompt}
          onChange={(e) => setCurrentPrompt(e.target.value)}
          placeholder="e.g., A majestic lion wearing a crown, sitting on a throne in a futuristic city"
          className="w-full h-28 p-3 bg-base-200 dark:bg-dark-base-300 text-base-content dark:text-dark-content border border-base-300 dark:border-dark-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
          disabled={isLoading}
        />
        
        <div>
          <label className="block text-sm font-medium text-base-content dark:text-dark-content mb-2">Reference Image (Optional)</label>
          {referenceImage.preview ? (
            <div className="relative group">
              <img src={referenceImage.preview} alt="Reference preview" className="w-full h-48 object-cover rounded-lg" />
              <button
                onClick={handleClearImage}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="Remove image"
                disabled={isLoading}
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <label className="flex justify-center w-full h-32 px-4 transition bg-base-200 dark:bg-dark-base-300 border-2 border-base-300 dark:border-dark-base-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-brand-primary focus:outline-none">
              <span className="flex items-center space-x-2">
                <UploadIcon className="w-6 h-6 text-base-content-secondary dark:text-dark-content-secondary" />
                <span className="font-medium text-base-content-secondary dark:text-dark-content-secondary">
                  Drop an image or <span className="text-brand-primary underline">browse</span>
                </span>
              </span>
              <input type="file" name="file_upload" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} disabled={isLoading} />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label htmlFor="aspect-ratio" className="block text-sm font-medium text-base-content dark:text-dark-content mb-1">Aspect Ratio</label>
            <select
              id="aspect-ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full p-2 bg-base-200 dark:bg-dark-base-300 text-base-content dark:text-dark-content border border-base-300 dark:border-dark-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 disabled:opacity-50"
              disabled={isLoading || !!referenceImage.preview}
            >
              {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
            </select>
             {referenceImage.preview && <p className="text-xs text-base-content-secondary dark:text-dark-content-secondary mt-1">Aspect ratio can be modified.</p>}
          </div>

          <div>
            <label htmlFor="focal-length" className="block text-sm font-medium text-base-content dark:text-dark-content mb-1">Focal Length</label>
            <select
              id="focal-length"
              value={focalLength}
              onChange={(e) => setFocalLength(e.target.value)}
              className="w-full p-2 bg-base-200 dark:bg-dark-base-300 text-base-content dark:text-dark-content border border-base-300 dark:border-dark-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {FOCAL_LENGTHS.map(fl => <option key={fl.name} value={fl.value}>{fl.name}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={isLoading || (!currentPrompt.trim() && !referenceImage.file)}
          className="w-full flex items-center justify-center bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {showSaveOptions && !isLoading && currentPrompt.trim() && (
        <div className="mt-6 pt-6 border-t border-base-300 dark:border-dark-base-300 space-y-4 animate-fade-in">
          <h3 className="font-semibold text-base-content dark:text-dark-content">Save This Prompt</h3>
          <input
            type="text"
            value={promptName}
            onChange={(e) => setPromptName(e.target.value)}
            placeholder="Prompt Name (e.g., Futuristic Lion King)"
            className="w-full p-2 bg-base-200 dark:bg-dark-base-300 text-base-content dark:text-dark-content border border-base-300 dark:border-dark-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (e.g., Animals, Sci-Fi)"
            className="w-full p-2 bg-base-200 dark:bg-dark-base-300 text-base-content dark:text-dark-content border border-base-300 dark:border-dark-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          />
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-base-content dark:text-dark-content">Visibility:</span>
            <div className="flex items-center space-x-4">
               <label className="flex items-center cursor-pointer">
                <input type="radio" name="visibility" value={Visibility.PRIVATE} checked={visibility === Visibility.PRIVATE} onChange={() => setVisibility(Visibility.PRIVATE)} className="radio radio-primary" />
                <span className="ml-2 text-sm text-base-content dark:text-dark-content">Private</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="visibility" value={Visibility.PUBLIC} checked={visibility === Visibility.PUBLIC} onChange={() => setVisibility(Visibility.PUBLIC)} className="radio radio-primary"/>
                <span className="ml-2 text-sm text-base-content dark:text-dark-content">Public</span>
              </label>
            </div>
          </div>
          <button
            onClick={handleSaveClick}
            disabled={!category.trim() || !promptName.trim()}
            className="w-full flex items-center justify-center bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
          >
            <SaveIcon className="w-5 h-5 mr-2" />
            Save Prompt
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptForm;