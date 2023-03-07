import { createTRPCRouter, modProcedure, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const serviceRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({
            id: z.number().nullable(),
            url: z.string().nullable(),

            selId: z.boolean().default(true),
            selDates: z.boolean().default(true),
            selName: z.boolean().default(true),
            selPrice: z.boolean().default(true),
            selDesc: z.boolean().default(true),
            selInstall: z.boolean().default(true),
            selFeatures: z.boolean().default(true),
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
            return ctx.prisma.service.findFirst({
                select: {
                    id: input.selId,
                    createdAt: input.selDates,
                    updatedAt: input.selDates,
                    name: input.selName,
                    price: input.selPrice,
                    desc: input.selDesc,
                    install: input.selInstall,
                    features: input.selFeatures,
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
        .query (async ({ ctx, input }) => {
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
    add: modProcedure
        .input(z.object({
            id: z.number().nullable(),
            url: z.string().nullable(),

            name: z.string(),
            price: z.number(),
            desc: z.string(),
            install: z.string().nullable(),
            features: z.string().nullable(),
            icon: z.string().nullable(),
            banner: z.string().nullable(),
            gitLink: z.string().nullable(),
            openSource: z.boolean().default(true)
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.service.upsert({
                where: {
                    ...(input.id && {
                        id: input.id
                    }),
                    ...(input.url && {
                        url: input.url
                    })
                },
                create: {
                    url: input.url ?? "NOURL",
                    name: input.name,
                    price: input.price,
                    desc: input.desc,
                    ...(input.install && {
                        install: input.install
                    }),
                    ...(input.features && {
                        features: input.features
                    }),
                    ...(input.icon && {
                        icon: input.icon
                    }),
                    ...(input.banner && {
                        banner: input.banner
                    }),
                    ...(input.gitLink && {
                        gitLink: input.gitLink
                    }),
                    openSource: input.openSource
                },
                update: {
                    url: input.url ?? "NOURL",
                    name: input.name,
                    price: input.price,
                    desc: input.desc,
                    ...(input.install && {
                        install: input.install
                    }),
                    ...(input.features && {
                        features: input.features
                    }),
                    ...(input.icon && {
                        icon: input.icon
                    }),
                    ...(input.banner && {
                        banner: input.banner
                    }),
                    ...(input.gitLink && {
                        gitLink: input.gitLink
                    }),
                    openSource: input.openSource
                }
            });

            if (!res)
                throw new TRPCError({ code: "BAD_REQUEST" });
        })
});
