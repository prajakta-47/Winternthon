require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

console.log("Testing Gemini API...");
console.log("API Key:", apiKey ? apiKey.substring(0, 20) + "..." : "NOT FOUND");

if (!apiKey) {
  console.error("❌ ERROR: GEMINI_API_KEY not found in .env file");
  process.exit(1);
}

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Test 1: Simple question
    console.log("\nTest 1: What is TypeScript?");
    const result1 = await model.generateContent("What is TypeScript? Explain in 2 sentences.");
    console.log("Response:", result1.response.text());
    
    // Test 2: Emotional response
    console.log("\nTest 2: Student says 'I am sad'");
    const result2 = await model.generateContent(`You are a teaching assistant. Student says "I am sad". Respond supportively.`);
    console.log("Response:", result2.response.text());
    
    // Test 3: Technical question
    console.log("\nTest 3: React useState question");
    const result3 = await model.generateContent("What is useState in React?");
    console.log("Response:", result3.response.text().substring(0, 150) + "...");
    
    console.log("\n✅ All tests passed! Gemini API is working correctly.");
    
  } catch (error) {
    console.error("\n❌ API Error:", error.message);
    
    if (error.message.includes("API key")) {
      console.log("\n🔧 Fix your API key:");
      console.log("1. Get new key: https://makersuite.google.com/app/apikey");
      console.log("2. Enable API: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com");
      console.log("3. Wait 5 minutes, then try again");
    } else if (error.message.includes("403")) {
      console.log("\n🔧 API not enabled or quota exceeded");
      console.log("Enable here: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com");
    }
  }
}

test();