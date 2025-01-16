import { getAuth } from '@clerk/nextjs/server'
import * as trpc from '@trpc/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createContext = ({ req }: { req: any }) => {
  return { auth: getAuth(req) }
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>
