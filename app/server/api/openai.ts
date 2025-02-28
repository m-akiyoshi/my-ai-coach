import { Message } from '@prisma/client'
import OpenAI from 'openai'
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { config } from '../config'

const openai = new OpenAI({ apiKey: config.openAiApiKey })

export const getOpenAIResponse = async ({
  content,
  history,
  context,
}: {
  content: string
  history: Message[]
  context: string
}) => {
  const historyMessages: ChatCompletionMessageParam[] = history.map((message) => ({
    role: message.isChatbot ? 'assistant' : 'user',
    content: message.content,
  }))

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      ...historyMessages,
      {
        role: 'system',
        content: context,
      },
      {
        role: 'user',
        content: content,
      },
    ],
  })

  return completion.choices[0].message
}
