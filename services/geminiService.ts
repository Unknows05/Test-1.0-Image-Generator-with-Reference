import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (
  prompt: string, 
  aspectRatio: AspectRatio,
  referenceImage?: { data: string; mimeType: string }
): Promise<string> => {
  try {
    // Case 1: Text prompt + Reference Image (Image Editing for Consistency)
    if (referenceImage) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: referenceImage.data,
                mimeType: referenceImage.mimeType,
              },
            },
            {
              text: `${prompt}, 8k resolution, photorealistic, cinematic lighting, ultra-detailed, maintaining 100% consistency of the subject's face, clothing, and appearance from the provided image`,
            },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

      // Find the image part in the response
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
      }
      throw new Error("The model did not return an image. Please check your prompt or the input image.");

    } else {
      // Case 2: Text prompt only (High-Quality Image Generation)
      const fullPrompt = `${prompt}, 8k resolution, photorealistic, cinematic lighting, ultra-detailed`;
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      } else {
        throw new Error("No image was generated. The response may have been blocked.");
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to generate image: ${errorMessage}`);
  }
};
