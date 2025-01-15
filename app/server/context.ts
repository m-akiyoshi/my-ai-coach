import { getAuth } from "@clerk/nextjs/server";
import * as trpc from "@trpc/server";

export const createContext = ({ req }: { req: any }) => {
  return { auth: getAuth(req) };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
