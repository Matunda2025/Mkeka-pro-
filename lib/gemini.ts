import { GoogleGenAI, Type } from "@google/genai";
import type { Betslip } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateBetslipsData(): Promise<Betslip[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      // Simplified prompt to rely more on the schema, which can be more robust.
      contents: "Generate a JSON array of 2 realistic betslip objects for a sports betting app. Ensure provider names are creative, odds are realistic, and expiry dates are within the next 3 days. Use picsum.photos for image URLs.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              // FIX: Changed id type from INTEGER to STRING to match the Betslip interface.
              id: { type: Type.STRING, description: "A unique identifier for the betslip." },
              provider: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The name of the tipster or provider." },
                  avatarUrl: { type: Type.STRING, description: "A cartoon-style avatar image URL from picsum.photos." },
                  subscribers: { type: Type.INTEGER, description: "Number of subscribers." },
                },
                required: ['name', 'avatarUrl', 'subscribers'],
              },
              odds: { type: Type.NUMBER, description: "The total odds for the betslip." },
              status: { type: Type.STRING, enum: ['active'], description: "The status of the betslip, always 'active'." },
              expiresAt: { type: Type.NUMBER, description: "A future UNIX timestamp in milliseconds (e.g., 1-3 days from now)." },
              price: { type: Type.STRING, description: "The price in Tanzanian Shillings (e.g., 'Tzs 1,000/=')." },
              sponsors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Sponsor name from a list like ['SportyBet', 'Sokabet', 'PARIPESA']." },
                    logoUrl: { type: Type.STRING, description: "A placeholder logo URL." },
                  },
                  required: ['name', 'logoUrl'],
                },
              },
              code: { type: Type.STRING, description: "An optional short alphanumeric betslip code." },
              betslipImageUrl: { type: Type.STRING, description: "An optional betslip background image URL from picsum.photos." },
            },
            required: ['id', 'provider', 'odds', 'status', 'expiresAt', 'price', 'sponsors'],
          },
        },
      },
    });

    const jsonText = response.text.trim();
     // A simple check to ensure the response is a valid array-like string
    if (!jsonText.startsWith('[') || !jsonText.endsWith(']')) {
        throw new Error("Received malformed JSON from API.");
    }
    const data = JSON.parse(jsonText);
    return data as Betslip[];
  } catch (error)
 {
    console.error("Error generating betslip data:", error);
    // Return mock data that matches the new structure in case of an error
    return [
        {
            // FIX: Changed id from a number to a string to match the Betslip interface.
            id: '1',
            provider: { name: 'Winners (Fallback)', avatarUrl: 'https://picsum.photos/seed/avatar1/100', subscribers: 18176 },
            odds: 1.95,
            status: 'active',
            expiresAt: Date.now() + 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 1000,
            price: 'Tzs 1,000/=',
            sponsors: [ { name: 'SportyBet', logoUrl: '' }, { name: 'Sokabet', logoUrl: '' } ],
            code: 'WIN195',
            betslipImageUrl: 'https://picsum.photos/seed/blurbg1/600/800',
        },
        {
            // FIX: Changed id from a number to a string to match the Betslip interface.
            id: '2',
            provider: { name: 'PHIDASA (Fallback)', avatarUrl: 'https://picsum.photos/seed/avatar2/100', subscribers: 8021 },
            odds: 2.11,
            status: 'active',
            expiresAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
            price: 'Tzs 2,000/=',
            sponsors: [ { name: 'PARIPESA', logoUrl: '' } ],
            code: 'PHI211',
            betslipImageUrl: 'https://picsum.photos/seed/blurbg2/600/800',
        }
    ];
  }
}