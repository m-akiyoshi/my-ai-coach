'use client'

import { trpc } from '@/app/utils/trpc'
import { ChatMessage } from '@prisma/client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ChatPage() {
  const params = useParams()
  const journalEntryId = params?.journalentryid as string
  const [message, setMessage] = useState('')
  const chatMessages = trpc.journal.getChatThread.useQuery({ journalEntryId })
  const router = useRouter()
  const sendMessage = trpc.journal.sendMessage.useMutation({
    onSuccess: () => {
      chatMessages.refetch()
      setMessage('')
    },
  })

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    sendMessage.mutate({ journalEntryId, content: message })
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-[#FFE7E7] rounded-lg font-quicksand flex flex-col gap-4">
      <button
        onClick={() => router.push('/journal')}
        className="text-sm text-gray-600 font-semibold text-left hover:underline mb-4"
      >
        ← Back to Journal Entries
      </button>

      <div className="p-4 rounded-md border flex flex-col gap-3">
        {chatMessages.data?.map((msg: ChatMessage, idx: number) => (
          <div key={idx} className={`p-2 ${msg.isChatbot ? 'self-end' : 'self-start'}`}>
            <p
              className={`whitespace-pre-line font-semibold p-4 rounded-md inline-block text-heading ${msg.isChatbot ? 'text-right bg-[#F0F0F0]' : 'text-left bg-white'}`}
            >
              {msg.content}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded-md text-heading"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-[#FF7A59] text-white px-4 py-2 font-bold rounded-md hover:bg-orange-600">
          Send
        </button>
      </form>
    </div>
  )
}
