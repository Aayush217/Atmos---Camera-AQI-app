require('dotenv').config({ path: '../frontend/.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No API Key found in process.env.EXPO_PUBLIC_GEMINI_API_KEY");
        return;
    }

    console.log(`Checking key: ${key.substring(0, 5)}...`);

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello! Are you working?");
        const response = await result.response;
        console.log("✅ API Success! Response:", response.text());
    } catch (error) {
        console.error("❌ API Failed:", error.message);
    }
}

testGemini();
