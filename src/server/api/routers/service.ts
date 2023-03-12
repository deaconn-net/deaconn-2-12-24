import { createTRPCRouter, modProcedure, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import FileType from "~/utils/base64";

import fs from 'fs';

export const serviceRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({
            id: z.number().nullable(),
            url: z.string().nullable(),

            selId: z.boolean().default(true),
            selUrl: z.boolean().default(true),
            selDates: z.boolean().default(true),
            selName: z.boolean().default(true),
            selPrice: z.boolean().default(true),
            selDesc: z.boolean().default(true),
            selInstall: z.boolean().default(true),
            selFeatures: z.boolean().default(true),
            selContent: z.boolean().default(true),
            selViews: z.boolean().default(true),
            selPurchases: z.boolean().default(true),
            selDownloads: z.boolean().default(true),
            selIcon: z.boolean().default(true),
            selBanner: z.boolean().default(true),
            selGitLink: z.boolean().default(true),
            selOpenSource: z.boolean().default(true),

            incRequests: z.boolean().default(false)
        }))
        .query(({ ctx, input }) => {
            if (!input.id && !input.url)
                return null;

            return ctx.prisma.service.findFirst({
                select: {
                    id: input.selId,
                    createdAt: input.selDates,
                    updatedAt: input.selDates,
                    url: input.selUrl,
                    name: input.selName,
                    price: input.selPrice,
                    desc: input.selDesc,
                    install: input.selInstall,
                    features: input.selFeatures,
                    content: input.selContent,
                    views: input.selViews,
                    purchases: input.selPurchases,
                    downloads: input.selDownloads,
                    icon: input.selIcon,
                    banner: input.selBanner,
                    gitLink: input.selGitLink,
                    openSource: input.selOpenSource,

                    requests: input.incRequests
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
            sort: z.string().default("purchases"),
            sortDir: z.string().default("desc"),

            skip: z.number().default(0),
            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.service.findMany({
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
            name: z.string(),
            price: z.number().default(0),
            desc: z.string().nullable().default(null),
            install: z.string().nullable().default(null),
            features: z.string().nullable().default(null),
            content: z.string(),
            icon: z.string().nullable().default(null),
            banner: z.string().nullable().default(null),
            gitLink: z.string().nullable().default(null),
            openSource: z.boolean().default(true),

            bannerRemove: z.boolean().default(false),
            iconRemove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const service = await ctx.prisma.service.upsert({
                where: {
                    id: input.id ?? 0
                },
                create: {
                    url: input.url,
                    name: input.name,
                    price: input.price,
                    ...(input.desc && {
                        desc: input.desc
                    }),
                    ...(input.install && {
                        install: input.install
                    }),
                    ...(input.features && {
                        features: input.features
                    }),
                    content: input.content,
                    ...(input.gitLink && {
                        gitLink: input.gitLink
                    }),
                    openSource: input.openSource
                },
                update: {
                    url: input.url,
                    name: input.name,
                    price: input.price,
                    ...(input.desc && {
                        desc: input.desc
                    }),
                    ...(input.install && {
                        install: input.install
                    }),
                    ...(input.features && {
                        features: input.features
                    }),
                    content: input.content,
                    ...(input.gitLink && {
                        gitLink: input.gitLink
                    }),
                    openSource: input.openSource,
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
                let bannerPath: string | null = null;
                let iconPath: string | null = null;

                if (input.banner) {
                    const fileType = FileType(input.banner);

                    // Make sure we have a valid image file.
                    if (fileType == "unknown") {
                        throw new TRPCError({
                            code: "PARSE_ERROR",
                            message: "Service banner not a valid image file (ID #" + service.id + ")."
                        });
                    }

                    // Compile file name.
                    bannerPath = "/services/" + service.id + "_banner." + fileType;

                    // Convert Base64 content.
                    const buffer = Buffer.from(input.banner, 'base64');

                    // Attempt to upload file.
                    try {
                        fs.writeFileSync((process.env.UPLOADS_DIR ?? "/uploads") + bannerPath, buffer);
                    } catch (error) {
                        console.error(error);

                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Service banner failed to upload (ID #" + service.id + ")."
                        });
                    }
                }

                if (input.icon) {
                    const fileType = FileType(input.icon);

                    // Make sure we have a valid image file.
                    if (fileType == "unknown") {
                        throw new TRPCError({
                            code: "PARSE_ERROR",
                            message: "Service icon not a valid image file (ID #" + service.id + ")."
                        });
                    }

                    // Compile file name.
                    iconPath = "/services/" + service.id + "_icon." + fileType;

                    // Convert Base64 content.
                    const buffer = Buffer.from(input.icon, 'base64');

                    // Attempt to upload file.
                    try {
                        fs.writeFileSync((process.env.UPLOADS_DIR ?? "/uploads") + iconPath, buffer);
                    } catch (error) {
                        console.error(error);

                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Service icon failed to upload (ID #" + service.id + ")."
                        });
                    }
                }

                // Now reupdate.
                const update = await ctx.prisma.service.update({
                    where: {
                        id: service.id
                    },
                    data: {
                        ...(bannerPath && {
                            banner: bannerPath
                        }),
                        ...(iconPath && {
                            icon: iconPath
                        })
                    }
                });

                if (update.id < 1) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Failed to update article with banner and icon information."
                    });
                }
            }
        }),
    delete: protectedProcedure
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
                    message: "Unable to delete service. Service ID #" + input.id + " likely not found."
                });
            }
        })
});
