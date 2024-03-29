import { createTRPCRouter, publicProcedure, modProcedure, contributorProcedure } from "../trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { UploadFile } from "@utils/FileUpload";

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
    add: contributorProcedure
        .input(z.object({
            id: z.number().optional(),

            priority: z.number().optional(),

            url: z.string().min(3).max(128),
            about: z.string().nullable().optional(),
            name: z.string().max(64),

            banner: z.string().optional(),
            bannerRemove: z.boolean().default(false),

            icon: z.string().optional(),
            iconRemove: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const partner = await ctx.prisma.partner.upsert({
                where: {
                    id: input.id ?? 0
                },
                create: {
                    priority: input.priority,
                    name: input.name,
                    about: input.about,
                    url: input.url
                },
                update: {
                    priority: input.priority,
                    name: input.name,
                    about: input.about,
                    url: input.url,
                    ...(input.bannerRemove && {
                        banner: null
                    }),
                    ...(input.iconRemove && {
                        icon: null
                    })
                }
            });

            if (!partner)
                throw new TRPCError({ code: "BAD_REQUEST" });

            // Check for banners and icons.
            const hasBanner = Boolean(input.banner && !input.bannerRemove);
            const hasIcon = Boolean(input.icon && !input.iconRemove);

            if (hasBanner || hasIcon) {
                let bannerFullPath: string | undefined = undefined;
                let iconFullPath: string | undefined = undefined;
                
                // Handle banner.
                if (hasBanner) {
                    // We only need to compile path name without file type.
                    const path = `${process.env.UPLOADS_PRE_URL ?? ""}/partners/${partner.id}`;

                    // Upload file and retrieve full path.
                    const [success, err, full_path] = UploadFile(path, input.banner ?? "");

                    if (!success || !full_path) {
                        throw new TRPCError({
                            code: "PARSE_ERROR",
                            message: `Failed to upload banner for partner #${partner.id.toString()}. Error => ${err ? err : ""}.`
                        });
                    }

                    bannerFullPath = full_path;
                }

                // Handle icon.
                if (hasIcon) {
                    // We only need to compile path name without file type.
                    const path = `${process.env.UPLOADS_PRE_URL ?? ""}/partners/${partner.id}_icon`;

                    // Upload file and retrieve full path.
                    const [success, err, full_path] = UploadFile(path, input.icon ?? "");

                    if (!success || !full_path) {
                        throw new TRPCError({
                            code: "PARSE_ERROR",
                            message: `Failed to upload icon for partner #${partner.id.toString()}. Error => ${err ? err : ""}.`
                        });
                    }

                    iconFullPath = full_path;
                }

                // Now reupdate.
                try {
                    await ctx.prisma.partner.update({
                        where: {
                            id: partner.id
                        },
                        data: {
                            banner: bannerFullPath,
                            icon: iconFullPath
                        }
                    });
                } catch (err) {
                    console.error(err);

                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `Failed to update partner #${partner.id.toString()} with banners and icons. Error => ${typeof err == "string" ? err : "Check console"}.`
                    });
                }
            }
        }),
    delete: modProcedure
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
