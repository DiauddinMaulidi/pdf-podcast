import { getContext } from "@/lib/context";
import { llm } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MessageRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {message, fileName, chatId, userId} = body
        const context = await getContext(message, fileName)

        const systemMessage = [
            new SystemMessage(`
                Gunakan konteks berikut untuk menjawab pertanyaan. Jika konteks tidak cukup, gunakan pengetahuan umum untuk melengkapi.
                
                Ketentuan penting:
                - Jawab dengan singkat padat dan jelas
                - Jawab maksimal 10 kalimat

                Context:
                ${context}
                
            `),
            new HumanMessage("hallo"),
        ]
        const response = await llm.invoke(systemMessage)

        const content = response.content

        await prisma.message.create({
            data: {
                role: MessageRole.SISTEM,
                content: content as string,
                chatId: parseInt(chatId),
                userId: parseInt(userId),
            }
        })

        return NextResponse.json({
            message:content, role:MessageRole.SISTEM
        }, {status: 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json("Error Sending Message", {status: 500})
    }
}