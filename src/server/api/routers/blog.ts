import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { upload_file } from "@utils/file_upload";

export const blogRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(z.object({
            sort: z.string().default("createdAt"),
            sortDir: z.string().default("desc"),

            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.article.findMany({
                orderBy: {
                    [input.sort]: input.sortDir
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
    add: protectedProcedure
        .input(z.object({
            id: z.number().optional(),

            createdAt: z.date().optional(),
            updatedAt: z.date().optional(),

            hasUser: z.boolean().default(true),

            category: z.number().nullable().optional(),
            url: z.string(),
            title: z.string(),
            desc: z.string().optional(),
            content: z.string(),
            banner: z.string().optional(),
            bannerRemove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const article = await ctx.prisma.article.upsert({
                where: {
                    id: input.id ?? 0
                },
                create: {
                    categoryId: input.category,
                    url: input.url,
                    createdAt: input.createdAt,
                    updatedAt: input.updatedAt,
                    ...(input.hasUser && {
                        userId: ctx.session.user.id
                    }),
                    title: input.title,
                    desc: input.desc,
                    content: input.content,
                    ...(input.bannerRemove && {
                        banner: null
                    })
                },
                update: {
                    categoryId: input.category,
                    url: input.url,
                    createdAt: input.createdAt,
                    updatedAt: input.updatedAt,
                    ...(input.hasUser && {
                        userId: ctx.session.user.id
                    }),
                    title: input.title,
                    desc: input.desc,
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
                // We only need to compile path name without file type.
                const path = `/blog/articles/${article.id}`;

                // Upload file and retrieve full path.
                const [success, err, full_path] = upload_file(path, input.banner);

               if (!success || !full_path) {
                    throw new TRPCError({
                        code: "PARSE_ERROR",
                        message: `Failed to upload banner for article #${article.id.toString()}. Error => ${err ? err : "N/A"}.`
                    });
                }

                // Now reupdate.
                const update = await ctx.prisma.article.update({
                    where: {
                        id: article.id
                    },
                    data: {
                        banner: full_path
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
                    message: "Unable to delete article. Article ID #" + input.id.toString() + " likely not found."
                });
            }
        })
});
