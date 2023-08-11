import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { upload_file } from "@utils/file_upload";

export const partnerRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(z.object({
            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.partner.findMany({
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

            url: z.string().max(128),
            name: z.string().max(64),

            banner: z.string().optional(),
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
                // We only need to compile path name without file type.
                const path = `${process.env.UPLOADS_PRE_URL ?? ""}/partners/${partner.id}`;

                // Upload file and retrieve full path.
                const [success, err, full_path] = upload_file(path, input.banner);

               if (!success || !full_path) {
                    throw new TRPCError({
                        code: "PARSE_ERROR",
                        message: `Failed to upload banner for partner #${partner.id.toString()}. Error => ${err ? err : ""}.`
                    });
                }

                // Now reupdate.
                const update = await ctx.prisma.partner.update({
                    where: {
                        id: partner.id
                    },
                    data: {
                        banner: full_path
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
                    message: "Unable to delete partner. Partner ID #" + input.id.toString() + " likely not found."
                });
            }
        })
});
