"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Groq from "groq-sdk";
import { createFlashcard } from "./flashcard-actions";

import { revalidatePath } from "next/cache";

// Initialize Groq client
// Note: This requires GROQ_API_KEY environment variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function generateFlashcards(
  deckId: string,
  topic: string,
  count: number = 5
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!process.env.GROQ_API_KEY) {
      return {
        error: "Groq API key not configured. Please add GROQ_API_KEY to .env.local"
      };
    }

    const prompt = `Generate ${count} flashcards about "${topic}".
    Return a JSON object with a "flashcards" array.
    
    For standard flashcards:
    { "question": "Short clear question", "answer": "Concise answer", "cardType": "flashcard" }
    
    For multiple choice questions (mix them in, about 30% frequency):
    { 
      "question": "Question text", 
      "cardType": "mcq", 
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"], 
      "correctAnswerIndex": 0, 
      "answer": "Option 1" 
    }
    
    Ensure 'answer' for MCQ matches 'options[correctAnswerIndex]'.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful educational assistant that generates flashcards. You must output valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content;

    if (!text) {
      return { error: "Failed to generate content from Groq" };
    }

    // Parse response
    let cards;
    try {
      const data = JSON.parse(text);
      cards = data.flashcards || data.cards || (Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      return { error: "AI response was not valid JSON" };
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      return { error: "Invalid response format from AI" };
    }

    // Create cards in database
    let createdCount = 0;
    for (const card of cards) {
      await createFlashcard(deckId, {
        question: card.question,
        answer: card.answer,
        cardType: card.cardType || "flashcard",
        options: card.options,
        correctAnswerIndex: card.correctAnswerIndex,
      });
      createdCount++;
    }

    revalidatePath(`/decks/${deckId}`);
    revalidatePath("/decks");
    return { success: true, count: createdCount };
  } catch (error: any) {
    console.error("AI generation error:", error);

    if (error.status === 429 || error.message?.includes("Rate limit")) {
      return { error: "Groq Rate Limit exceeded. Please try again in a moment." };
    }

    return { error: error.message || "Failed to generate flashcards" };
  }
}

export async function batchConvertToMcq(cards: { question: string; answer: string, _id: string }[]) {
  if (cards.length === 0) return [];

  // If no API key, return empty (client will handle fallback possibly, or error)
  if (!process.env.GROQ_API_KEY) {
    console.warn("Missing GROQ_API_KEY for batch conversion");
    return cards; // Fallback to original
  }

  try {
    // Prompt construction
    const items = cards.map((c, i) => `Item ${i}: Q: "${c.question}", A: "${c.answer}"`).join("\n");
    const prompt = `Convert the following Q&A pairs into Multiple Choice Questions.
      For each item, generate 3 plausible but incorrect options (distractors).
      Return a JSON object with a "conversions" array corresponding to the input order.
      
      Input Items:
      ${items}
      
      Output Format (JSON):
      {
        "conversions": [
          {
             "options": ["Correct Answer", "Distractor 1", "Distractor 2", "Distractor 3"],
             "correctAnswerIndex": 0
          }
        ]
      }
      IMPORTANT: The "options" array MUST include the original Answer (or a concise version of it) and 3 distractors. 
      The content of the "options" MUST be strings.
      Shuffle the position of the correct answer randomly in the array and set "correctAnswerIndex" accordingly.
      `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are an exam generator. Output strict JSON." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    const conversions = data.conversions || [];

    // Merge back
    return cards.map((card, i) => {
      const conv = conversions[i];
      if (conv && Array.isArray(conv.options) && typeof conv.correctAnswerIndex === 'number') {
        return {
          ...card,
          cardType: "mcq",
          options: conv.options,
          correctAnswerIndex: conv.correctAnswerIndex
        };
      }
      return card; // Fail safe
    });

  } catch (error) {
    console.error("Batch conversion error:", error);
    return cards; // Return original if failed
  }
}
