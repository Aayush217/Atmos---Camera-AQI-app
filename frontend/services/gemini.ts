import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const analyzeImage = async (base64Image: string) => {
    if (!genAI) {
        console.warn("Gemini API Key is missing. Using mock data.");
        return {
            aqi: 75,
            description: "Based on the visual clarity, the air quality seems moderate. The horizon is slightly hazy.",
            recommendation: "It's okay to be outside, but sensitive groups should take it easy.",
            color: "#FFD700" // Yellow-ish
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Faster model
        const prompt = "Analyze this image of the horizon/sky. Estimate the PM2.5 level based on visual haze. Return a JSON object with keys: 'aqi' (number), 'description' (short string), 'recommendation' (short safety tip), and 'color' (hex code representing severity, e.g., green, yellow, orange, red).";

        // Timeout promise
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Gemini API timeout")), 25000) // Increased to 25s
        );

        const result: any = await Promise.race([
            model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: "image/jpeg",
                    },
                },
            ]),
            timeoutPromise
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Error analyzing image:", error);
        // Fallback to mock data on error
        return {
            aqi: -1,
            description: "Could not analyze image (Network Error).",
            recommendation: "Please check your connection.",
            color: "#808080"
        };
    }
};
