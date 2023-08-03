import { createTRPCRouter } from "~/server/api/trpc";

import { adminRouter } from "./routers/admin";
import { blogRouter } from "./routers/blog";
import { partnerRouter } from "./routers/partner";
import { requestRouter } from "./routers/request";
import { serviceRouter } from "./routers/service";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    admin: adminRouter,
    blog: blogRouter,
    request: requestRouter,
    service: serviceRouter,
    user: userRouter,
    partner: partnerRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
