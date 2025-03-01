import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { getOpenAIResponse } from '../api/openai'
import { prisma } from '../db'
import { protectedProcedure, router } from '../trpc'

const JOURNAL_ENTRY_CONTEXT =
  'You are a supportive AI that provides affirmations and encouragement based on journal entries. Please make sure your response is short and concise. You can also make a suggestion to the user to improve their mood. At the end of the chat, ask user if they want to chat more about specific topics that user talked about. Because you want to act like a life coach, focus more on the emotional side, not tactical such as solving the programming problem they have etc.'

export const journalRouter = router({
  createJournalEntry: protectedProcedure
    .input(z.object({ content: z.string(), emotion: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const history = await prisma.journalEntry.findMany({
        where: {
          userId: ctx.auth.userId,
        },
      })

      const historyMessages: ChatCompletionMessageParam[] = history.map((message) => ({
        role: message.isChatbot ? 'assistant' : 'user',
        content: message.content,
      }))

      const aiResponse = await getOpenAIResponse({
        content: `Journal entry: ${input.content} \nEmotion: ${input.emotion}`,
        history: historyMessages,
        context: JOURNAL_ENTRY_CONTEXT,
      })

      const responseText = aiResponse.content || "You're doing great! Let me know if you need to talk about something."

      const journalEntry = await prisma.journalEntry.create({
        data: {
          content: input.content,
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
    .input(z.object({ journalEntryId: z.string(), content: z.string() }))
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

      if (!journalEntry || !chatMessages) {
        throw new Error('Journal entry or chat messages not found')
      }

      const history = chatMessages.map((message) => ({
        content: message.content,
        role: message.isChatbot ? ('assistant' as const) : ('user' as const),
      }))

      const chatHistory = [{ content: journalEntry?.content, role: 'user' as const }, ...history]

      const aiResponse = await getOpenAIResponse({
        content: input.content,
        history: chatHistory,
        context: JOURNAL_ENTRY_CONTEXT,
      })

      const responseText = aiResponse.content || "I'm here to chat whenever you need!"

      await prisma.chatMessage.createMany({
        data: [
          {
            journalEntryId: input.journalEntryId,
            content: input.content,
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
