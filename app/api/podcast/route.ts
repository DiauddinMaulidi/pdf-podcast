import { getContext } from "@/lib/context";
import { llm } from "@/lib/gemini";
import { generatedPodcastAudio } from "@/lib/geminiTTS";
import { prisma } from "@/lib/prisma";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request:NextRequest) {
    try {
        const body = await request.json()
        const {message, fileName, chatId, userId} = body
        const context = await getContext(message, fileName)

        const systemMessage = [
            new SystemMessage(`
                Buatkan naskah podcast berdurasi 7-10 menit berdasarkan dokumen ini. Gunakan gaya bahasa seperti host dan co-host podcast yang menjelaskan materi.
                
                Ketentuan penting:
                - Output harus langsung berupa naskah dialog.
                - Jangan tambahkan kalimat pembuka seperti "Berikut adalah naskah podcast..." atau penjelasan apapun di luar dialog.
                - Jangan gunakan markdown.
                - Jangan gunakan bullet point atau penomoran.
                - Jangan menjelaskan struktur.
                - Langsung mulai dari dialog host.
                - Buat percakapan terasa hidup, tidak kaku, dan ada interaksi alami.
                - Tambahkan hhok menarik di awal.
                - Akhiri dengan penutup yang natural seperti podcast pada umumnya.
                - gunakan nama NIKO ROBIN dan OKKOTSU YUTA, bukan nama orang atau yang lainnya.

                Pastikan dialog mengalir dan tidak terdengar seperti artikel yang dibacakan.
                
                Context:
                ${context}
            `),
            new HumanMessage("Mulai podcast sekarang."),
        ]

        const response = await llm.invoke(systemMessage)
        const content =
            typeof response.content === "string"
                ? response.content
                : response.content?.toString() ?? "";

        const fileNameAudio = `podcast-${fileName}.wav`;

        const filePath = path.join(process.cwd(), "public/audio", fileNameAudio)

        if (fs.existsSync(filePath)) {
            console.log(filePath, "sudah ada");
            return NextResponse.json("file sudah ada");
        }

        const audioUrl = await generatedPodcastAudio(content, fileNameAudio);
        
        await prisma.podcast.create({
            data: {
                fileName: fileNameAudio,
                chatId: parseInt(chatId),
                audioUrl,
                duration: 6,
            },
        })

        return NextResponse.json({
            script: content,
            audio: audioUrl,
        }, {status: 200})
        
    } catch (error) {
        console.log(error);
        return NextResponse.json(error, {status: 500})
    }
}