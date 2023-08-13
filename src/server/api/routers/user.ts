import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { RetrieveSocialTag } from "@utils/social";
import { has_role } from "@utils/user/auth";

export const userRouter = createTRPCRouter({
    update: protectedProcedure
        .input(z.object({
            id: z.string().optional(),

            credit: z.number().optional(),

            image: z.string().optional(),
            name: z.string().max(64).optional(),
            url: z.string().max(32).optional(),
            title: z.string().min(3).max(64).optional(),
            aboutMe: z.string().max(16384).optional(),
            birthday: z.date().optional(),
            showEmail: z.boolean().optional(),
            isTeam: z.boolean().optional(),

            website: z.string().max(64).optional(),
            socialTwitter: z.string().max(64).optional(),
            socialGithub: z.string().max(64).optional(),
            socialLinkedin: z.string().max(64).optional(),
            socialFacebook: z.string().max(64).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // If we have a custom user ID and the IDs don't match, make sure the user has permissions.
            if ((input.id && input.id != ctx.session.user.id) && (!has_role(ctx.session, "admin") && !has_role(ctx.session, "moderator")))
                throw new TRPCError({ code: "UNAUTHORIZED" });
    
            // Update user.
            try {
                await ctx.prisma.user.update({
                    where: {
                        id: input.id ?? ctx.session.user.id
                    },
                    data: {
                        ...(input.id && {
                            credit: input.credit,
                        }),
                        image: input.image,
                        name: input.name,
                        url: input.url,
                        title: input.title,
                        aboutMe: input.aboutMe,
                        birthday: input.birthday,
                        showEmail: input.showEmail,
                        isTeam: input.isTeam,
                        ...(input.website && {
                            website: RetrieveSocialTag(input.website, "website")
                        }),
                        ...(input.socialTwitter && {
                            socialTwitter: RetrieveSocialTag(input.socialTwitter, "twitter")
                        }),
                        ...(input.socialGithub && {
                            socialGithub: RetrieveSocialTag(input.socialGithub, "github")
                        }),
                        ...(input.socialLinkedin && {
                            socialLinkedin: RetrieveSocialTag(input.socialLinkedin, "linkedin")
                        }),
                        ...(input.socialFacebook && {
                            socialFacebook: RetrieveSocialTag(input.socialFacebook, "facebook")
                        })
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to update user (ID => ${input.id ?? ctx.session.user.id}). Error => ${typeof err == "string" ? err : "Check console"}.`
                });
            }
        }),
    getAllExperiences: publicProcedure
        .input(z.object({
            sort: z.string().default("id"),
            sortDir: z.string().default("desc"),

            userId: z.string().optional(),

            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.userExperience.findMany({
                take: input.limit + 1,
                cursor: (input.cursor) ? { id: input.cursor } : undefined,
                orderBy: {
                    [input.sort]: input.sortDir
                },
                where: {
                    ...(input.userId && {
                        userId: input.userId
                    })
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
    getAllSkills: publicProcedure
        .input(z.object({
            sort: z.string().default("id"),
            sortDir: z.string().default("desc"),

            userId: z.string().optional(),

            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.userSkill.findMany({
                take: input.limit + 1,
                cursor: (input.cursor) ? { id: input.cursor } : undefined,
                orderBy: {
                    [input.sort]: input.sortDir
                },
                where: {
                    ...(input.userId && {
                        userId: input.userId
                    })
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
    getAllProjects: publicProcedure
        .input(z.object({
            sort: z.string().default("id"),
            sortDir: z.string().default("desc"),

            userId: z.string().optional(),

            limit: z.number().default(10),
            cursor: z.number().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.userProject.findMany({
                take: input.limit + 1,
                cursor: (input.cursor) ? { id: input.cursor } : undefined,
                orderBy: {
                    [input.sort]: input.sortDir
                },
                where: {
                    ...(input.userId && {
                        userId: input.userId
                    })
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
    deleteExperience: protectedProcedure
        .input(z.object({
            id: z.number(),
            userId: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if user owns experience if not admin/moderator.
            if (!has_role(ctx.session, "moderator") && !has_role(ctx.session, "admin")) {
                const userId = ctx.session.user.id;

                // Check if user owns experience.
                try {
                    await ctx.prisma.userExperience.findFirstOrThrow({
                        where: {
                            id: input.id,
                            userId: userId
                        }
                    });
                } catch (err) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED"
                    });
                }
            }

            // Make sure the user has permissions if a custom user ID is set.
            if (input.userId && (!has_role(ctx.session, "admin") && !has_role(ctx.session, "moderator")))
                throw new TRPCError({ code: "UNAUTHORIZED" });

            try {
                await ctx.prisma.userExperience.delete({
                    where: {
                        id: input.id
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to delete experience (ID => ${input.id.toString()}). Error => ${typeof err == "string" ? err : "Check console"}.`
                });
            }
        }),
    deleteSkill: protectedProcedure
        .input(z.object({
            id: z.number(),
            userId: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if user owns skill if not admin/moderator.
            if (!has_role(ctx.session, "moderator") && !has_role(ctx.session, "admin")) {
                const userId = ctx.session.user.id;

                // Check if user owns skill.
                try {
                    await ctx.prisma.userSkill.findFirstOrThrow({
                        where: {
                            id: input.id,
                            userId: userId
                        }
                    });
                } catch (err) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED"
                    });
                }
            }

            // Make sure the user has permissions if a custom user ID is set.
            if (input.userId && (!has_role(ctx.session, "admin") && !has_role(ctx.session, "moderator")))
                throw new TRPCError({ code: "UNAUTHORIZED" });
        
            try {
                await ctx.prisma.userSkill.delete({
                    where: {
                        id: input.id,
                        userId: input.userId ?? ctx.session.user.id
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to delete skill (ID => ${input.id.toString()}). Error => ${typeof err == "string" ? err : "Check console"}.`
                });
            }
        }),
    deleteProject: protectedProcedure
        .input(z.object({
            id: z.number(),
            userId: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if user owns project if not admin/moderator.
            if (!has_role(ctx.session, "moderator") && !has_role(ctx.session, "admin")) {
                const userId = ctx.session.user.id;

                // Check if user owns project.
                try {
                    await ctx.prisma.userProject.findFirstOrThrow({
                        where: {
                            id: input.id,
                            userId: userId
                        }
                    });
                } catch (err) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED"
                    });
                }
            }

            // Make sure the user has permissions if a custom user ID is set.
            if (input.userId && (!has_role(ctx.session, "admin") && !has_role(ctx.session, "moderator")))
                throw new TRPCError({ code: "UNAUTHORIZED" });
            
            try {
                await ctx.prisma.userProject.delete({
                    where: {
                        id: input.id,
                        userId: input.userId ?? ctx.session.user.id
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to delete project (ID => ${input.id.toString()}). Error => ${typeof err == "string" ? err : "Check console."}`
                })
            }
        }),
    addExperience: protectedProcedure
        .input(z.object({
            id: z.number().optional(),

            userId: z.string().optional(),

            startDate: z.date().optional(),
            endDate: z.date().optional(),

            title: z.string().min(2).max(32),
            desc: z.string().max(512).optional(),
            details: z.string().max(32768).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if user owns item if ID is set (indicating they're editing).
            if (input.id && (!has_role(ctx.session, "moderator") && !has_role(ctx.session, "admin"))) {
                const userId = ctx.session.user.id;

                // Check if user owns experience.
                try {
                    await ctx.prisma.userExperience.findFirstOrThrow({
                        where: {
                            userId: userId
                        }
                    });
                } catch (err) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED"
                    });
                }
            }

            // Make sure the user has permissions if a custom user ID is set.
            if (input.userId && (!has_role(ctx.session, "admin") && !has_role(ctx.session, "moderator")))
                throw new TRPCError({ code: "UNAUTHORIZED" });

            // Attempt to create or update experience.
            try {
                await ctx.prisma.userExperience.upsert({
                    where: {
                        id: input.id ?? 0
                    },
                    create: {
                        userId: input.userId ?? ctx.session.user.id,
                        startDate: input.startDate,
                        endDate: input.endDate,
                        title: input.title,
                        desc: input.desc,
                        details: input.details
                    },
                    update: {
                        userId: input.userId ?? ctx.session.user.id,
                        startDate: input.startDate,
                        endDate: input.endDate,
                        title: input.title,
                        desc: input.desc,
                        details: input.details
                    }
                });
            } catch (err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to ${input.id ? "save" : "create"} user experience (ID => ${input.id?.toString() ?? "N/A"}). Error => ${typeof err == "string" ? err : "Check console"}.`
                });
            }
        }),
    addSkill: protectedProcedure
        .input(z.object({
            id: z.number().optional(),

            userId: z.string().optional(),

            title: z.string().min(2).max(32),
            desc: z.string().max(512).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if user owns item if ID is set (indicating they're editing).
            if (input.id && (!has_role(ctx.session, "moderator") && !has_role(ctx.session, "admin"))) {
                const userId = ctx.session.user.id;

                // Check if user owns skill.
                try {
                    await ctx.prisma.userSkill.findFirstOrThrow({
                        where: {
                            userId: userId
                        }
                    });
                } catch (err) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED"
                    });
                }
            }

            // Make sure the user has permissions if a custom user ID is set.
            if (input.userId && (!has_role(ctx.session, "admin") && !has_role(ctx.session, "moderator")))
                throw new TRPCError({ code: "UNAUTHORIZED" });

            try {
                await ctx.prisma.userSkill.upsert({
                    where: {
                        id: input.id ?? 0
                    },
                    create: {
                        userId: input.userId ?? ctx.session.user.id,
                        title: input.title,
                        desc: input.desc
                    },
                    update: {
                        userId: input.userId ?? ctx.session.user.id,
                        title: input.title,
                        desc: input.desc
                    }
                });
            } catch(err) {
                console.error(err);

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to ${input.id ? "save" : "create"} skill (ID => ${input.id?.toString() ?? "N/A"}). Error => ${typeof err == "string" ? err : "Check console"}.`
                });
            }
        }),
    addProject: protectedProcedure
        .input(z.object({
            id: z.number().optional(),

            userId: z.string().optional(),

            startDate: z.date().optional(),
            endDate: z.date().optional(),

            name: z.string().min(2).max(32),
            desc: z.string().max(512).optional(),
            details: z.string().max(32768).optional(),
            openSource: z.boolean().default(true),

            sources: z.array(z.object({
                projectId: z.number(),
                title: z.string().max(64),
                url: z.string().max(128),
            })).optional(),
            sourcesToDelete: z.array(z.number()).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if user owns item if ID is set (indicating they're saving).
            if (input.id && (!has_role(ctx.session, "moderator") && !has_role(ctx.session, "admin"))) {
                const userId = ctx.session.user.id;

                // Check if user owns project.
                try {
                    await ctx.prisma.userProject.findFirstOrThrow({
                        where: {
                            userId: userId
                        }
                    });
                } catch (err) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED"
                    });
                }
            }

            // Make sure the user has permissions if a custom user ID is set.
            if (input.userId && (!has_role(ctx.session, "admin") && !has_role(ctx.session, "moderator")))
                throw new TRPCError({ code: "UNAUTHORIZED" });

            try {
                await ctx.prisma.userProject.upsert({
                    where: {
                        id: input.id ?? 0
                    },
                    create: {
                        userId: input.userId ?? ctx.session.user.id,
                        startDate: input.startDate,
                        endDate: input.endDate,
                        name: input.name,
                        desc: input.desc,
                        details: input.details,
                        openSource: input.openSource,
                        sources: {
                            create: input.sources?.map((source) => ({
                                title: source.title,
                                url: source.url
                            }))
                        }
                    },
                    update: {
                        userId: input.userId ?? ctx.session.user.id,
                        startDate: input.startDate,
                        endDate: input.endDate,
                        name: input.name,
                        desc: input.desc,
                        details: input.details,
                        openSource: input.openSource,
                        sources: {
                            deleteMany: {
                                projectId: input.id
                            },
                            create: input.sources?.map((source) => ({
                                title: source.title,
                                url: source.url
                            }))
                        }
                    }
                });
            } catch (err) {
                console.error(err);
                
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Failed to ${input.id ? "save" : "create"} project (ID => ${input.id?.toString() ?? "N/A"}). Error => ${typeof err == "string" ? err : "Check console"}.`
                })
            }
        })
});
