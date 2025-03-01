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
  history: ChatCompletionMessageParam[]
  context: string
}) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      ...history,
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
