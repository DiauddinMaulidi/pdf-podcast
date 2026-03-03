"use client"

import { Button } from '@/components/ui/button'
import { ResizablePanel } from '@/components/ui/resizable'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader, Trash, Volume2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import ChatSidebar from '../../_components/chat-sidebar'
import ChatContainer from '../_components/chat-container'
import { toast } from 'sonner'

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
            return await res.json()
        }
    })

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
        toast.info("Berhasil membuat audio")
        await refetch()
    } catch (error) {
        toast.error("Gagal membuat audio")
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
            toast.success("chats ini berhasil di hapus")
            router.push("/dashboard")
          },
          onError: () => {
            toast.error("gagal menghapus chat")
            router.push("/dashboard")
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
            toast.success("Audio ini berhasil di hapus")
            router.push(`/dashboard/chat/${id}`)
          },
          onError: () => {
            toast.error("gagal menghapus audio")
            router.push(`/dashboard/chat/${id}`)
        }
    })

    const audioRef = useRef<HTMLAudioElement>(null)

    if (!isHydrated) {
        return null;
    }
    if (isError) return <div>Error</div>
  return (
    <>
    <ChatSidebar />
    <ResizablePanel defaultSize={50} minSize={30} className='p-3 bg-gray-300 dark:bg-[#15161a] flex flex-col'>
      { isLoading
        ? ( <p>Loading...</p> )
        : (
          <div className='rounded-lg py-3 bg-gray-200 dark:bg-[#2c2c33] flex flex-col h-screen'>
            <div className='flex px-4 py-2 items-center relative shrink-0'>
              <p>{chatData?.originalName}</p>
              <div className='absolute right-0 mx-3'>
                <Button disabled={mutation.isPending} onClick={()=>mutation.mutate()} size={'icon'} variant={"destructive"} className='cursor-pointer'>
                  {mutation.isPending?<Loader className='animate-spin' />:<Trash />}
                </Button>
                <Button onClick={generate} disabled={isGenerating} className="cursor-pointer ml-3" >
                  {isGenerating ? <Loader className="h-4 animate-spin" /> :<Volume2 />}
                  {/* {isGenerating} */}
                </Button>
              </div>
            </div>
            <div className='flex-1 min-h-0'>
              <iframe src={`/file/${chatData?.fileName}#view=FitH`} className='w-full h-full' />
            </div>
          </div> ) }
      </ResizablePanel>
      <ResizablePanel defaultSize={30} minSize={20}>
        <div className='w-full h-screen flex flex-col bg-gray-300 dark:bg-[#15161a]'>
          <div className="flex-1 min-h-0">
            <div className="h-full overflow-y-auto whitespace-pre-wrap py-2">
              <ChatContainer fileName={podcastData?.fileName as string} chatId={parseInt(id)} />
            </div>
          </div>
          <div className='shrink-0'>
            <div className='flex items-center px-3 pb-2 justify-between'>
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
        </div>
    </ResizablePanel>
    </>
)
}

export default DetailChat
