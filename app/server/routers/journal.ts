import { z } from 'zod'
import { getOpenAIResponse } from '../api/openai'
import { prisma } from '../db'
import { protectedProcedure, router } from '../trpc'

const JOURNAL_ENTRY_CONTEXT =
  'You are a supportive AI that provides affirmations and encouragement based on journal entries. Please make sure your response is short and concise. You can also make a suggestion to the user to improve their mood. At the end of the chat, ask user if they want to chat more about specific topics that user talked about. Because you want to act like a life coach, focus more on the emotional side, not tactical such as solving the programming problem they have etc.'

export const journalRouter = router({
  createJournalEntry: protectedProcedure
    .input(z.object({ text: z.string(), emotion: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const history = await prisma.journalEntry.findMany({
        where: {
          userId: ctx.auth.userId,
        },
      })

      console.log(history)

      const aiResponse = await getOpenAIResponse({
        content: `Journal entry: ${input.text} \nEmotion: ${input.emotion}`,
        history,
        context: JOURNAL_ENTRY_CONTEXT,
      })

      console.log(aiResponse)

      const responseText = aiResponse.content || "You're doing great! Let me know if you need to talk about something."

      const journalEntry = await prisma.journalEntry.create({
        data: {
          content: input.text,
          userId: ctx.auth.userId,
        },
      })

      await prisma.chatMessage.create({
        data: {
          content: responseText,
          journalEntryId: journalEntry.id,
          isChatbot: true,
        },
      })
      return journalEntry
    }),

  getJournalEntries: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.journalEntry.findMany({
      where: {
        userId: ctx.auth.userId,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),
  getChatThread: protectedProcedure.input(z.object({ journalEntryId: z.string() })).query(async ({ input }) => {
    return await prisma.chatMessage.findMany({
      where: { journalEntryId: input.journalEntryId },
      orderBy: { createdAt: 'asc' },
    })
  }),

  sendMessage: protectedProcedure
    .input(z.object({ journalEntryId: z.string(), text: z.string() }))
    .mutation(async ({ input }) => {
      const journalEntry = await prisma.journalEntry.findUnique({
        where: {
          id: input.journalEntryId,
        },
      })

      const chatMessages = await prisma.chatMessage.findMany({
        where: {
          journalEntryId: input.journalEntryId,
        },
      })

      const history = chatMessages.map((message) => ({
        content: message.content,
        role: message.isChatbot ? 'assistant' : 'user',
      }))

      const chatHistory = [...history, { content: journalEntry.content, role: 'user' }]

      // Generate AI reply
      const aiResponse = await getOpenAIResponse({
        content: input.text,
        history: chatHistory,
        context: JOURNAL_ENTRY_CONTEXT,
      })

      const responseText = aiResponse.content || "I'm here to chat whenever you need!"

      await prisma.chatMessage.createMany({
        data: [
          {
            journalEntryId: input.journalEntryId,
            content: input.text,
            isChatbot: false,
          },
          {
            journalEntryId: input.journalEntryId,
            content: responseText,
            isChatbot: true,
          },
        ],
      })
    }),
})
