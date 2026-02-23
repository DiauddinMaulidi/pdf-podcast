"use client"

import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Home } from 'lucide-react'
import Link from 'next/link'

const ChatSidebar = () => {
  const {data = [], isLoading} = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const res = await fetch("/api/chat")
      return await res.json()
    }
  })

  // console.log(data)

  return (
    <>
      <div className='h-screen px-3 bg-[#22262b]'>
        <div className='mt-1 flex flex-col gap-5 text-amber-500 dark:text-white'>
          <Link href="/list">
            <Home />
          </Link>
          
          <Link href="/dashboard">
            <BookOpen />
          </Link>
        </div>
      </div>
      <ResizablePanel defaultSize={15} minSize={12}>
        <div className='h-full bg-purple-800 flex flex-col items-center px-2 pt-3'>
            {/* <div>
                <Link href="/dashboard">
                    <Button>
                        <ArrowLeft />
                        Upload PDF
                    </Button>
                </Link>
            </div> */}
            <div className='w-full h-full overflow-y-auto py-4 flex-1'>
              {isLoading?(Array.from({length: 1}).map((_, i) => (
                <p key={i}>Loading...</p>
              ))): (
                <div className='w-full flex flex-col gap-2'>
                  {data?.map((chat: any) => (
                  <Link 
                    key={chat.id}
                    href={`/dashboard/chat/${chat.id}`}
                    className='w-full truncate p-2 dark:bg-[#22262b] bg-white dark:text-white text-amber-500 rounded-lg hover:bg-fuchsia-400'>
                      {chat.originalName}
                  </Link>
                ))}
                </div>
              )}
            </div>
        </div>
      </ResizablePanel>

      <div>
        <ResizableHandle withHandle className='bg-purple-800 w-1 h-full' />
      </div>

    </>
  )
}

export default ChatSidebar
