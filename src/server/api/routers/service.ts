import { createTRPCRouter, contributorProcedure, publicProcedure, modProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { UploadFile } from "@utils/FileUpload";

export const serviceRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(z.object({
            sort: z.string().default("purchases"),
            sortDir: z.string().default("desc"),

            categories: z.array(z.number()).optional(),

            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.service.findMany({
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
                    category: true
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

            category: z.number().nullable().optional(),
            url: z.string().max(128),
            name: z.string().max(64),
            price: z.number().default(0),
            desc: z.string().optional(),
            install: z.string().optional(),
            features: z.string().optional(),
            content: z.string(),

            gitLink: z.string().max(128).optional(),
            openSource: z.boolean().default(true),

            links: z.array(z.object({
                serviceId: z.number(),
                isDownload: z.boolean().default(false),
                title: z.string().max(64),
                url: z.string().max(128)
            })).optional(),

            icon: z.string().optional(),
            banner: z.string().optional(),

            bannerRemove: z.boolean().default(false),
            iconRemove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const service = await ctx.prisma.service.upsert({
                where: {
                    id: input.id ?? 0,
                },
                create: {
                    categoryId: input.category,
                    url: input.url,
                    name: input.name,
                    price: input.price,
                    desc: input.desc,
                    install: input.install,
                    features: input.features,
                    content: input.content,
                    gitLink: input.gitLink,
                    openSource: input.openSource,

                    links: {
                        create: input.links?.map((link) => ({
                            isDownload: link.isDownload,
                            title: link.title,
                            url: link.url
                        }))
                    }
                },
                update: {
                    lastEdited: new Date(),
                    categoryId: input.category,
                    url: input.url,
                    name: input.name,
                    price: input.price,
                    desc: input.desc,
                    install: input.install,
                    features: input.features,
                    content: input.content,
                    gitLink: input.gitLink,
                    openSource: input.openSource,

                    links: {
                        deleteMany: {
                            serviceId: input.id
                        },
                        create: input.links?.map((link) => ({
                            isDownload: link.isDownload,
                            title: link.title,
                            url: link.url
                        }))
                    },

                    ...(input.bannerRemove && {
                        banner: null
                    }),
                    ...(input.iconRemove && {
                        icon: null
                    })
                }
            });

            if (!service)
                throw new TRPCError({ code: "BAD_REQUEST" });

            // Check for banner or icon.
            if ((input.banner && !input.bannerRemove) || (input.icon && !input.iconRemove)) {
                let banner_path: string | null = null;
                let icon_path: string | null = null;

                if (input.banner) {
                    // We only need to compile path name without file type.
                    const path = `/services/${service.id}_banner`;

                    // Upload file and retrieve full path.
                    const [success, err, full_path] = UploadFile(path, input.banner);

                    if (!success || !full_path) {
                        throw new TRPCError({
                            code: "PARSE_ERROR",
                            message: `Failed to upload banner for service #${service.id.toString()}. Error => ${err ? err : ""}.`
                        });
                    }

                    banner_path = full_path;
                }

                if (input.icon) {
                    // We only need to compile path name without file type.
                    const path = `/services/${service.id}_icon`;

                    // Upload file and retrieve full path.
                    const [success, err, full_path] = UploadFile(path, input.icon);

                    if (!success || !full_path) {
                        throw new TRPCError({
                            code: "PARSE_ERROR",
                            message: `Failed to upload banner for service #${service.id.toString()}. Error => ${err ? err : ""}.`
                        });
                    }

                    icon_path = full_path;
                }

                // Now reupdate.
                const update = await ctx.prisma.service.update({
                    where: {
                        id: service.id
                    },
                    data: {
                        ...(banner_path && {
                            banner: banner_path
                        }),
                        ...(icon_path && {
                            icon: icon_path
                        })
                    }
                });

                if (update.id < 1) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Failed to update service with banner and icon information."
                    });
                }
            }
        }),
    delete: modProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.service.delete({
                where: {
                    id: input.id
                }
            });

            if (!res) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Unable to delete service. Service ID #" + input.id.toString() + " likely not found."
                });
            }
        }),
    incViewCount: publicProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.service.update({
                    data: {
                        totalViews: {
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
                    message: `Failed to increment service view count. Error => ${err}`
                })
            }
        }),
    incDownloads: protectedProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.service.update({
                    data: {
                        totalDownloads: {
                            increment: 1
                        }
                    },
                    where: {
                        id: input.id
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to increment downloads for service ID #${input.id.toString()}`
                });
            }
        })
});
