import { z } from 'zod'
import { getOpenAIResponse } from '../api/openai'
import { prisma } from '../db'
import { protectedProcedure, router } from '../trpc'

export const messagesRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return prisma.message.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: { createdAt: 'asc' },
    })
  }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { content } = input

      const history = await prisma.message.findMany({
        where: {
          userId: ctx.auth.userId,
        },
      })

      const openaiResponse = await getOpenAIResponse(content, history)

      if (!openaiResponse.content) {
        throw new Error('Failed to get OpenAI response')
      }

      return prisma.message.createMany({
        data: [
          {
            content,
            userId: ctx.auth.userId,
          },
          {
            content: openaiResponse.content,
            isChatbot: true,
            userId: ctx.auth.userId,
          },
        ],
      })
    }),
})
