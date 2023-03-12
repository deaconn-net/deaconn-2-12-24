import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const requestRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({
            id: z.number().nullable(),

            selId: z.boolean().default(true),
            selDates: z.boolean().default(true),
            selUser: z.boolean().default(true),
            selTitle: z.boolean().default(true),
            selService: z.boolean().default(true),
            selTimeframe: z.boolean().default(true),
            selContent: z.boolean().default(true),
            selstartDate: z.boolean().default(true),
            selPrice: z.boolean().default(true),

            incComments: z.boolean().default(false)
        }))
        .query(({ ctx, input }) => {
            if (!input.id)
                return null;
                
            return ctx.prisma.request.findFirst({
                select: {
                    id: input.selId,
                    createdAt: input.selDates,
                    updatedAt: input.selDates,
                    user: input.selUser,
                    title: input.selTitle,
                    service: input.selService,
                    timeframe: input.selTimeframe,
                    content: input.selContent,
                    startDate: input.selstartDate,
                    price: input.selPrice,

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

            skip: z.number().default(0),
            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.request.findMany({
                skip: input.skip,
                take: input.limit + 1,
                cursor: (input.cursor) ? { id: input.cursor } : undefined,
                orderBy: {
                    [input.sort]: input.sortDir
                },
                where: {
                    ...(input.userId && {
                        userId: input.userId
                    })
                }
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
            id: z.number().nullable().default(null),

            userId: z.string().nullable().default(null),
            serviceId: z.number().nullable().default(null),

            title: z.string().nullable().default(null),
            timeframe: z.number(),
            content: z.string(),
            startDate: z.date().nullable().default(null),
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
        .mutation(async ({ ctx, input}) => {
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
