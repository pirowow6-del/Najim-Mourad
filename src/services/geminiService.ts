import { GoogleGenAI, Type } from "@google/genai";

export type PromptModel = 
  | "general" 
  | "structured" 
  | "graphic" 
  | "json" 
  | "flux" 
  | "midjourney" 
  | "stablediffusion";

export interface GeneratePromptParams {
  image: string; // base64
  mimeType: string;
  modelType: PromptModel;
  language: string;
}

const SYSTEM_INSTRUCTIONS: Record<PromptModel, string> = {
  general: "Provide a detailed, natural language description of the image that can be used as a prompt for an AI image generator.",
  structured: "Analyze the image and provide a structured prompt with three sections: Subject, Environment, and Visual Style.",
  graphic: "Describe the image focusing on professional graphic design aesthetics, including typography, layout, color palette, and subject details.",
  json: "Translate the visual elements of the image into a machine-native JSON object describing the composition, colors, subjects, and style.",
  flux: "Generate a concise, high-quality natural language prompt optimized for Flux AI models.",
  midjourney: "Generate a detailed prompt tailored for Midjourney, including descriptive keywords and common Midjourney parameters like aspect ratios or stylize values if applicable.",
  stablediffusion: "Generate a prompt formatted for Stable Diffusion, using descriptive tags and emphasizing key visual elements."
};

export async function generatePromptFromImage({ image, mimeType, modelType, language }: GeneratePromptParams): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  const model = ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: image.split(',')[1], // remove data:image/png;base64,
              mimeType: mimeType
            }
          },
          {
            text: `Generate a prompt in ${language} for this image. 
            Instruction: ${SYSTEM_INSTRUCTIONS[modelType]}
            Output only the prompt text.`
          }
        ]
      }
    ]
  });

  const response = await model;
  return response.text || "Failed to generate prompt.";
}
