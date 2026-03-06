import { LoadToPinecone } from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

        // const bytes = await file.arrayBuffer();
        // const buffer = Buffer.from(bytes);
        // upload file ke direktori public
        // const filePath = path.join(process.cwd(), 'public/file', fileName)

        // extract file details
        const fileSize = file.size
        const mineType = file.type

        const originalFilename = file.name
        const fileName = `${Date.now()}-${originalFilename}`
        const bucketName = "document"
        const { error } = await supabase.storage
            .from(bucketName) // Your bucket name
            .upload(fileName, file)
        
        if (error) {
            console.log(error)
            return NextResponse.json(
                { message: `File upload failed: ${error.message}` },
                { status: 500 }
            )
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName)

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

        await prisma.chat.create({
            data: {
                fileName,
                originalName: originalFilename,
                fileSize,
                mineType,
                fileUrl: publicUrlData?.publicUrl,
                userId: user.id,
            },
        })

        return NextResponse.json({
            message: "file berhasil di upload",
            publicUrl:  publicUrlData?.publicUrl,
        }, {status: 200})

    } catch (error) {
        console.log(error);
        return NextResponse.json(error, {status: 500})
    }
}