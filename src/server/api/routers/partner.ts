import { modProcedure, createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import FileType from "~/utils/base64";
import fs from 'fs';

export const partnerRouter = createTRPCRouter({
    get: publicProcedure
        .input(z.object({
            id: z.number().nullable(),
            url: z.string().nullable(),

            selId: z.boolean().default(true),
            selUrl: z.boolean().default(true),
            selName: z.boolean().default(true),
            selBanner: z.boolean().default(true)
        }))
        .query(({ ctx, input }) => {
            if (!input.id && !input.url)
                return null;

            return ctx.prisma.partner.findFirst({
                select: {
                    id: input.selId,
                    url: input.selUrl,
                    name: input.selName,
                    banner: input.selBanner
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
            skip: z.number().default(0),
            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.partner.findMany({
                skip: input.skip,
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
            id: z.number().nullable().default(null),
            url: z.string(),

            name: z.string(),
            banner: z.string().nullable().default(null),

            bannerRemove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const partner = await ctx.prisma.partner.upsert({
                where: {
                    id: input.id ?? 0
                },
                create: {
                    name: input.name,
                    url: input.url,
                },
                update: {
                    name: input.name,
                    url: input.url,
                    ...(input.bannerRemove && {
                        banner: null
                    })
                }
            });

            if (!partner)
                throw new TRPCError({ code: "BAD_REQUEST" });

            // Check for banner.
            if (input.banner && !input.bannerRemove) {
                const fileType = FileType(input.banner);

                // Make sure we have a valid image file.
                if (fileType == "unknown") {
                    throw new TRPCError({
                        code: "PARSE_ERROR",
                        message: "Parner banner not a valid image file (ID #" + partner.id + ")."
                    });
                }

                // Compile file name.
                const fileName = "/partners/" + partner.id + "." + fileType;

                // Convert Base64 content.
                const buffer = Buffer.from(input.banner, 'base64');

                // Attempt to upload file.
                try {
                    fs.writeFileSync((process.env.UPLOADS_DIR ?? "/uploads") + fileName, buffer);
                } catch (error) {
                    console.error(error);

                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Partner banner failed to upload (ID #" + partner.id + ")."
                    });
                }

                // Now reupdate.
                const update = await ctx.prisma.partner.update({
                    where: {
                        id: partner.id
                    },
                    data: {
                        banner: fileName
                    }
                });

                if (update.id < 1) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Failed to update partner with banner information."
                    });
                }
            }
        }),
    delete: protectedProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.partner.delete({
                where: {
                    id: input.id
                }
            });

            if (!res) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Unable to delete partner. Partner ID #" + input.id + " likely not found."
                });
            }
        })
});
