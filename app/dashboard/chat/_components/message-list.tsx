import { Message, MessageRole } from "@prisma/client"
import clsx from "clsx"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldLabel } from "@/components/ui/field"

type Props = {
  messages: Message[]
  isSending: boolean
  isLoading: boolean
  selectMode: boolean
  selectedIds: number[]
  setSelectIds: React.Dispatch<React.SetStateAction<number[]>>
}

const MessageList = ({messages, isSending, isLoading, selectMode, selectedIds, setSelectIds}: Props) => {
  return (
    <div className='flex flex-col gap-2 p-4'>
      {isLoading && <p>Loading...</p>}
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx("text-sm p-2 dark:text-black rounded-lg select-text flex", message.role === MessageRole.USER
              ? "self-end bg-purple-300 dark:bg-purple-700 items-center flex-row-reverse"
              : "self-start bg-neutral-300 dark:bg-neutral-400 items-start"
            )}>
            {selectMode && (
              <Checkbox
                checked={selectedIds.includes(message.id)}
                onCheckedChange={(checked) => {
                  if(checked) {
                    setSelectIds(prev => [...prev, message.id])
                  } else {
                    setSelectIds(prev =>
                      prev.filter(id => id !== message.id)
                    )
                  }
                }}
                id={`${message.id}`} name={`${message.role}`}
                className={clsx(message.role === MessageRole.USER
                  ? "ml-2"
                  : "mr-2"
                )} />

            )}
            <FieldLabel htmlFor={`${message.id}`} className="font-normal select-text">
              {message.content}
            </FieldLabel>
          </div>
        ))}
      {isSending && (
        <p className="text-sm p-2 rounded-lg self-start border border-neutral-300">Sending</p>
      )}
    </div>
  )
}

export default MessageList
