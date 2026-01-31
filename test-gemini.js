const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function checkModels() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("No API key found!");
    return;
  }

  try {
    console.log("Fetching available models via REST...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("Available models:");
      data.models.forEach(m => {
        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
           console.log(`- ${m.name}`);
        }
      });
    } else {
      console.log("No models returned or error:", data);
    }

  } catch (error) {
    console.error("Error listing models:", error);
  }
}

checkModels();
