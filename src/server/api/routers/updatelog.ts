import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

import z from "zod";

export const updateLogRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(z.object({
            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query( async ({ ctx, input }) => {
            const items = await ctx.prisma.updateLog.findMany({
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    user: true
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
        add: adminProcedure
        .input(z.object({
            msg: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.updateLog.create({
                    data: {
                        userId: ctx.session.user.id,
                        msg: input.msg
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Error creating update log. Error => ${typeof err == "string" ? err : "Check console"}.`
                });  
            }
        }),
    update: adminProcedure
        .input(z.object({
            id: z.number(),
            msg: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.updateLog.update({
                    data: {
                        msg: input.msg
                    },
                    where: {
                        id: input.id
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Error updating update log. Error => ${typeof err == "string" ? err : "Check console"}.`
                });  
            }
        }),
    del: adminProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation (async ({ ctx, input }) => {
            try {
                await ctx.prisma.updateLog.delete({
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