'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Message } from '@prisma/client'
import { useState } from 'react'
import { trpc } from '../../utils/trpc'

const ChatMessage = (msg: Message) => {
  return (
    <div
      key={msg.id}
      className={cn(
        'flex flex-col max-w-75 p-2 rounded-md',
        msg.isChatbot ? 'align-self-end bg-primary-500 text-white' : 'align-self-start bg-primary-100 text-black'
      )}
    >
      <strong className="font-bold text-sm">{msg.isChatbot ? 'Steph' : 'You'}</strong>
      <span style={{ wordWrap: 'break-word' }}>{msg.content}</span>
    </div>
  )
}

const Chat = () => {
  const utils = trpc.useUtils()
  const { data: messages, isLoading } = trpc.messages.getAll.useQuery()
  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      utils.messages.getAll.invalidate()
      setInput('')
    },
  })
  const [input, setInput] = useState('')

  const sendMessage = async () => {
    if (!input.trim()) return

    await sendMessageMutation.mutateAsync({
      content: input,
    })
  }

  if (isLoading) return <div>Loading messages...</div>
  return (
    <div className="mx-auto border rounded-md">
      <ScrollArea>
        <div className="flex flex-col gap-2 p-2">
          {messages?.map((msg: Message) => <ChatMessage key={msg.id} {...msg} />)}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2 p-2 border-t mt-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          tabIndex={1}
        />

        <Button
          onClick={sendMessage}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
          tabIndex={2}
        >
          Send
        </Button>
      </div>
    </div>
  )
}

export default Chat
