import { GoogleGenAI } from "@google/genai";

export async function generateRealtimeAnswerAudio(script: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: script }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Kore", // pakai satu voice saja supaya cepat
          },
        },
      },
    },
  });

  const data =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!data) {
    throw new Error("TTS gagal generate audio");
  }

  return Buffer.from(data, "base64");
}