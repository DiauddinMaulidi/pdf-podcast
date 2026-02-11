"use client"
import { Button } from '@/components/ui/button'
import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GripVertical, Loader, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'

const DetailChat = () => {
    const {id} = useParams()
    const queryClient = useQueryClient()
    const router = useRouter()
    const {data, isLoading, isError} = useQuery({
        queryKey: ["chats", id],
        queryFn: async ():Promise<any> => {
            const res = await fetch(`/api/chat/${id}`)
            return await res.json()
        }
    })

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/chat/${id}`, {
                method: "DELETE",
            })
            return await res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['chats'] })
            router.push("/dashboard")
        },
        onError: () => {
            console.log("error deleting chats")
        }
    })

    if (isError) return <div>Error</div>
  return (
    <>
      <ResizablePanel defaultSize={50} minSize={30} className='h-full'>
        {
            isLoading? (
            <p>Loading...</p>
            ) : (
            <div className='h-full'>
                <div className='flex flex-row justify-between px-4 py-2 items-center'>
                    <p>{data.fileName}</p>
                    <Button disabled={mutation.isPending} onClick={()=>mutation.mutate()} size={'icon'} variant={"destructive"} className='cursor-pointer'>
                        {mutation.isPending?<Loader className='animate-spin' />:<Trash />}
                    </Button>
                </div>
                <iframe src={`/file/${data?.fileName}#view=FitH`} className='w-full h-full' />
            </div>
            )
        }
      </ResizablePanel>
      <div>
        <ResizableHandle withHandle className='bg-amber-500 w-1 h-full' />
        <div>
            <GripVertical className='w-3 h-3 text-fuchsia-500' />
        </div>
      </div>
      <ResizablePanel defaultSize={30} minSize={20}>
        Audio
      </ResizablePanel>
    </>
  )
}

export default DetailChat
