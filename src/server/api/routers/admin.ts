import { createTRPCRouter, adminProcedure } from "../trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

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
    /* Roles */
    addRole: adminProcedure
        .input(z.object({
            role: z.string().max(64),
            title: z.string().max(64),
            description: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.role.upsert({
                    where: {
                        id: input.role
                    },
                    create: {
                        id: input.role,
                        title: input.title,
                        desc: input.description
                    },
                    update: {
                        title: input.title,
                        desc: input.description
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to add role. Error => ${typeof err == "string" ? err : "Check console."}`
                });
            }
        }),
    delRole: adminProcedure
        .input(z.object({
            role: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.role.delete({
                    where: {
                        id: input.role
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to delete role. Error => ${typeof err == "string" ? err : "Check console."}`
                });
            }
        }),
    /* User Roles */
    getUserRoles: adminProcedure
        .input(z.object({
            userId: z.string()
        }))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.userRole.findMany({
                where: {
                    userId: input.userId
                }
            });
        }),
    addUserRole: adminProcedure
        .input(z.object({
            userId: z.string(),
            role: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.userRole.create({
                    data: {
                        userId: input.userId,
                        roleId: input.role
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to add user role. Error => ${typeof err == "string" ? err : "Check console."}`
                });
            }
        }),
    delUserRole: adminProcedure
        .input(z.object({
            userId: z.string(),
            role: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.userRole.delete({
                    where: {
                        userId_roleId: {
                            userId: input.userId,
                            roleId: input.role
                        }
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to delete user role. Error => ${typeof err == "string" ? err : "Check console."}`
                });
            }
        })
})