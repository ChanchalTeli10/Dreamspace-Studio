
import { GoogleGenAI, Type } from "@google/genai";
import { FurnitureItem, RoomMeasurements } from "../types";

/**
 * analyzeRoomLayout uses Gemini AI to suggest a furniture layout based on room photo and dimensions.
 * Updated to use Feet (ft) for all spatial calculations.
 */
export const analyzeRoomLayout = async (imageData: string, measurements: RoomMeasurements): Promise<FurnitureItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
  const mimeType = imageData.includes(',') ? imageData.split(',')[0].split(':')[1].split(';')[0] : 'image/jpeg';

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: `Suggest a realistic and professional furniture layout for a room (${measurements.width}ft x ${measurements.length}ft). 
          Return a JSON array of furniture items. 
          Use Feet (ft) as the unit for all dimensions.
          Use a professional architectural color palette (neutral grays, muted slates, beige, charcoal).
          Structure: { "id": string, "type": string, "width": number, "depth": number, "height": number, "x": number, "y": number, "rotation": number, "color": string, "material": string }.
          Ensure furniture is logically placed (e.g., sofas against walls or centered, paths clear).`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
            width: { type: Type.NUMBER },
            depth: { type: Type.NUMBER },
            height: { type: Type.NUMBER },
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
            rotation: { type: Type.NUMBER },
            color: { type: Type.STRING, description: "Hex code" },
            material: { type: Type.STRING, enum: ['Wood', 'Fabric', 'Metal', 'Glass', 'Plastic'] },
          },
          required: ["id", "type", "width", "depth", "height", "x", "y", "rotation", "color", "material"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) return [];
  
  try {
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return [];
  }
};

export const generateRealisticView = async () => null;
