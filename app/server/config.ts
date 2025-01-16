import dotenv from 'dotenv'

// Load the appropriate env file
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development'
dotenv.config({ path: envFile })

export const config = {
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL || '',
}
