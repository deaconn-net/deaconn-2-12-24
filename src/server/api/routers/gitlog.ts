import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

import { UserPublicSelect } from "~/types/user/user";

import z from "zod";

export const gitLogRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(z.object({
            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query( async ({ ctx, input }) => {
            const items = await ctx.prisma.gitLog.findMany({
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    user: {
                        select: UserPublicSelect
                    }
                },
                
                take: input.limit + 1,
                cursor: (input.cursor) ? { id: input.cursor } : undefined
            });

            let nextCur: typeof input.cursor | undefined = undefined;

            if (items.length > input.limit) {
                const nextItem = items.pop();
                nextCur = nextItem?.id;
            }

            return {
                items,
                nextCur
            };
        }),
    del: adminProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation (async ({ ctx, input }) => {
            try {
                await ctx.prisma.gitLog.delete({
                    where: {
                        id: input.id
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Error deleting git log. Error => ${typeof err == "string" ? err : "Check console"}.`
                });
            }
        })
})