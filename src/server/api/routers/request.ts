import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const requestRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({
            id: z.number(),

            selId: z.boolean().default(true),
            selDates: z.boolean().default(true),
            selUser: z.boolean().default(true),
            selService: z.boolean().default(true),
            selTimeframe: z.boolean().default(true),
            selContent: z.boolean().default(true),
            selstartDate: z.boolean().default(true),
            selPrice: z.boolean().default(true),

            incComments: z.boolean().default(false)
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.request.findFirst({
                select: {
                    id: input.selId,
                    createdAt: input.selDates,
                    updatedAt: input.selDates,
                    user: input.selUser,
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
    add: protectedProcedure
        .input(z.object({
            id: z.number().nullable(),

            userId: z.string().nullable(),
            serviceId: z.number().nullable(),

            timeframe: z.number(),
            content: z.string(),
            startDate: z.date().nullable(),
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
                    timeframe: input.timeframe,
                    content: input.content,
                    startDate: input.startDate,
                    price: input.price
                }
            });

            if (!res)
                throw new TRPCError({ code: "BAD_REQUEST" });
        })
});
