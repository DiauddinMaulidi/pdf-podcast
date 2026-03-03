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
    },
    placeholderData: [],
  })

  // console.log(data)

  return (
    <>
      <ResizablePanel defaultSize={15} minSize={12} className='py-3 pl-3 bg-gray-300 dark:bg-[#15161a]'>
        <div className='h-screen bg-purple-800 flex flex-col items-center rounded-lg px-2 pt-3'>
          <p className='dark:text-white text-amber-500 font-bold'>SUMBER</p>
            <div className='w-full h-full overflow-y-auto py-4 flex-1'>
              {isLoading?(Array.from({length: 1}).map((_, i) => (
                <p key={i}>Loading...</p>
              ))): (
                <div className='w-full flex flex-col gap-2'>
                  {data?.map((chat: any) => (
                  <Link 
                    key={chat.id}
                    href={`/dashboard/chat/${chat.id}`}
                    className='w-full truncate p-2 bg-gray-300 dark:bg-[#2c2c33] dark:text-white text-amber-500 rounded-lg hover:bg-fuchsia-400'>
                      {chat.originalName}
                  </Link>
                ))}
                </div>
              )}
            </div>
        </div>
      </ResizablePanel>

      <div className='py-3'>
        <ResizableHandle withHandle className='bg-transparent h-screen' />
      </div>
    </>
  )
}

export default ChatSidebar
