"use client"

import { useQuery } from "@tanstack/react-query"
import { Mic } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function AudioWavePlayer({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [recording, setRecording] = useState(false)
  const [audioSrc, setAudioSrc] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationRef = useRef<number>(null)
  const greetingRef = useRef<HTMLAudioElement>(null)
  const isCancelledRef = useRef(false)

  let source: any;

  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id
  if (!id) return null

  const {data:chatData = []} = useQuery({
          queryKey: ["chats", id],
          enabled: !!id,
          queryFn: async ():Promise<any> => {
              const res = await fetch(`/api/chat/${id}`)
              return await res.json()
          }
  })

  const {data:podcastData = []} = useQuery({
        queryKey: ["podcast", id],
        enabled: !!id,
        queryFn: async ():Promise<any> => {
            const res = await fetch(`/api/podcast/${id}`)
            // console.log(res);
            return await res.json()
        }
    })
  
  // const isFirstInteractionRef = useRef(true)
  const greetings = [
      '/audio/greeting/hallo.wav',
      '/audio/greeting/hei.wav',
      '/audio/greeting/kabar.wav',
  ]
  const random = greetings[Math.floor(Math.random() * greetings.length)]

  // 🎧 Setup audio context
  useEffect(() => {
    if (!audioRef.current) return

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()

    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.8

    if(!source) {
      source = audioContext.createMediaElementSource(audioRef.current)
      source.connect(analyser)
      analyser.connect(audioContext.destination)
    }

    audioContextRef.current = audioContext
    analyserRef.current = analyser
    sourceRef.current = source
  }, [])

  // 🌊 Wave draw
  const draw = () => {
    const analyser = analyserRef.current
    const canvas = canvasRef.current
    if (!analyser || !canvas) return

    const ctx = canvas.getContext("2d")!
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)

    const render = () => {
      animationRef.current = requestAnimationFrame(render)
      analyser.getByteTimeDomainData(dataArray)

      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 1.5
      ctx.strokeStyle = "#60a5fa"
      ctx.beginPath()

      let sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        x += sliceWidth
      }

      ctx.stroke()
    }

    render()
  }

  useEffect(() => {
    return () => {
      // stop greeting
      if (greetingRef.current) {
        greetingRef.current.pause()
        greetingRef.current.currentTime = 0
        greetingRef.current.src = ""
        greetingRef.current = null
      }
    }
  }, [])


  const togglePlay = async () => {
    if (!audioRef.current || !audioContextRef.current) return
    // console.log(chatData);
    
    if (isPlaying) {
      audioRef.current.pause()
      cancelAnimationFrame(animationRef.current!)

    } else {
      await audioContextRef.current.resume()
      audioRef.current.play()
      draw()
    }

    setIsPlaying(!isPlaying)
  }

  const handleMicClick = async () => {
    
    if (greetingRef.current && !greetingRef.current.paused) {
      isCancelledRef.current = true
      
      greetingRef.current.pause()
      greetingRef.current.currentTime = 0
      greetingRef.current.src = ""
      greetingRef.current = null
      
    }
    
    isCancelledRef.current = false
    if (recording) return
    if (!audioRef.current || !audioContextRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      cancelAnimationFrame(animationRef.current!)
      setIsPlaying(false)
    }

    greetingRef.current = new Audio(random)
    greetingRef.current.onended = async () => {
      if (isCancelledRef.current) return
      // isFirstInteractionRef.current = false
      await startRecording()
      // setMicActive(true)
    }
    greetingRef.current.onerror = async () => {
      if (isCancelledRef.current) return
      // isFirstInteractionRef.current = false
        await startRecording()
      }
      greetingRef.current.play()
      // await startRecording()
  }


  // 🎤 Start recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

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

  // 🛑 Stop recording
  const activeFileName = chatData.fileName
  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return

    mediaRecorderRef.current.stop()
    setRecording(false)

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      })
    
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    formData.append("fileName", activeFileName)

      const res = await fetch("/api/ask", {
        method: "POST",
        body: formData,
      })

      const audioBlob = await res.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
      }

      // const newSrc = `data:audio/mpeg;base64,${data.audio}`
      // setAudioSrc(newSrc)

      // auto play
      // setTimeout(() => {
      //   audioRef.current?.play()
      //   draw()
      //   setIsPlaying(true)
      // }, 300)
    }
  }

  return (
    <div className="bg-[#111827] p-6 rounded-xl text-center text-white max-w-2xl mx-auto">
      <canvas ref={canvasRef} width={800} height={120} className="w-full" />

      <div className="flex justify-center gap-4 mt-4">
        <button onClick={togglePlay} className="px-6 py-2 bg-green-500 text-black rounded-full cursor-pointer">
          ▶
        </button>

        {!recording ? (
          <button onClick={handleMicClick} className="px-6 py-2 bg-blue-500 rounded-full cursor-pointer">
            🎤
          </button>
        ) : (
          <button onClick={stopRecording} className="px-6 py-2 bg-red-500 rounded-full cursor-pointer">
            ⏹
          </button>
        )}
      </div>

        {/* {audioSrc && (
          <audio ref={audioRef} src={audioSrc} />
        )} */}
      {podcastData?.map((podcast: any) => (
        <div key={podcast.id}>
            <audio ref={audioRef}>
                <source src={podcast.audioUrl} type="audio/wav" />
            </audio>
        </div>
      ))}
    </div>
  )
}
