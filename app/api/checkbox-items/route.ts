/* eslint-disable*/

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 512,
  responseMimeType: "text/plain",
};

export async function POST(req: NextRequest) {
  try {
    const { paragraph } = await req.json();

    if (!paragraph) {
      return NextResponse.json({ error: "No paragraph provided" }, { status: 400 });
    }

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const prompt = `Given the following paragraph, extract a list of human diseases:
    "${paragraph} - **dont just rely on paragraph, include secondary also, just in label add -(Secondary Possibility)** they must be 6"
    
    Respond strictly with a JSON array only, no additional text, no formatting, no explanations, no code blocks. Just return:
    [{ "id": "pneumonia", "label": "Pneumonia" }, { "id": "copd", "label": "COPD" }, { "id": "interstitial_lung_disease", "label": "Interstitial Lung Disease" }]`;

    const result = await chatSession.sendMessage(prompt);
    let responseText = result.response.text().trim();
    console.log(responseText);

    // Ensure response does not contain unwanted formatting like triple backticks
    responseText = responseText.replace(/^```json\n?|```$/g, "");

    let parsedItems;
    try {
      parsedItems = JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      parsedItems = [];
    }

    return NextResponse.json(parsedItems);
  } catch (error) {
    console.error("Error generating response:", error);
    return NextResponse.json({ error: "Failed to generate data" }, { status: 500 });
  }
}
