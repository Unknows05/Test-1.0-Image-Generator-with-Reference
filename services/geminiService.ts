import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (
  prompt: string, 
  aspectRatio: AspectRatio,
  focalLength: string,
  referenceImage?: { data: string; mimeType: string }
): Promise<string> => {
  try {
    // Case 1: Text prompt + Reference Image (Image Editing for Consistency)
    if (referenceImage) {
      const promptParts = [
        prompt,
        "maintaining 100% consistency of the subject's face, pose, clothing, and appearance from the provided image",
        focalLength
      ];
      const finalPrompt = promptParts.filter(Boolean).join(', ');

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
              text: finalPrompt,
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
      const textResponse = response.text?.trim() || "No text response from model.";
      throw new Error(`The model did not return an image. Model response: "${textResponse}"`);

    } else {
      // Case 2: Text prompt only (Standard Image Generation)
      const promptParts = [prompt, focalLength];
      const fullPrompt = promptParts.filter(Boolean).join(', ');

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

export const enhanceImage = async (
  base64ImageData: string,
  mimeType: string
): Promise<string> => {
  try {
    const enhancementPrompt = "Enhance this image to 8k resolution, with photorealistic quality equivalent to a fullframe Canon camera sensor. Capture 12-bit RAW 4:2:2 color depth, tack-sharp focus, and ultra-high detail. Improve lighting and textures without altering the subject or composition.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: enhancementPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    const textResponse = response.text?.trim() || "No text response from model.";
    throw new Error(`The model did not return an enhanced image. Model response: "${textResponse}"`);
  } catch (error) {
    console.error("Error enhancing image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to enhance image: ${errorMessage}`);
  }
};