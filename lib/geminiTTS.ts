import { GoogleGenAI } from "@google/genai";
import path from "path";
import { PassThrough } from "stream";
import wav from "wav";

export async function generatedPodcastAudio(script:string) {
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

   if(!data) {
      //   const filePath = path.join(process.cwd(), "public/audio", fileName);

      throw new Error("Cannot create buffer from undefined data.");
   }
   
   const pcmBuffer = Buffer.from(data, 'base64');
   
   const wavWriter = new wav.Writer({
      channels: 1,
      sampleRate: 24000,
      bitDepth: 16,
   });
   
   const stream = new PassThrough();
   const chunks: Buffer[] = [];

   stream.on("data", (chunk) => chunks.push(chunk));

   wavWriter.pipe(stream);

   wavWriter.write(pcmBuffer);
   wavWriter.end();

   await new Promise((resolve) => stream.on("finish", resolve));

   const wavBuffer = Buffer.concat(chunks);

   return wavBuffer;
}