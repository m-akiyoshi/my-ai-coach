import { router } from "../trpc";
import { messagesRouter } from "./messages";

export const appRouter = router({
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;
