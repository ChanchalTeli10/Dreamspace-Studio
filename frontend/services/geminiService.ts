
import { GoogleGenAI, Type } from "@google/genai";
import { FurnitureItem, RoomMeasurements } from "../types";

export const analyzeRoomLayout = async (imageData: string, measurements: RoomMeasurements): Promise<FurnitureItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
  const mimeType = imageData.includes(',') ? imageData.split(',')[0].split(':')[1].split(';')[0] : 'image/jpeg';

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: {
        parts: [
          { 
            inlineData: { 
              mimeType: mimeType, 
              data: base64Data 
            } 
          },
          { 
            text: `Act as a professional interior designer. Analyze the uploaded photo and provide an optimal furniture layout for a room of ${measurements.width}ft width and ${measurements.length}ft length.
            
            IMPORTANT: Use these specific furniture types for best rendering:
            - "Standard Sofa" (Rectangle)
            - "L-Shaped Sofa" (Corner shape)
            - "Armchair"
            - "Coffee Table"
            - "Bed"
            - "Wardrobe"

            Return ONLY a valid JSON array of objects with these properties:
            "id", "type", "width", "depth", "height", "x", "y", "rotation" (0, 90, 180, 270), "color" (hex), "material".
            Ensure the coordinates (x, y) keep the furniture within the ${measurements.width}x${measurements.length}ft bounds.`
          }
        ]
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
              color: { type: Type.STRING },
              material: { type: Type.STRING, enum: ['Wood', 'Fabric', 'Metal', 'Glass', 'Plastic'] },
            },
            required: ["id", "type", "width", "depth", "height", "x", "y", "rotation", "color", "material"],
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text.trim());
  } catch (err) {
    console.error("Gemini Design Engine Error:", err);
    return [];
  }
};
