import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { deleteNamespace } from "@/lib/pinecone";

export async function GET(request:NextRequest, {params}: {params:Promise<{id: string}>}) {
    try {
        const {id} = await params
        const chat = await prisma.chat.findUnique({
            where: {id: parseInt(id)},
        })
        // console.log(chat);

        return NextResponse.json(chat, {status: 200})
    } catch (error) {
        console.log(error);
        return NextResponse.json("error faching chat", {status: 500})
    }
}

export async function DELETE(request:NextRequest, {params}: {params:Promise<{id: string}>}) {
    try {
        const {id} = await params
        // hapus di prisma
        const chat = await prisma.chat.delete({
            where: {id: parseInt(id)}
        })

        // const pdf = await prisma.chat.findUnique({ where:{id: parseInt(id)} })
        const filePath = path.join(process.cwd(), 'public/file', chat?.fileName)
        
        // hapus file pdf di database local
        await fs.promises.unlink(filePath)
        
        // hapus dari pinecone
        await deleteNamespace(chat?.fileName)

        return NextResponse.json(chat, {status: 200})
    } catch (error) {
        console.log(error);
        return NextResponse.json("Error deleting chat", {status: 200})
    }
}