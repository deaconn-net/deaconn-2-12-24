import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const requestRouter = createTRPCRouter({
    getRequest: protectedProcedure
        .input(z.object({
            id: z.number()
        }))
        .query(async ({ ctx, input }) => {
            
        })
});
