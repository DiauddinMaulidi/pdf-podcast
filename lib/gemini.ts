import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import OpenAI from 'openai';

export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
});

// model chatnya
export const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-3-flash-preview",
})

export async function generateEmbeddings(text:string):Promise<number[]> {
    return await embeddings.embedQuery(text)
}

// const client = new OpenAI({
//   baseURL: 'https://ai.megallm.io/v1',
//   apiKey: process.env.MEGALLM_API_KEY
// });

// export const llm2 = await client.chat.completions.create({
//   model: 'gpt-3.5-turbo',
//   messages: [
//     { role: 'user', content: 'Gas buat!' }
//   ],
//   stream: true,
//   temperature: 0.2,
// });