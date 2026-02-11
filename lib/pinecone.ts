import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {Pinecone} from "@pinecone-database/pinecone"
import path from "path"
import { generateEmbeddings } from "./gemini";

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