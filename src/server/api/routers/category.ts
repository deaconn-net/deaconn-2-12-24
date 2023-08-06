import { createTRPCRouter, adminProcedure } from "../trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

export const categoryRouter = createTRPCRouter({
    add: adminProcedure
        .input(z.object({
            id: z.number().optional(),

            parent: z.number().nullable().optional(),

            url: z.string(),
            name: z.string(),
            description: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.category.upsert({
                    where: {
                        id: input.id ?? 0
                    },
                    create: {
                        ...(input.parent !== undefined && {
                            parentId: input.parent
                        }),
                        url: input.url,
                        name: input.name,
                        ...(input.description && {
                            desc: input.description
                        })
                    },
                    update: {
                        ...(input.parent !== undefined && {
                            parentId: input.parent
                        }),
                        url: input.url,
                        name: input.name,
                        ...(input.description && {
                            desc: input.description
                        })
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Error ${input.id ? "saving" : "creating"} category. Error => ${typeof err == "string" ? err : "Check console"}.`
                });
            }
        }),
        delete: adminProcedure
            .input(z.object({
                id: z.number()
            }))
            .mutation(async ({ ctx, input }) => {
                try {
                    await ctx.prisma.category.delete({
                        where: {
                            id: input.id
                        }
                    });
                } catch (err) {
                    console.error(err);

                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `Error deleting category. Error => ${typeof err == "string" ? err : "Check console"}.`
                    })
                }
            })
})