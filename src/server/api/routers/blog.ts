import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const blogRouter = createTRPCRouter({
    getArticle: publicProcedure
        .input(z.object({
            id: z.number().nullable(),
            url: z.string().nullable(),

            selId: z.boolean().default(true),
            selUrl: z.boolean().default(true),
            selDates: z.boolean().default(true),
            selUser: z.boolean().default(true),
            selTitle: z.boolean().default(true),
            selDesc: z.boolean().default(true),
            selContent: z.boolean().default(true),
            selViews: z.boolean().default(true)
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.article.findFirst({
                select: {
                    ...(input.selId && {
                        id: true
                    }),
                    ...(input.selUrl && {
                        url: true
                    }),
                    ...(input.selDates && {
                        createdAt: true,
                        updatedAt: true
                    }),
                    ...(input.selUser && {
                        user: true
                    }),
                    ...(input.selTitle && {
                        title: true
                    }),
                    ...(input.selDesc && {
                        desc: true
                    }),
                    ...(input.selContent && {
                        content: true
                    }),
                    ...(input.selViews && {
                        views: true
                    })
                },
                where: {
                    ...(input.id && {
                        id: input.id
                    }),
                    ...(input.url && {
                        url: input.url
                    })
                }
            });
        }),
    addArticle: modProcedure
        .input(z.object({
            id: z.number().nullable(),
            url: z.string(),

            createdAt: z.date().nullable(),
            updatedAt: z.date().nullable(),

            hasUser: z.boolean().default(true),

            title: z.string(),
            desc: z.string().nullable(),
            content: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.article.upsert({
                where: {
                    id: input.id ?? 0
                },
                create: {
                    url: input.url,
                    ...(input.createdAt && {
                        createdAt: input.createdAt
                    }),
                    ...(input.updatedAt && {
                        updatedAt: input.updatedAt
                    }),
                    ...(input.hasUser && {
                        userId: ctx.session.user.id
                    }),
                    title: input.title,
                    ...(input.desc && {
                        desc: input.desc
                    }),
                    content: input.content
                },
                update: {
                    url: input.url,
                    ...(input.createdAt && {
                        createdAt: input.createdAt
                    }),
                    ...(input.updatedAt && {
                        updatedAt: input.updatedAt
                    }),
                    ...(input.hasUser && {
                        userId: ctx.session.user.id
                    }),
                    title: input.title,
                    ...(input.desc && {
                        desc: input.desc
                    }),
                    content: input.content 
                }
            });

            if (!res)
                throw new TRPCError({ code: "BAD_REQUEST" });
        })

});
