import { llm } from "@/lib/gemini";
import { askRag } from "@/lib/pinecone";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("file");
    const fileName = formData.get("fileName") as string

    if (!audioFile || typeof audioFile === "string") {
      return NextResponse.json({ error: "Audio file belum di-upload" }, { status: 400 });
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY!,
    });

    const result = await elevenlabs.speechToText.convert({
      file: audioFile,
      modelId: "scribe_v2",
      tagAudioEvents: true,
      diarize: false,       // set true kalau mau speaker diarization
    });

    const question = result.text
    const answerText = await askRag(fileName, question)
    const answerAudio = await llm.invoke(answerText)

    console.log(question)

    return NextResponse.json({
      question,
      answer: answerText,
      audioUrl: answerAudio
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// export async function POST(request:NextRequest) {
//     try {
//         const { question, fileName } = await request.json();

//         const matches = await searchFromPinecone(fileName, question)

//         const topScore = matches[0]?.score ?? 0

//         let context = "";

//         if(topScore > 0.75) {
//             context = matches.map((match: any) => match.metadata.text).join("\n")
//         }

//         const promt = `
//             Gunakan konteks berikut untuk menjawab pertanyaan. Jika konteks tidak cukup, gunakan pengetahuan umum untuk melengkapi.

//             Ketentuan penting:
//             - Jika ada yang ingin bertanya dan klik tombol join, sapa dulu seperti podcast pada umumnya
//             - Sapa seperti "Hai teman apa kabar?" atau apapun 

//             konteks
//             ${context}
            
//             pertanyaan
//             ${question}
//         `

//         const answer = await generateEmbeddings(promt)

//         return NextResponse.json({ answer, score: topScore })
//     } catch (error) {
//         return NextResponse.json(
//         { error: "Failed to search context" },
//         { status: 500 }
//         );
//     }
// }

// export async function POST(req: NextRequest) {
//   const { audioBase64, fileName } = await req.json()
