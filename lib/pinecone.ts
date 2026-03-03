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
        if (!question || question.trim() === "") {
            throw new Error("Question kosong, tidak bisa generate jawaban");
        }

        const matches = await searchFromPinecone(fileName, question)
        if (!matches || matches.length === 0) {
            const res = await llm.invoke(question)
            return res.content as string
        }
        
        const context = matches
            .slice(0, 3)
            .map(match => match.metadata?.content)
            .join("\n\n")

        const prompt = `
            Jawab seperti host podcast profesional.
            Singkat, natural.

            Ketentuan penting:
            - Jangan gunakan markdown.
            - Jangan gunakan bullet point atau penomoran.
            - Jangan menjelaskan struktur.
            - Buat Jawaban terasa hidup, tidak kaku.
            - Jawab berdasarkan document, kalau tidak ada di dokument katakan cari refrensi di GOOGLE

            Konteks:
            ${context}

            Pertanyaan:
            ${question}
        `

        const answer = await llm.invoke(prompt)

        return answer.content as string
    } catch (error) {
        throw error
    }
}