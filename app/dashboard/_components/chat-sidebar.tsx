"use client"

import { Button } from '@/components/ui/button'
import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const ChatSidebar = () => {
  const {data, isLoading} = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const res = await fetch("/api/chat")
      return await res.json()
    }
  })
  return (
    <>
      <ResizablePanel defaultSize={15} minSize={12}>
        <div className='h-full bg-amber-500 flex flex-col items-center px-2 pt-3'>
            <div>
                <Link href="/dashboard">
                    <Button>
                        <ArrowLeft />
                        Upload PDF
                    </Button>
                </Link>
            </div>
            <div className='w-full h-full overflow-y-auto py-4 flex-1'>
              {isLoading?(Array.from({length: 1}).map((_, i) => (
                <p key={i}>Loading...</p>
              ))): (
                <div className='w-full flex flex-col gap-2'>
                  {data?.map((chat: any) => (
                  <Link 
                    key={chat.id}
                    href={`/dashboard/chat/${chat.id}`}
                    className='w-full truncate p-2 bg-fuchsia-600 rounded-lg hover:bg-fuchsia-400'>
                      {chat.fileName}
                  </Link>
                ))}
                </div>
              )}
            </div>
        </div>
      </ResizablePanel>

      <div>
        <ResizableHandle withHandle className='bg-amber-500 w-1 h-full' />
      </div>

    </>
  )
}

export default ChatSidebar
