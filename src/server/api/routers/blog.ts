import { modProcedure, createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import FileType from "~/utils/base64";
import fs from 'fs';

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
            if (!input.id && !input.url)
                return null;

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
    getAll: publicProcedure
        .input(z.object({
            sort: z.string().default("createdAt"),
            sortDir: z.string().default("desc"),

            skip: z.number().default(0),
            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.article.findMany({
                skip: input.skip,
                take: input.limit + 1,
                cursor: (input.cursor) ? { id: input.cursor } : undefined,
                orderBy: {
                    [input.sort]: input.sortDir
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
            url: z.string(),

            createdAt: z.date().nullable().default(null),
            updatedAt: z.date().nullable().default(null),

            hasUser: z.boolean().default(true),

            title: z.string(),
            desc: z.string().nullable().default(null),
            content: z.string(),
            banner: z.string().nullable().default(null),
            bannerRemove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const article = await ctx.prisma.article.upsert({
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
                    content: input.content,
                    ...(input.bannerRemove && {
                        banner: null
                    })
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
                    content: input.content,
                    ...(input.bannerRemove && {
                        banner: null
                    })
                }
            });

            if (!article)
                throw new TRPCError({ code: "BAD_REQUEST" });

            // Check for banner.
            if (input.banner && !input.bannerRemove) {
                const fileType = FileType(input.banner);

                // Make sure we have a valid image file.
                if (fileType == "unknown") {
                    throw new TRPCError({
                        code: "PARSE_ERROR",
                        message: "Article banner not a valid image file (ID #" + article.id + ")."
                    });
                }

                // Compile file name.
                const fileName = "/blog/articles/" + article.id + "." + fileType;

                // Convert Base64 content.
                const buffer = Buffer.from(input.banner, 'base64');

                // Attempt to upload file.
                try {
                    fs.writeFileSync((process.env.UPLOADS_DIR ?? "/uploads") + fileName, buffer);
                } catch (error) {
                    console.error(error);

                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Article banner failed to upload (ID #" + article.id + ")."
                    });
                }

                // Now reupdate.
                const update = await ctx.prisma.article.update({
                    where: {
                        id: article.id
                    },
                    data: {
                        banner: fileName
                    }
                });

                if (update.id < 1) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Failed to update article with banner information."
                    });
                }
            }
        }),
    delete: protectedProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.article.delete({
                where: {
                    id: input.id
                }
            });

            if (!res) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Unable to delete article. Article ID #" + input.id + " likely not found."
                });
            }
        })
});
