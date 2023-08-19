import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { has_role } from "@utils/user/auth";
import { prisma } from "@server/db";

export const requestRouter = createTRPCRouter({
    getAll: protectedProcedure
        .input(z.object({
            userId: z.string().optional(),
            viewAll: z.boolean().default(false),

            sort: z.string().default("updatedAt"),
            sortDir: z.string().default("desc"),

            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            // If view all or user ID is set, make sure we have access.
            if (input.viewAll || input.userId) {
                if (!has_role(ctx.session, "admin") && !has_role(ctx.session, "moderator")) {
                    return {
                        items: [],
                        nextCur: undefined
                    };
                }
            }
            
            const items = await ctx.prisma.request.findMany({
                include: {
                    service: true
                },
                where: {
                    ...(!input.viewAll && {
                        userId: input.userId ?? ctx.session.user.id
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
            serviceId: z.number().nullable().optional(),

            title: z.string().max(64).optional(),
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
                    serviceId: input.serviceId,
                    title: input.title,
                    timeframe: input.timeframe,
                    content: input.content,
                    startDate: input.startDate,
                    price: input.price
                },
                update: {
                    userId: input.userId ?? ctx.session.user.id,
                    serviceId: input.serviceId,
                    title: input.title,
                    timeframe: input.timeframe,
                    content: input.content,
                    startDate: input.startDate,
                    price: input.price
                }
            });

            if (!res)
                throw new TRPCError({ code: "BAD_REQUEST" });
        }),
    addReply: protectedProcedure
        .input(z.object({
            id: z.number().optional(),

            requestId: z.number(),
            content: z.string().max(32768)
        }))
        .mutation(async ({ ctx, input }) => {
            // Make sure we either own the request or are an admin.
            let authed = false;

            if (ctx.session && (has_role(ctx.session, "admin") || has_role(ctx.session, "moderator")))
                authed = true;

            if (!authed && ctx.session?.user) {
                try {
                    await ctx.prisma.request.findFirstOrThrow({
                        where: {
                            id: input.requestId,
                            userId: ctx.session.user.id
                        }
                    });
                } catch (err) {
                    throw new TRPCError({ code: "UNAUTHORIZED" });
                }

                // If we got here, it was found!
                authed = true;
            }

            await ctx.prisma.requestReply.upsert({
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
            let authed = false;

            if (has_role(ctx.session, "admin") || has_role(ctx.session, "moderator"))
                authed = true;

            // Do lookup on request to see if we have access.
            if (!authed) {
                const request = await ctx.prisma.request.count({
                    where: {
                        id: input.id,
                        userId: ctx.session.user.id
                    }
                });

                if (request > 0)
                    authed = true;
            }

            // Check if we're authorized.
            if (!authed)
                throw new TRPCError({ code: "UNAUTHORIZED" });

            try {
                await ctx.prisma.request.update({
                    data: {
                        closed: true
                    },
                    where: {
                        id: input.id
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to close request. Error => ${typeof err == "string" ? err : "Check console"}.`
                });
            }
        }),
    delReply: protectedProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            let authed = false;

            if (has_role(ctx.session, "admin") || has_role(ctx.session, "moderator"))
                authed = true;

            // Do lookup on request to see if we have access.
            if (!authed) {
                const reply = await ctx.prisma.requestReply.count({
                    where: {
                        id: input.id,
                        userId: ctx.session.user.id
                    }
                });

                if (reply > 0)
                    authed = true;
            }

            // Check if we're authorized.
            if (!authed)
                throw new TRPCError({ code: "UNAUTHORIZED" });

            try {
                await ctx.prisma.requestReply.delete({
                    where: {
                        id: input.id
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to delete reply. Error => ${typeof err == "string" ? err : "Check console"}.`
                });
            }
        })
});
