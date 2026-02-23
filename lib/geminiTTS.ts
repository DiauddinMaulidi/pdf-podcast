import { GoogleGenAI } from "@google/genai";
import path from "path";
import wav from "wav";

export async function generatedPodcastAudio(script:string, fileName: string) {
    const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY})
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: script }] }],
      config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
               multiSpeakerVoiceConfig: {
                  speakerVoiceConfigs: [
                        {
                           speaker: 'NIKO ROBIN',
                           voiceConfig: {
                              prebuiltVoiceConfig: { voiceName: 'Kore' }
                           }
                        },
                        {
                           speaker: 'OKKOTSU YUTA',
                           voiceConfig: {
                              prebuiltVoiceConfig: { voiceName: 'Puck' }
                           }
                        }
                  ]
               }
            }
      }
   });
   const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

   if(data) {
        const audioBuffer = Buffer.from(data, 'base64');

        const filePath = path.join(process.cwd(), "public/audio", fileName);

        await new Promise((resolve, reject) => {
            const writer = new wav.FileWriter(filePath, {
            channels: 1,
            sampleRate: 24000,
            bitDepth: 16,
            });

            writer.on("finish", resolve);
            writer.on("error", reject);

            writer.write(audioBuffer);
            writer.end();
        })
    } else {
        console.log("Cannot create buffer from undefined data.");
   }

   return `/audio/${fileName}`;
}