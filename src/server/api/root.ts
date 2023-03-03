import { createTRPCRouter } from "~/server/api/trpc";
import { blogRouter } from "./routers/blog";
import { requestRouter } from "./routers/request";
import { serviceRouter } from "./routers/service";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  blog: blogRouter,
  request: requestRouter,
  service: serviceRouter,
  user: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
