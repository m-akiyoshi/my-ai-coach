import { router } from '../trpc'
import { journalRouter } from './journal'
import { messagesRouter } from './messages'

export const appRouter = router({
  messages: messagesRouter,
  journal: journalRouter,
})

export type AppRouter = typeof appRouter
