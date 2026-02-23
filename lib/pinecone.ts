import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {Pinecone, RecordMetadata, ScoredPineconeRecord} from "@pinecone-database/pinecone"
import path from "path"
import { generateEmbeddings, llm } from "./gemini";
import { NextResponse } from "next/server";

// inisialisasi pinecone
export const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY as string,
})
const index = pc.index(process.env.PINECONE_INDEX_NAME!)

export async function LoadToPinecone(fileName: string) {
    try {
        const filePath = path.join(process.cwd(), "public/file", fileName)

        const loader = new PDFLoader(filePath)
        const directoryDocs = await loader.load()
        
        // split into chunks
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        })
        const splits = await splitter.splitDocuments(directoryDocs);

        // create embeddings
        const texts = splits.map((doc) => doc.pageContent)
        const embeddings = await Promise.all(
            texts.map(async (text) => await generateEmbeddings(text))
        )

        // create vector object
        const vectors = splits.map((doc, index) => ({
            id: `${fileName}-${index}-${Date.now()}`,
            values: embeddings[index],
            metadata: {
                source: fileName,
                page: doc.metadata.page,
                text: doc.pageContent,
                chunk: index,
                uploadedAt: Date.now(),
            },
        }))

        if (vectors.length === 0) {
            throw new Error("No vectors generated — PDF kemungkinan tidak terbaca")
        }
        const upsertPayload = {
            records: vectors
        };

        // upload to pinecone
        const result = await index.namespace(fileName).upsert(upsertPayload)
        return result
    } catch (error) {
        console.log(error);
        throw error
    }
}

export async function deleteNamespace(filename:string) {
    try {
        const result = await index.namespace(filename).deleteAll()
        return result
    } catch (error) {
        console.log("Error delete namespace", error);
        throw error
    }
}

async function searchFromPinecone(fileName:string, question: string): Promise<ScoredPineconeRecord<RecordMetadata>[]> {
    try {
        const questionEmbedding = await generateEmbeddings(question)

        const queryResponse = await index.namespace(fileName).query({
            vector: questionEmbedding,
            topK: 5,
            includeMetadata: true,
        })

        return queryResponse.matches
    } catch (error) {
        console.log(error);
        throw error
    }
}

export async function askRag(fileName: string, question: string): Promise<string> {
    try {
        const matches = await searchFromPinecone(fileName, question)
        
        if (!question || question.trim() === "") {
            throw new Error("Question kosong, tidak bisa generate jawaban");
        }

        if (!matches || matches.length === 0) {
            const res = await llm.invoke(question)
            return res.content as string
        }

        const topScore = matches[0].score ?? 0
        const context = matches
            .map(match => match.metadata?.content)
            .join("\n\n")

        let prompt = ""

        if (topScore > 0.8) {
            prompt = `Jawab hanya berdasarkan konteks berikut.
            
            Konteks:
            ${context}

            Pertanyaan:
            ${question}`
        
        } else if (topScore > 0.6) {
            prompt = `Kamu adalah asisten AI yang menjawab pertanyaan secara langsung dan jelas.

            Rules:
            - Gunakan konteks berikut untuk menjawab pertanyaan secara langsung, singkat, dan jelas.
            - Jangan menyebutkan bahwa jawaban berasal dari konteks.
            - Jangan memberikan penjelasan pembuka atau penutup yang tidak perlu.

            Konteks:
            ${context}
            
            Pertanyaan:
            ${question}`

        } else {
            const res = await llm.invoke(question)
            return res.content as string
        }

        const answer = await llm.invoke(prompt)

        return answer.text as string
    } catch (error) {
        throw error
    }
}