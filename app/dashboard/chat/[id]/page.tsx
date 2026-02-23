"use client"
import AudioWavePlayer from '@/components/audioWavePlayer'
import { Button } from '@/components/ui/button'
import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GripVertical, Loader, Mic, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
// import AudioPlayer from 'react-audio-player';

const useIsHydrated = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return [hydrated];
};


const DetailChat = () => {
    const params = useParams()
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id
    if (!id) return null

    const [isVisible, setIsVisible] = useState(false)
    const [isHydrated] = useIsHydrated()

    const queryClient = useQueryClient()
    const router = useRouter()
    const {data:chatData, isLoading, isError} = useQuery({
        queryKey: ["chats", id],
        enabled: !!id,
        queryFn: async ():Promise<any> => {
            const res = await fetch(`/api/chat/${id}`)
            return await res.json()
        }
    })

    const {data:podcastData = [], refetch} = useQuery({
        queryKey: ["podcast", id],
        enabled: !!id,
        queryFn: async ():Promise<any> => {
            const res = await fetch(`/api/podcast/${id}`)
            // console.log(res);
            return await res.json()
        }
    })

    // const [script, setScript] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)

    const generate = async () => {
    if (!chatData?.fileName) return

    try {
        setIsGenerating(true)

        const response = await fetch("/api/podcast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Buatkan podcast dari document ini",
                fileName: chatData?.fileName,
                chatId: id,
            })
        })
        
        
        await response.json()
        // setScript(res.script)
        await refetch()
    } catch (error) {
        console.log(error)
    } finally {
        setIsGenerating(false)
    }
    }

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/chat/${id}`, {
                method: "DELETE",
            })
            return await res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['chats', id] })
            router.push("/dashboard")
        },
        onError: () => {
            console.log("error deleting chats")
        }
    })

    const deleteAudio = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/podcast/${id}`, {
                method: "DELETE",
            })
            return await res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['podcast', id] })
            router.push(`/dashboard/chat/${id}`)
        },
        onError: () => {
            console.log("error deleting chats");
        }
    })

    type Mode = "PODCAST" | "INTERACTION"

    const [mode, setMode] = useState<Mode>("PODCAST")
    const [savedTime, setSavedTime] = useState(0)
    const audioRef = useRef<HTMLAudioElement>(null)

    const toggleVisibility = () => {
        const nextVisible = !isVisible
        setIsVisible(nextVisible)

        if (nextVisible) {
            // masuk mode interaction

            const current = audioRef.current?.currentTime ?? 0
            setSavedTime(current)

            audioRef.current?.pause()
            setMode("INTERACTION")

        } else {
            // kembali ke mode normal

            if (audioRef.current) {
                audioRef.current.currentTime = savedTime
                audioRef.current.play()
            }
        }
    }



    if (!isHydrated) {
        return null;
    }
    if (isError) return <div>Error</div>
  return (
    <>
      <ResizablePanel defaultSize={50} minSize={30} className='h-screen'>
        {
            isLoading? (
            <p>Loading...</p>
            ) : (
            <div className='h-screen'>
                <div className='flex flex-row px-4 py-2 items-center relative'>
                    <p>{chatData?.fileName}</p>
                    <div className='absolute right-0 mx-3'>
                        <Button disabled={mutation.isPending} onClick={()=>mutation.mutate()} size={'icon'} variant={"destructive"} className='cursor-pointer'>
                            {mutation.isPending?<Loader className='animate-spin' />:<Trash />}
                        </Button>
                        <Button 
                            onClick={generate} 
                            disabled={isGenerating}
                            className="cursor-pointer ml-3"
                        >
                            {isGenerating && <Loader className="h-4 animate-spin" />}
                            {isGenerating ? "Generating..." : <Mic />}
                        </Button>
                    </div>
                </div>
                <iframe src={`/file/${chatData?.fileName}#view=FitH`} className='w-full h-full' />
            </div>
            )
        }
      </ResizablePanel>
      <div>
        <ResizableHandle withHandle className='bg-[#22262b] w-1 h-full' />
        <div>
            <GripVertical className='w-3 h-3 text-fuchsia-500' />
        </div>
      </div>
      <ResizablePanel defaultSize={30} minSize={20}>
        
        
        <div className='w-full h-full overflow-auto p-4 whitespace-pre-wrap'>
            {isGenerating ? (
                <div className="flex items-center gap-2 text-gray-500">
                    <Loader className="animate-spin w-4 h-4" />
                    Generating podcast script...
                </div>
            ) : (
                <div className='flex items-end justify-between gap-3 h-full relative'>
                    <div className='flex flex-col w-full'>
                        {isVisible && (
                            <div className='absolute top-0'>
                                {podcastData?.map((podcast: any) => (
                                    podcast?.audioUrl ? (
                                        <div key={podcast.id}>
                                            <AudioWavePlayer src={podcast.audioUrl} />
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        )}
                        <div className='text-center my-2'>
                            <Button onClick={toggleVisibility} size={'icon'} className='cursor-pointer px-10'>
                                {isVisible ?<p>STOP</p> :<p>JOIN</p>}
                            </Button>
                        </div>
                        <div className='flex items-center justify-between'>
                            {podcastData?.map((podcast: any) => (
                                <div key={podcast.id}>
                                    <audio ref={audioRef} controls>
                                    <source src={podcast.audioUrl} type="audio/wav" />
                                    </audio>
                                </div>
                            ))}
                            <Button disabled={deleteAudio.isPending} onClick={()=>deleteAudio.mutate()} size={'icon'} variant={"destructive"} className='cursor-pointer'>
                                {deleteAudio.isPending?<Loader className='animate-spin' />:<Trash />}
                            </Button>
                        </div>
                    </div>
                {/* {script} */}
                </div>
            )}
        </div>
      </ResizablePanel>
    </>
  )
}

export default DetailChat
