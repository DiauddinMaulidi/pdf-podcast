import { LoadToPinecone } from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { existsSync } from "node:fs";

export async function POST(request: NextRequest) {
    try {
        // authenticate user
        const {userId} = await auth()

        if(!userId) {
            return NextResponse.json("Unauthorized", {status: 401})
        }

        // parse form data
        const formData = await request.formData()
        const file = formData.get("file")

        // validate file
        if(!file) {
            return NextResponse.json("No file uploaded", {
                status: 400
            })
        }

        if(!(file instanceof Blob)) {
            return NextResponse.json("Invalid file type", {
                status: 400
            })
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // extract file details
        const fileSize = file.size
        const mineType = file.type

        const originalFilename = file.name
        const fileName = `${Date.now()}-${originalFilename}`

        // upload file ke direktori public
        const filePath = path.join(process.cwd(), 'public/file', fileName)
        // console.log(filePath);
        await writeFile(filePath, buffer)

        // upload ke pineconedb
        await LoadToPinecone(fileName)

        // save document data to prisma
        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            }
        })

        if (!user) {
            return NextResponse.json("User not found", {status: 404})
        }

        const tes = await prisma.chat.create({
            data: {
                fileName,
                originalName: originalFilename,
                fileSize,
                mineType,
                fileUrl: filePath,
                userId: user.id,
            },
        })

        console.log(tes);

        return NextResponse.json({
            message: "file berhasil di upload",
            publicUrl:  filePath,
        }, {status: 200})

    } catch (error) {
        console.log(error);
        return NextResponse.json(error, {status: 500})
    }
}