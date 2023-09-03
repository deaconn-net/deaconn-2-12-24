import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import { UserPublicSelect } from "~/types/user/user";

import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { RetrieveSocialTag } from "@utils/Social";
import { has_role } from "@utils/user/Auth";
import { UploadFile } from "@utils/FileUpload";

export const userRouter = createTRPCRouter({
    update: protectedProcedure
        .input(z.object({
            id: z.string().optional(),

            credit: z.number().optional(),

            name: z.string().max(64).regex(/^[a-zA-Z0-9 -]+$/).optional(),
            url: z.string().max(32).regex(/^[a-zA-Z0-9-]+$/).optional(),
            title: z.string().min(3).max(64).optional(),
            aboutMe: z.string().max(16384).optional(),
            birthday: z.date().optional(),
            showEmail: z.boolean().optional(),
            isTeam: z.boolean().optional(),
            isRestricted: z.boolean().optional(),

            avatar: z.string().optional(),
            avatarRemove: z.boolean().default(false),

            website: z.string().max(64).optional(),
            socialTwitter: z.string().max(64).optional(),
            socialGithub: z.string().max(64).optional(),
            socialLinkedin: z.string().max(64).optional(),
            socialFacebook: z.string().max(64).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = input.id ?? ctx.session.user.id;

            // Retrieve level of access.
            let isAdmin = false;
            let isMod = false;

            if (has_role(ctx.session, "admin"))
                isAdmin = true;

            if (has_role(ctx.session, "moderator"))
                isMod = true;
        
            // If we have a custom user ID and the IDs don't match, make sure the user has permissions.
            if ((input.id && input.id != ctx.session.user.id) && (!isAdmin && !isMod))
                throw new TRPCError({ code: "UNAUTHORIZED" });

            // Check for avatar.
            let avatarPath: string | undefined | null = undefined;

            if (input.avatarRemove)
                avatarPath = null;
            else if (input.avatar) {
                // Compile name without file extension.
                const path = `/users/avatars/${userId}`;

                // Upload file and retrieve full path.
                const [success, err, fullPath] = UploadFile(path, input.avatar);

                if (!success || !fullPath) {
                    throw new TRPCError({
                        code: "PARSE_ERROR",
                        message: `Failed to upload avatar. Error => ${err ? err : "N/A"}.`
                    });
                }

                avatarPath = fullPath;
            }
    
            // Update user.
            try {
                await ctx.prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        ...(input.id && {
                            credit: input.credit,
                        }),
                        avatar: avatarPath,
                        name: input.name,
                        url: input.url,
                        title: input.title,
                        aboutMe: input.aboutMe,
                        birthday: input.birthday,
                        showEmail: input.showEmail,
                        ...(isAdmin && {
                            isTeam: input.isTeam
                        }),
                        ...(isAdmin && {
                            isRestricted: input.isRestricted
                        }),
                        ...(input.website != undefined && {
                            website: RetrieveSocialTag(input.website, "website")
                        }),
                        ...(input.socialTwitter != undefined && {
                            socialTwitter: RetrieveSocialTag(input.socialTwitter, "twitter")
                        }),
                        ...(input.socialGithub != undefined && {
                            socialGithub: RetrieveSocialTag(input.socialGithub, "github")
                        }),
                        ...(input.socialLinkedin != undefined && {
                            socialLinkedin: RetrieveSocialTag(input.socialLinkedin, "linkedin")
                        }),
                        ...(input.socialFacebook != undefined && {
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
                include: {
                    user: {
                        select: UserPublicSelect
                    }
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
                include: {
                    user: {
                        select: UserPublicSelect
                    }
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
                include: {
                    user: {
                        select: UserPublicSelect
                    }
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

            startDate: z.date().nullable().optional(),
            endDate: z.date().nullable().optional(),

            company: z.string().max(128).optional(),
            title: z.string().min(2).max(32),
            desc: z.string().max(512).optional(),
            details: z.string().max(32768).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = input.userId ?? ctx.session.user.id;

            // Check if user owns item if ID is set (indicating they're editing).
            if (input.id && (!has_role(ctx.session, "moderator") && !has_role(ctx.session, "admin"))) {
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

            // Make sure we don't hit the maximum limit of experiences.
            const limitMax = Number(process.env.LIMIT_EXPERIENCES_MAX ?? 64);

            const cnt = await ctx.prisma.userExperience.count({
                where: {
                    userId: userId
                }
            });

            if (cnt > limitMax)
                throw new TRPCError({ code: "PAYLOAD_TOO_LARGE" });

            // Attempt to create or update experience.
            try {
                await ctx.prisma.userExperience.upsert({
                    where: {
                        id: input.id ?? 0
                    },
                    create: {
                        userId: userId,
                        startDate: input.startDate,
                        endDate: input.endDate,
                        company: input.company,
                        title: input.title,
                        desc: input.desc,
                        details: input.details
                    },
                    update: {
                        userId: userId,
                        startDate: input.startDate,
                        endDate: input.endDate,
                        company: input.company,
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
            const userId = input.userId ?? ctx.session.user.id;

            // Check if user owns item if ID is set (indicating they're editing).
            if (input.id && (!has_role(ctx.session, "moderator") && !has_role(ctx.session, "admin"))) {
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

            // Make sure we don't hit the maximum limit of experiences.
            const limitMax = Number(process.env.LIMIT_EXPERIENCES_MAX ?? 64);

            const cnt = await ctx.prisma.userExperience.count({
                where: {
                    userId: userId
                }
            });

            if (cnt > limitMax)
                throw new TRPCError({ code: "PAYLOAD_TOO_LARGE" });

            try {
                await ctx.prisma.userSkill.upsert({
                    where: {
                        id: input.id ?? 0
                    },
                    create: {
                        userId: userId,
                        title: input.title,
                        desc: input.desc
                    },
                    update: {
                        userId: userId,
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

            startDate: z.date().nullable().optional(),
            endDate: z.date().nullable().optional(),

            name: z.string().min(2).max(32),
            desc: z.string().max(512).optional(),
            details: z.string().max(32768).optional(),
            openSource: z.boolean().default(true),

            sources: z.array(z.object({
                projectId: z.number(),
                title: z.string().max(64),
                url: z.string().url().max(128),
            })).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = input.userId ?? ctx.session.user.id;

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

            // Make sure we don't hit the maximum limit of experiences.
            const limitMax = Number(process.env.LIMIT_EXPERIENCES_MAX ?? 64);

            const cnt = await ctx.prisma.userExperience.count({
                where: {
                    userId: userId
                }
            });

            if (cnt > limitMax)
                throw new TRPCError({ code: "PAYLOAD_TOO_LARGE" });

            try {
                await ctx.prisma.userProject.upsert({
                    where: {
                        id: input.id ?? 0
                    },
                    create: {
                        userId: userId,
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
                        userId: userId,
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
