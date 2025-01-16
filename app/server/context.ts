import { getAuth } from '@clerk/nextjs/server'
import * as trpc from '@trpc/server'
import { NextApiRequest } from 'next'

export const createContext = ({ req }: { req: NextApiRequest }) => {
  return { auth: getAuth(req) }
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>
