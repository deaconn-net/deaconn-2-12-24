import { createTRPCRouter, publicProcedure, contributorProcedure, modProcedure } from "../trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { UploadFile } from "@utils/FileUpload";
import { HasRole } from "@utils/user/Auth";
import { UserPublicSelect } from "~/types/user/user";

export const blogRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(z.object({
            sort: z.string().default("createdAt"),
            sortDir: z.string().default("desc"),

            categories: z.array(z.number()).optional(),

            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.article.findMany({
                where: {
                    ...(input.categories && {
                        categoryId: {
                            in: input.categories
                        }
                    })
                },
                orderBy: {
                    [input.sort]: input.sortDir
                },
                include: {
                    category: true,
                    user: {
                        select: UserPublicSelect
                    }
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
    add: contributorProcedure
        .input(z.object({
            id: z.number().optional(),

            createdAt: z.date().optional(),
            updatedAt: z.date().optional(),

            userId: z.string().optional(),

            category: z.number().nullable().optional(),
            url: z.string().max(128),
            title: z.string().max(64),
            desc: z.string().optional(),
            content: z.string(),
            banner: z.string().optional(),
            bannerRemove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if we're admin
            const isAdmin = HasRole(ctx.session, "ADMIN");

            let userId = ctx.session.user.id;

            if (isAdmin && input.userId)
                userId = input.userId;

            const article = await ctx.prisma.article.upsert({
                where: {
                    id: input.id ?? 0
                },
                create: {
                    categoryId: input.category,
                    url: input.url,
                    createdAt: input.createdAt,
                    updatedAt: input.updatedAt,
                    userId: userId,
                    title: input.title,
                    desc: input.desc,
                    content: input.content,
                    ...(input.bannerRemove && {
                        banner: null
                    })
                },
                update: {
                    lastEdited: new Date(),
                    categoryId: input.category,
                    url: input.url,
                    createdAt: input.createdAt,
                    updatedAt: input.updatedAt,
                    ...(isAdmin && input.userId && {
                        userId: userId
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
                const [success, err, full_path] = UploadFile(path, input.banner);

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
    delete: modProcedure
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
        }),
    incViewCount: publicProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.article.update({
                    data: {
                        views: {
                            increment: 1
                        }
                    },
                    where: {
                        id: input.id
                    }
                })
            } catch (err: unknown) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to increment article view count. Error => ${err}`
                })
            }
        })
});
