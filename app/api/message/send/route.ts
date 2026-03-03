import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest) {
    try {
        const body = await request.json()
        const {content, chatId, role} = body
        const {userId} = await auth()

        const user = await prisma.user.findUnique({
            where: {clerkId: userId}
        })

        if(!user) return NextResponse.json("Unauthorized", {status: 401})

        const message = await prisma.message.create({
            data: {
                content,
                role,
                chatId: chatId,
                userId: user?.id
            }
        })
        return NextResponse.json(message, {status: 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json("Error sending message", {status: 500})
    }
}