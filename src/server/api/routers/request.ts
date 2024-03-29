import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { HasRole } from "@utils/user/Auth";

export const requestRouter = createTRPCRouter({
    getAll: protectedProcedure
        .input(z.object({
            userId: z.string().optional(),
            viewAll: z.boolean().default(false),
            statuses: z.array(z.number()).default([0]),

            sort: z.string().default("updatedAt"),
            sortDir: z.string().default("desc"),

            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            // If view all or user ID is set, make sure we have access.
            if (input.viewAll || input.userId) {
                if (!HasRole(ctx.session, "ADMIN") && !HasRole(ctx.session, "MODERATOR")) {
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
                    }),
                    status: {
                        in: input.statuses
                    }
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
            content: z.string().min(10),
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
            content: z.string().min(10).max(32768)
        }))
        .mutation(async ({ ctx, input }) => {
            // Make sure we either own the request or are an admin.
            const isMod = HasRole(ctx.session, "ADMIN") || HasRole(ctx.session, "MODERATOR");

            if (!isMod) {
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
            } else {
                // If we're an admin or moderator, set request to pending.
                try {
                    await ctx.prisma.request.update({
                        data: {
                            status: 1
                        },
                        where: {
                            id: input.requestId
                        }
                    });
                } catch (err) {
                    console.error(`Error setting request #${input.requestId.toString()} to pending.`);
                    console.error(err);
                }
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
    setStatus: protectedProcedure
        .input(z.object({
            id: z.number(),
            status: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            let authed = HasRole(ctx.session, "ADMIN") || HasRole(ctx.session, "MODERATOR");

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
                        status: input.status
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
    setAccept: adminProcedure
        .input(z.object({
            requestId: z.number(),
            accepted: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.request.update({
                    data: {
                        accepted: input.accepted 
                    },
                    where: {
                        id: input.requestId
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to accept/deny request (#${input.requestId.toString()}). Error => ${typeof err == "string" ? err : "Check console"}.`
                });
            }
        }),
    delReply: protectedProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            let authed = HasRole(ctx.session, "ADMIN") || HasRole(ctx.session, "MODERATOR");

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
