import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const requestRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({
            id: z.number().nullable(),

            incComments: z.boolean().default(false)
        }))
        .query(({ ctx, input }) => {
            if (!input.id)
                return null;

            return ctx.prisma.request.findFirst({
                include: {
                    requestComments: input.incComments
                },
                where: {
                    id: input.id
                }
            });
        }),
    getAll: protectedProcedure
        .input(z.object({
            userId: z.string().nullable().default(null),

            sort: z.string().default("updatedAt"),
            sortDir: z.string().default("desc"),

            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.request.findMany({
                include: {
                    service: true
                },
                where: {
                    ...(input.userId && {
                        userId: input.userId
                    })
                },
                orderBy: {
                    [input.sort]: input.sortDir
                },

                take: input.limit + 1,
                cursor: (input.cursor) ? { id: input.cursor } : undefined,
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
    add: protectedProcedure
        .input(z.object({
            id: z.number().optional(),

            userId: z.string().optional(),
            serviceId: z.number().optional(),

            title: z.string().optional(),
            timeframe: z.number(),
            content: z.string(),
            startDate: z.date().optional(),
            price: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.request.upsert({
                where: {
                    id: input.id ?? 0
                },
                create: {
                    userId: input.userId ?? ctx.session.user.id,
                    ...(input.serviceId && {
                        serviceId: input.serviceId
                    }),
                    ...(input.title && {
                        title: input.title
                    }),
                    timeframe: input.timeframe,
                    content: input.content,
                    startDate: input.startDate,
                    price: input.price
                },
                update: {
                    userId: input.userId ?? ctx.session.user.id,
                    ...(input.serviceId && {
                        serviceId: input.serviceId
                    }),
                    ...(input.title && {
                        title: input.title
                    }),
                    timeframe: input.timeframe,
                    content: input.content,
                    startDate: input.startDate,
                    price: input.price
                }
            });

            if (!res)
                throw new TRPCError({ code: "BAD_REQUEST" });
        }),
    addComment: protectedProcedure
        .input(z.object({
            id: z.number().nullable(),

            requestId: z.number(),
            content: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            // Make sure we either own the request or are 
            const res = await ctx.prisma.requestComment.upsert({
                where: {
                    id: input.id ?? 0
                },
                create: {
                    requestId: input.requestId,
                    userId: ctx.session.user.id,
                    content: input.content
                },
                update: {
                    content: input.content
                }
            });
        }),
    close: protectedProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.request.update({
                data: {
                    closed: true
                },
                where: {
                    id: input.id
                }
            });

            if (!res.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Unable to close request #" + input.id
                })
            }
        })
});
