export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getContext } from "@/lib/context";
import { llm } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MessageRole } from "@prisma/client";
// import "dotenv/config";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
      let message: string | null = null;
      let chatId: string | null = null;
      let fileName: string | null = null;

      if(request.headers.get("content-type")?.includes("multipart/form-data")) {
        const formData = await request.formData();
        const audioFile = formData.get("file");

        chatId = formData.get("chatId") as string;
        fileName = formData.get("fileName") as string;

        if (!audioFile || typeof audioFile === "string") {
          return NextResponse.json({ error: "Audio file belum di-upload" }, { status: 400 });
        }

        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const elevenlabs = new ElevenLabsClient({
          apiKey: process.env.ELEVENLABS_API_KEY!,
        });
  
        const result = await elevenlabs.speechToText.convert({
          file: buffer,
          modelId: "scribe_v2",
          tagAudioEvents: true,
          diarize: false,
        });

        message = result.text
      } else {
        const body = await request.json()
        message = body.message
        chatId = body.chatId
        fileName = body.fileName
      }

      if (!message || !chatId) {
        return NextResponse.json(
          { error: "Message atau chatId tidak valid" },
          { status: 400 }
        );
      }
      const parsedChatId = Number(chatId);
      
      if (!parsedChatId || isNaN(parsedChatId)) {
        return NextResponse.json(
          { error: "chatId tidak valid" },
          { status: 400 }
        );
      }
      
      const chat = await prisma.chat.findUnique({
        where: { id: parsedChatId },
      });

      if (!chat) {
        return NextResponse.json(
          { error: "Chat tidak ditemukan" },
          { status: 404 }
        );
      }

      const userId = chat.userId;

      await prisma.message.create({
        data: {
          role: MessageRole.USER,
          content: message,
          chatId: parsedChatId,
          userId: userId,
        },
      })
      
      const history = await prisma.message.findMany({
        where: { chatId: parseInt(chatId) },
        orderBy: { createdAt: "asc" },
      })

      const chatHistory = history.map((msg: any) => {
        if (msg.role === MessageRole.USER) {
          return new HumanMessage(msg.content)
        } else {
          return new AIMessage(msg.content)
        }
      }
      )

      const context = await getContext(message, fileName ?? "")

      const response = await llm.invoke([
        new SystemMessage(`
          Gunakan konteks berikut untuk menjawab pertanyaan.
          Jawab singkat, jelas, dan tidak perlu menyapa ulang jika ini lanjutan.

          Ketentuan Penting:
          - Jangan gunakan markdown.
          - Jangan gunakan bullet point atau penomoran.
          - Buat Jawaban terasa hidup, tidak kaku.
          

          Context:
          ${context}
        `),
        ...chatHistory,
      ])

      const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content)

      await prisma.message.create({
        data: {
          role: MessageRole.SISTEM,
          content,
          chatId: parseInt(chatId),
          userId: userId,
        },
      })

      return NextResponse.json({message: content}, {status: 200})
      
    } catch (err: any) {
      console.log(err)
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
}