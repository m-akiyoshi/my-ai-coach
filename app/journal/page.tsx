'use client'
import { useRouter } from 'next/navigation'

import { JournalEntry } from '@prisma/client'
import { useState } from 'react'
import { trpc } from '../utils/trpc'

const emotions = ['Happy', 'Excited', 'Anxious', 'Tired', 'Overwhelmed', 'Irritated', 'Motivated', 'Sad']

export default function JournalEntry() {
  const [text, setText] = useState('')
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const utils = trpc.useContext()
  const router = useRouter()
  const { data: journalEntries } = trpc.journal.getJournalEntries.useQuery()

  const createJournalEntry = trpc.journal.createJournalEntry.useMutation({
    onSuccess: (data) => {
      utils.journal.getJournalEntries.invalidate()
      setText('')
      setSelectedEmotions([])
      router.push(`/journal/${data.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || selectedEmotions.length === 0) return
    createJournalEntry.mutate({ text, emotion: selectedEmotions.join(', ') })
  }

  const toggleEmotion = (emo: string) => {
    setSelectedEmotions((prev) => (prev.includes(emo) ? prev.filter((e) => e !== emo) : [...prev, emo]))
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-[#FFE7E7] rounded-lg font-quicksand flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-bold mb-4 text-heading">Tell me what happened today and how you feel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full p-3 border rounded-md bg-white text-gray-700"
            placeholder="Today was a tough day, I felt..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
          />
          <div className="grid grid-cols-4 gap-2">
            {emotions.map((emo) => (
              <button
                key={emo}
                type="button"
                className={`p-2 border rounded-md text-heading bg-white font-semibold ${selectedEmotions.includes(emo) ? 'border-[#FFB29F] border-2' : 'border-gray-300 border'}`}
                onClick={() => toggleEmotion(emo)}
              >
                {emo}
              </button>
            ))}
          </div>
          <button type="submit" className="bg-[#FF7A59] text-white px-4 py-2 font-bold rounded-md hover:bg-orange-600">
            Let&apos;s chat
          </button>
        </form>
      </div>
      <div className="max-w-xl mx-auto bg-[#FFE7E7] rounded-lg font-quicksand flex flex-col gap-6">
        <h2 className="text-lg font-bold mb-4 text-heading">Your Journal Entries</h2>
        {journalEntries?.map((entry: JournalEntry) => (
          <div
            key={entry.id}
            className="p-4 bg-white border rounded-md cursor-pointer hover:bg-gray-100"
            onClick={() => router.push(`/journal/${entry.id}`)}
          >
            <p className="text-sm text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-700 mt-2">{entry.content.slice(0, 200)}...</p>
          </div>
        ))}
      </div>
    </div>
  )
}
