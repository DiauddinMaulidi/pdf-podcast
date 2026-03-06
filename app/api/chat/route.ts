export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const {userId} = await auth()

    if(!userId) {
        return NextResponse.json("Unauthorized", {status: 401})
    }

    const userChats = await prisma.user.findUnique({
        where: {clerkId: userId},
        include: {
            chats: {
                orderBy: {
                    uploadedAt: "desc"
                }
            }
        }
    })

    const chats = userChats?.chats ?? []

    return NextResponse.json(chats, {status: 200})

  } catch (error) {
    return NextResponse.json(error, {status: 500})
  }
}
