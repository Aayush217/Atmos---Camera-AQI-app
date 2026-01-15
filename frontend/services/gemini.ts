import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ CRITICAL: EXPO_PUBLIC_GEMINI_API_KEY is missing from process.env");
} else {
    console.log("✅ API Key Loaded:", API_KEY.substring(0, 10) + "...");
}

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
        // Updated model name to avoid 404
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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

    } catch (error: any) {
        console.error("❌ Gemini API Error Details:", JSON.stringify(error, null, 2));
        if (error.message) console.error("Error Message:", error.message);
        if (error.response) console.error("Error Response:", JSON.stringify(error.response, null, 2));

        let userMessage = "Could not analyze image.";
        if (error.message?.includes("403")) userMessage = "API Key Invalid or Billable Account Required.";
        if (error.message?.includes("400")) userMessage = "Image format not supported or too large.";
        if (error.message?.includes("500")) userMessage = "Gemini Server Error. Try again.";

        return {
            aqi: -1,
            description: `Analysis Failed: ${userMessage}`,
            recommendation: "Please check your connection and API Key.",
            color: "#808080"
        };
    }
};
