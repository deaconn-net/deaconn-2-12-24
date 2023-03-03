import { modProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const blogRouter = createTRPCRouter({
    get: publicProcedure
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
            selViews: z.boolean().default(true),

            incComments: z.boolean().default(false)
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.article.findFirst({
                select: {
                    id: input.selId,
                    url: input.selUrl,
                    createdAt: input.selDates,
                    updatedAt: input.selDates,
                    user: input.selUser,
                    title: input.selTitle,
                    desc: input.selDesc,
                    content: input.selContent,
                    views: input.selViews,
                    
                    articleComments: input.incComments
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
    add: modProcedure
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
