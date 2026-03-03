import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(request:NextRequest) {
    try {
        const body = await request.json()
        const { ids } = body

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: "IDs tidak valid" },
                { status: 400 }
            )
        }

        const pesan = await prisma.message.deleteMany({
            where: {
                id: {
                    in: ids.map(Number),
                }
            }
        })
        return NextResponse.json(pesan, {status: 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json("Gagal menghapus pesan", {status: 500})
    }
}
