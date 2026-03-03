import { Mic, Send } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { Button } from './ui/button'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

type Props = {
  onVoiceResult: (formData: FormData) => void
}

const Rekam = ({onVoiceResult}: Props) => {
    const [recording, setRecording] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const params = useParams()
    const {id} = params

    const {data:chatData = []} = useQuery({
        queryKey: ["chats", id],
        enabled: !!id,
        queryFn: async ():Promise<any> => {
            const res = await fetch(`/api/chat/${id}`)
            return await res.json()
        }
    })

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true})
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/webm"
        });
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (e) => {
            audioChunksRef.current.push(e.data)
        }

        mediaRecorder.start()
        setRecording(true)
    }
    // const activeFileName = chatData.fileName
    const stopRecording = async () => {
        if (!mediaRecorderRef.current) return

        mediaRecorderRef.current.stop()
        setRecording(false)

        mediaRecorderRef.current.onstop = async () => {
            const blob = new Blob(audioChunksRef.current, {
                type: "audio/webm",
            })

            const formData = new FormData()
            formData.append("file", blob, "recording.webm")

            onVoiceResult(formData)
        }

    }

  return (
    <>
        {!recording
        ? <Button onClick={startRecording} type='button' className="bg-purple-400 cursor-pointer"><Mic /></Button>
        : <Button onClick={stopRecording} type='button' className="cursor-pointer"><Send /></Button>}
    </>
  )
}

export default Rekam
