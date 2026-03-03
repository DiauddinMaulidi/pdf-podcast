import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(request:NextRequest, {params}: {params:Promise<{id: string}>}) {
    try {
        const {id} = await params
        const podcast = await prisma.podcast.findMany({
            where: {chatId: parseInt(id)},
            orderBy: {
                createdAt: "desc",
            }
        })
        // console.log("hasilnya", id);
        return NextResponse.json(podcast, {status: 200})
    } catch (error) {
        console.log(error);
        return NextResponse.json(error, {status: 500})
    }
}

export async function DELETE( request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const chatId = parseInt(id)

        const podcasts = await prisma.podcast.findMany({
            where: { chatId },
        })


        if (podcasts.length === 0) {
            return NextResponse.json(
                { message: "Podcast tidak ditemukan" },
                { status: 404 }
            );
        }

        for (const podcast of podcasts) {
            const filePath = path.join(
                process.cwd(),
                "public/audio",
                podcast.fileName
            )

            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath)
            }
        }

        // hapus di mysql dengan prisma
        await prisma.podcast.deleteMany({
            where: { chatId },
        });
        
        return NextResponse.json(
            { message: "Berhasil dihapus" },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
    }
}