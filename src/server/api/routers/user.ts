import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { RetrieveSocialTag } from "@utils/social";

const expSchema = z.object({
    id: z.number().nullable(),

    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
    title: z.string(),
    desc: z.string()
});

const skillSchema = z.object({
    id: z.number().nullable(),

    title: z.string(),
    desc: z.string()
});

const projectSrcSchema = z.object({
    title: z.string(),
    url: z.string()
})

const projectSchema = z.object({
    id: z.number().nullable(),

    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
    name: z.string(),
    desc: z.string(),

    projectSources: z.array(projectSrcSchema)
});

export const userRouter = createTRPCRouter({
    update: protectedProcedure
        .input(z.object({
            id: z.string(),

            credit: z.number().optional(),

            image: z.string().optional(),
            name: z.string().optional(),
            url: z.string().optional(),
            title: z.string().optional(),
            aboutMe: z.string().optional(),
            birthday: z.date().optional(),
            showEmail: z.boolean().optional(),
            isTeam: z.boolean().optional(),

            website: z.string().optional(),
            socialTwitter: z.string().optional(),
            socialGithub: z.string().optional(),
            socialLinkedin: z.string().optional(),
            socialFacebook: z.string().optional(),

            experiences: z.array(expSchema).optional(),
            skills: z.array(skillSchema).optional(),
            projects: z.array(projectSchema).optional(),

            permissions: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            
            // Update user itself first.
            const res = await ctx.prisma.user.update({
                where: {
                    id: input.id
                },
                data: {
                    credit: input.credit,
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

            const expIds: Array<number> = [];

            if (input.experiences && input.experiences.length > 0) {
                const promises = input.experiences.map(async (exp) => {
                    const expQuery = await ctx.prisma.userExperience.upsert({
                        where: {
                            id: exp.id ?? 0
                        },
                        create: {
                            userId: input.id,
                            startDate: exp.startDate,
                            endDate: exp.endDate,
                            title: exp.title,
                            desc: exp.desc
                        },
                        update: {
                            userId: input.id,
                            ...(exp.startDate && {
                                startDate: exp.startDate
                            }),
                            ...(exp.endDate && {
                                endDate: exp.endDate
                            }),
                            title: exp.title,
                            desc: exp.desc
                        }
                    });

                    // Add onto IDs.
                    if (expQuery.id > 0)
                        expIds.push(expQuery.id);
                });

                // Wait for all queries to complete.
                await Promise.all(promises);

                // Delete existing experiences that weren't created or updated.
                await ctx.prisma.userExperience.deleteMany({
                    where: {
                        id: {
                            notIn: expIds
                        }
                    }
                });
            }

            const skillIds: Array<number> = [];

            if (input.skills && input.skills.length > 0) {
                const promises = input.skills.map(async (skill) => {
                    const skillQuery = await ctx.prisma.userSkill.upsert({
                        where: {
                            id: skill.id ?? 0
                        },
                        create: {
                            userId: input.id,
                            title: skill.title,
                            desc: skill.desc
                        },
                        update: {
                            title: skill.title,
                            desc: skill.desc
                        }
                    });

                    if (skillQuery.id > 0)
                        skillIds.push(skillQuery.id);
                });

                // Wait for other skill queries to complete.
                await Promise.all(promises);

                // Delete existing skills that we haven't created or update.
                await ctx.prisma.userSkill.deleteMany({
                    where: {
                        id: {
                            notIn: skillIds
                        }
                    }
                });
            }

            const projectIds: Array<number> = [];

            if (input.projects && input.projects.length > 0) {
                const promises = input.projects.map(async (pro) => {
                    const proQuery = await ctx.prisma.userProject.upsert({
                        where: {
                            id: pro.id ?? 0
                        },
                        create: {
                            userId: input.id,
                            startDate: pro.startDate,
                            endDate: pro.endDate,
                            name: pro.name,
                            desc: pro.desc
                        },
                        update: {
                            ...(pro.startDate && {
                                startDate: pro.startDate
                            }),
                            ...(pro.endDate && {
                                endDate: pro.endDate
                            }),
                            name: pro.name,
                            desc: pro.desc
                        }
                    });

                    // Add onto project IDs.
                    if (proQuery.id > 0)
                        projectIds.push(proQuery.id);

                    // Handle project sources.
                    const sourceIDs: Array<string> = [];

                    if (pro.projectSources && pro.projectSources.length > 0) {
                        const srcPromises = pro.projectSources.map(async (src) => {
                            await ctx.prisma.projectSource.upsert({
                                where: {
                                    projectId_url: {
                                        projectId: proQuery.id,
                                        url: src.url
                                    }
                                },
                                create: {
                                    projectId: proQuery.id,
                                    title: src.title,
                                    url: src.url
                                },
                                update: {
                                    title: src.title,
                                    url: src.url
                                }
                            });
                        });

                        await Promise.all(srcPromises);

                        // Delete sources that we haven't created or updated.
                        if (proQuery.id > 0) {
                            await ctx.prisma.projectSource.deleteMany({
                                where: {
                                    projectId: proQuery.id,
                                    url: {
                                        notIn: sourceIDs
                                    }
                                }
                            });
                        }
                    }
                })

                // Wait for all queries to complete.
                await Promise.all(promises);

                // Delete all projects we haven't created or updated.
                await ctx.prisma.userProject.deleteMany({
                    where: {
                        id: {
                            notIn: projectIds
                        }
                    }
                })
            }

            if (!res)
                throw new TRPCError({ code: "BAD_REQUEST" });
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
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.userExperience.delete({
                where: {
                    id: input.id
                }
            });

            if (!res.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Unable to delete experience #" + input.id.toString()
                });
            }
        }),
    deleteSkill: protectedProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.userSkill.delete({
                where: {
                    id: input.id
                }
            });

            if (!res.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Unable to delete skill #" + input.id.toString()
                });
            }
        }),
    deleteProject: protectedProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.userProject.delete({
                where: {
                    id: input.id
                }
            });

            if (!res.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Unable to delete project #" + input.id.toString()
                });
            }
        }),
    addExperience: protectedProcedure
        .input(z.object({
            id: z.number().optional(),

            userId: z.string().optional(),

            startDate: z.date().optional(),
            endDate: z.date().optional(),

            title: z.string(),
            desc: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.userExperience.upsert({
                where: {
                    id: input.id ?? 0
                },
                create: {
                    userId: (input.userId) ? input.userId : ctx.session.user.id,
                    ...(input.startDate && {
                        startDate: input.startDate
                    }),
                    ...(input.endDate && {
                        endDate: input.endDate
                    }),
                    title: input.title,
                    ...(input.desc && {
                        desc: input.desc
                    })
                },
                update: {
                    userId: (input.userId) ? input.userId : ctx.session.user.id,
                    ...(input.startDate && {
                        startDate: input.startDate
                    }),
                    ...(input.endDate && {
                        endDate: input.endDate
                    }),
                    title: input.title,
                    ...(input.desc && {
                        desc: input.desc
                    })
                }
            });

            if (!res.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Unable to create experience."
                });
            }
        }),
    addSkill: protectedProcedure
        .input(z.object({
            id: z.number().optional(),

            userId: z.string().optional(),

            title: z.string(),
            desc: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.userSkill.upsert({
                where: {
                    id: input.id ?? 0
                },
                create: {
                    userId: (input.userId) ? input.userId : ctx.session.user.id,
                    title: input.title,
                    ...(input.desc && {
                        desc: input.desc
                    })
                },
                update: {
                    userId: (input.userId) ? input.userId : ctx.session.user.id,
                    title: input.title,
                    ...(input.desc && {
                        desc: input.desc
                    })
                }
            });

            if (!res.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Unable to create skill."
                });
            }
        }),
    addProject: protectedProcedure
        .input(z.object({
            id: z.number().optional(),

            userId: z.string().optional(),

            startDate: z.date().optional(),
            endDate: z.date().optional(),

            name: z.string(),
            desc: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.prisma.userProject.upsert({
                where: {
                    id: input.id ?? 0
                },
                create: {
                    userId: (input.userId) ? input.userId : ctx.session.user.id,
                    ...(input.startDate && {
                        startDate: input.startDate
                    }),
                    ...(input.endDate && {
                        endDate: input.endDate
                    }),
                    name: input.name,
                    ...(input.desc && {
                        desc: input.desc
                    })
                },
                update: {
                    userId: (input.userId) ? input.userId : ctx.session.user.id,
                    ...(input.startDate && {
                        startDate: input.startDate
                    }),
                    ...(input.endDate && {
                        endDate: input.endDate
                    }),
                    name: input.name,
                    ...(input.desc && {
                        desc: input.desc
                    })
                }
            });

            if (!res.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Unable to create experience."
                });
            }
        }),
});
