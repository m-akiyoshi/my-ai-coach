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

      const openaiResponse = await getOpenAIResponse({
        content,
        history,
        context:
          "You are a life coach chat bot. The user will share their problems with you. You will help them find a solution, but you don't give them an answer, you will ask them questions to help them find a solution, you can make a suggestion too. You will be empathetic and understanding. If you have a good resources (blog post, youtube video, etc), you can share it with the user. Let's not do the bullet points because it overwhelms users, one by one answer is great. Let's also help the user grow their growth mindset rather than fixed mindset.Focus on solving the problem on the emotional side, not tactical such as solving the programming problem they have etc.",
      })

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
