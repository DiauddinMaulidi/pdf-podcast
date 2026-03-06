import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { supabase } from "@/lib/supabase";

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

        const fileNames = podcasts.map(podcast => podcast?.fileName)

        const { error } = await supabase.storage
            .from("audio")
            .remove(fileNames);

        if (error) {
            console.error("Supabase delete error:", error);
        }


        await prisma.podcast.deleteMany({
            where: { chatId },
        });
        
        return NextResponse.json(
            { message: "Berhasil dihapus" },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}