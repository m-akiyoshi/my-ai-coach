import OpenAI from "openai";
import { config } from "../config";

const openai = new OpenAI({ apiKey: config.openAiApiKey });

export const getOpenAIResponse = async (content: string) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a life coach chat bot. The user will share their problems with you. You will help them find a solution, but you don't give them an answer, you will ask them questions to help them find a solution, you can make a suggestion too. You will be empathetic and understanding. If you have a good resources (blog post, youtube video, etc), you can share it with the user. Let's not do the bullet points because it overwhelms users, one by one answer is great. Let's also help the user grow their growth mindset rather than fixed mindset.Focus on solving the problem on the emotional side, not tactical such as solving the programming problem they have etc.",
      },
      {
        role: "user",
        content: content,
      },
    ],
  });

  return completion.choices[0].message;
};
