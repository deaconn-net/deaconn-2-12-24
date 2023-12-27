import { createTRPCRouter, adminProcedure } from "../trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { UserRoles } from "@prisma/client";

export const adminRouter = createTRPCRouter({
    /* Users */
    getUsers: adminProcedure
        .input(z.object({
            sort: z.string().default("id"),
            sortDir: z.string().default("desc"),
            
            search: z.string().optional(),
            searchMode: z.number().default(0),

            limit: z.number().default(10),
            cursor: z.string().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const users = await ctx.prisma.user.findMany({
                where: {
                    ...(input.search && {
                        ...(input.searchMode == 0 && {
                            OR: [
                                {
                                    email: {
                                        contains: input.search
                                    }
                                },
                                {
                                    name: {
                                        contains: input.search,
                                    }
                                },
                                {
                                    url: {
                                        contains: input.search,
                                    }
                                },
                                {
                                    title: {
                                        contains: input.search,
                                    }
                                }
                            ]
                        }),
                        ...(input.searchMode == 1 && {
                            email: {
                                contains: input.search
                            }
                        }),
                        ...(input.searchMode == 2 && {
                            name: {
                                contains: input.search
                            }
                        }),
                        ...(input.searchMode == 3 && {
                            url: {
                                contains: input.search
                            }
                        }),
                        ...(input.searchMode == 4 && {
                            title: {
                                contains: input.search
                            }
                        })
                    })
                },
                orderBy: {
                    [input.sort]: input.sortDir
                },

                take: input.limit + 1,
                cursor: (input.cursor) ? { id: input.cursor } : undefined
            });

            let nextUser: typeof input.cursor |  undefined = undefined;

            if (users.length > input.limit) {
                const nextItem = users.pop();
                nextUser = nextItem?.id;
            }

            return {
                users,
                nextUser
            };
        }),
    addUserRole: adminProcedure
        .input(z.object({
            userId: z.string(),
            role: z.nativeEnum(UserRoles)
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.user.update({
                    data: {
                        roles: {
                            push: input.role
                        }
                    },
                    where: {
                        id: input.userId
                    }
                });
            } catch (err: unknown) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to add user role. Error => ${err}}`
                });
            }
        }),
    delUserRole: adminProcedure
        .input(z.object({
            userId: z.string(),
            role: z.nativeEnum(UserRoles)
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                // Retrieve current user.
                const user = await ctx.prisma.user.findFirstOrThrow({
                    where: {
                        id: input.userId
                    }
                })

                // Copy roles to new array.
                const newRoles = user.roles;

                // Find existing role if any.
                const idx = user.roles.findIndex(tmp => tmp == input.role);

                if (idx !== -1)
                    newRoles.splice(idx, 1);

                await ctx.prisma.user.update({
                    data: {
                        roles: {
                            set: newRoles
                        }
                    },
                    where: {
                        id: input.userId
                    }
                });
            } catch (err: unknown) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to delete user role. Error => ${err}`
                });
            }
        })
})