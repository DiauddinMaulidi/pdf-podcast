"use client"

import { Button } from "@/components/ui/button"
import MessageList from "./message-list"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Message, MessageRole } from "@prisma/client"
import Rekam from "@/components/rekam"
import { Send, Trash } from "lucide-react"
import HumbergerMenu from "@/components/humbergerMenu"
import { useRouter } from "next/router"
import { toast } from "sonner"

type Props = {
    fileName: string,
    chatId: number,
}

const ChatContainer = ({fileName, chatId}: Props) => {
  const [message, setMessage] = useState<string>()
  const [selectMode, setSelectMode] = useState(false)
  const [selectIds, setSelectIds] = useState<number[]>([])
  const queryClient = useQueryClient()

  const {data:messages= [], isLoading, error} = useQuery({
    queryKey: ["messages", chatId],
    queryFn: async (): Promise<Message[]> => {
      const res = await fetch(`/api/message/${chatId}`)
      if(!res.ok) {
        toast.error("Failed to fetch messages")
        // throw new Error("Failed to fetch messages")
      }
      return await res.json()
    }
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if(!message) return
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          chatId,
          role: MessageRole.USER,
          fileName,
        })
      })
      if (!res.ok) {
        toast.error("Failed to send message")
        // throw new Error("Failed to send message")
      }
      setMessage("")
      return await res.json()
    },
    onMutate: async () => {
      await queryClient.cancelQueries({queryKey: ["messages", chatId]})
      const previousMessages = queryClient.getQueryData(["messages", chatId])

      queryClient.setQueryData(["messages", chatId], (old: Message[] = []) => [
        ...old,
        {
          id: "optimistic" + Date.now(),
          content: message!,
          role: MessageRole.USER,
          chatId,
          createdAt: new Date(),
        }
      ])
      return {previousMessages}
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({queryKey: ["messages", chatId]})
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", chatId], context.previousMessages)
      }
    }
  })

  const removePesan = useMutation({
    mutationFn: async (ids: Number[]) => {
      const res = await fetch(`/api/message`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      })
      const result = await res.json()
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['messages', chatId] })
      toast.success("Berhasil menghapus chats")
      // router.push(`/dashboard/chat/${chatId}`)
    },
    onError: () => {
      toast.error("Gagal menghapus chats")
    }
  })

  const handleVoiceResult = async (formData: FormData) => {
    formData.append("chatId", chatId.toString())
    formData.append("fileName", fileName)

    await fetch("/api/ask", {
      method: "POST",
      body: formData,
    })

    queryClient.invalidateQueries({
      queryKey: ["messages", chatId],
    })
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="flex flex-col h-full bg-gray-200 dark:bg-[#2c2c33] rounded-xl mr-3">
      <div className="p-3 flex justify-between items-center w-full border-b-2 border-neutral-800 shrink-0">
        <h2 className="font-semibold text-xl">TANYA AI</h2>
        <HumbergerMenu 
          onSelectMode={() => {
            setSelectMode(prev => {
              if (prev) {
                setSelectIds([])
              }
              return !prev
            })
          }}
          onSelectAll={() => {
            setSelectMode(true)
            setSelectIds(messages.map(m => m.id))
          }}/>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <MessageList
          messages={messages}
          isSending={mutation.isPending}
          isLoading={isLoading}
          selectMode={selectMode}
          selectedIds={selectIds}
          setSelectIds={setSelectIds} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 flex items-center gap-2 border-t border-neutral-300 shrink-0">
        <Input value={message} onChange={(e) => setMessage(e.target.value)} className="border-2 border-purple-400" />
        {selectMode ? (
          <Button onClick={() => removePesan.mutate(selectIds)} size={'icon'} variant={"destructive"} className="bg-purple-400">
            <Trash />
          </Button>
        ) : (
         <>
            {message ? (
              <Button type="submit" className="bg-purple-400">
                <Send />
              </Button>
            ) : (
              <Rekam onVoiceResult={handleVoiceResult} />
            )}
          </> 
        )}
      </form>
    </div>
  )
}

export default ChatContainer
