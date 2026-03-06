export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest, {params}: {params: Promise<{id: string}>}) {
    try {
        const {id} = await params
        const message = await prisma.message.findMany({
            where: {chatId: parseInt(id)}
        })
        return NextResponse.json(message, {status: 200})
    } catch (error) {
        return NextResponse.json("Error Fetching message", {status: 500})
    }
}