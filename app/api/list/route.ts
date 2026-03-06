export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const data = await prisma.chat.findMany()
        return NextResponse.json(data, {status: 200})
    } catch (error) {
        return NextResponse.json(error, {status: 500})
    }
}