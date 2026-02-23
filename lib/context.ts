import { generateEmbeddings } from "./gemini";
import { pc } from "./pinecone";
import { prisma } from "./prisma";

export async function getFromEmbeddings(embeddings:number[], fileName:string) {
    const index = pc.index(process.env.PINECONE_INDEX_NAME!).namespace(fileName)

    try {
        const queryResult = await index.query({
            vector: embeddings,
            topK: 5,
            includeValues: true,
            includeMetadata: true
        })
        return queryResult.matches || []
    } catch (error) {
        throw error
    }
}

export async function getContext(query:string, fileName: string) {
    if (!query) {
        throw new Error("Text is undefined or empty")
    }
    const queryEmbeddings = await generateEmbeddings(query)
    const context = await getFromEmbeddings(queryEmbeddings, fileName)

    const filteredText = context.filter((match) => match.score && match.score > 0.5)

    const docs = filteredText.map((doc) => doc?.metadata?.text)
    return docs
}

// export async function getFullDocument(fileName: string) {
//     const chunks = await prisma.documentChunk.findMany({
//         where: {
//             document: {
//                 fileName: fileName
//             }
//         },
//         orderBy: {
//             chunkIndex: "asc"
//         }
//     })

//     return chunks.map(chunk => chunk.text).join("\n")
// }
