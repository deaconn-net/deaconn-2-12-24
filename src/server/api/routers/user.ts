import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
  get: publicProcedure
    .input(z.object({
      id: z.string().nullable().default(null),
      url: z.string().nullable().default(null),

      selId: z.boolean().default(true),
      selEmail: z.boolean().default(true),
      selCredit: z.boolean().default(true),
      selImage: z.boolean().default(true),
      selName: z.boolean().default(true),
      selUrl: z.boolean().default(true),
      selTitle: z.boolean().default(true),
      selAboutMe: z.boolean().default(true),
      selBirthday: z.boolean().default(true),
      selShowEmail: z.boolean().default(true),
      selIsTeam: z.boolean().default(true),

      incExperiences: z.boolean().default(false),
      incSkills: z.boolean().default(false),
      incProjects: z.boolean().default(false),
      incPermissions: z.boolean().default(false),
      incArticles: z.boolean().default(false),
      incRequests: z.boolean().default(false)
    }))
    .query(({ ctx, input }) => {
      if (!input.id && !input.url)
        return null;

      return ctx.prisma.user.findFirst({
        select: {
          id: input.selId,
          email: input.selEmail,
          credit: input.selCredit,
          image: input.selImage,
          name: input.selName,
          url: input.selUrl,
          title: input.selTitle,
          aboutMe: input.selAboutMe,
          birthday: input.selBirthday,
          showEmail: input.selShowEmail,
          isTeam: input.selIsTeam,

          experiences: input.incExperiences,
          skills: input.incSkills,
          projects: input.incProjects,

          Article: input.incArticles,
          Request: input.incRequests
        },
        where: {
          OR: [
            {
              ...(input.id && {
                id: input.id
              })
            },
            {
              ...(input.url && {
                url: input.url
              })
            }
          ]
        }
      });
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.string(),

      credit: z.number().nullable().default(null),

      image: z.string().nullable().default(null),
      name: z.string().nullable().default(null),
      url: z.string().nullable().default(null),
      title: z.string().nullable().default(null),
      aboutMe: z.string().nullable().default(null),
      birthday: z.date().nullable().default(null),
      showEmail: z.boolean().nullable().default(null),
      isTeam: z.boolean().nullable().default(null),

      experiences: z.array(expSchema).nullable().default(null),
      skills: z.array(skillSchema).nullable().default(null),
      projects: z.array(projectSchema).nullable().default(null),

      permissions: z.string().nullable().default(null)
    }))
    .mutation(async ({ ctx, input }) => {
      // Update user itself first.
      const res = await ctx.prisma.user.update({
        where: {
          id: input.id
        },
        data: {
          ...(input.credit && {
            credit: input.credit
          }),
          ...(input.image && {
            image: input.image
          }),
          ...(input.name && {
            name: input.name
          }),
          ...(input.url && {
            url: input.url
          }),
          ...(input.title && {
            title: input.title
          }),
          ...(input.aboutMe && {
            aboutMe: input.aboutMe
          }),
          ...(input.birthday && {
            birthday: input.birthday
          }),
          ...(input.showEmail != null && {
            showEmail: input.showEmail
          }),
          ...(input.isTeam && {
            isTeam: input.isTeam
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
              ...(exp.startDate && {
                startDate: exp.startDate
              }),
              ...(exp.endDate && {
                endDate: exp.endDate
              }),
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
              ...(pro.startDate && {
                startDate: pro.startDate
              }),
              ...(pro.endDate && {
                endDate: pro.endDate
              }),
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
  getAllExperiences: protectedProcedure
    .input(z.object({
        sort: z.string().default("id"),
        sortDir: z.string().default("desc"),

        userId: z.string().nullable().default(null),

        skip: z.number().default(0),
        limit: z.number().default(10),
        cursor: z.number().nullish()
    }))
    .query (async ({ ctx, input }) => {
        const items = await ctx.prisma.userExperience.findMany({
            skip: input.skip,
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
  getAllSkills: protectedProcedure
    .input(z.object({
        sort: z.string().default("id"),
        sortDir: z.string().default("desc"),

        userId: z.string().nullable().default(null),

        skip: z.number().default(0),
        limit: z.number().default(10),
        cursor: z.number().nullish()
    }))
    .query (async ({ ctx, input }) => {
        const items = await ctx.prisma.userSkill.findMany({
            skip: input.skip,
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

        userId: z.string().nullable().default(null),

        skip: z.number().default(0),
        limit: z.number().default(10),
        cursor: z.number().nullish()
    }))
    .query (async ({ ctx, input }) => {
        const items = await ctx.prisma.userProject.findMany({
            skip: input.skip,
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
          message: "Unable to delete experience #" + input.id
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
          message: "Unable to delete skill #" + input.id
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
          message: "Unable to delete project #" + input.id
        });
      }
    }),
  getExperience: protectedProcedure
    .input(z.object({
      id: z.number()
    }))
    .query(({ ctx, input }) => {
      if (input.id < 1)
        return null;

      return ctx.prisma.userExperience.findFirst({
        where: {
          id: input.id
        }
      });
    }),
  getSkill: protectedProcedure
    .input(z.object({
      id: z.number()
    }))
    .query(({ ctx, input }) => {
      if (input.id < 1)
        return null;
      return ctx.prisma.userSkill.findFirst({
        where: {
          id: input.id
        }
      });
    }),
  getProject: protectedProcedure
    .input(z.object({
      id: z.number()
    }))
    .query(({ ctx, input }) => {
      if (input.id < 1)
        return null;

      return ctx.prisma.userProject.findFirst({
        where: {
          id: input.id
        }
      });
    }),
  addExperience: protectedProcedure
    .input(z.object({
      id: z.number().nullable().default(null),

      userId: z.string().nullable().default(null),

      startDate: z.date().nullable().default(null),
      endDate: z.date().nullable().default(null),

      title: z.string(),
      desc: z.string().nullable().default(null)
    }))
    .mutation(async ({ ctx, input}) => {
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
      id: z.number().nullable().default(null),

      userId: z.string().nullable().default(null),

      title: z.string(),
      desc: z.string().nullable().default(null)
    }))
    .mutation(async ({ ctx, input}) => {
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
      id: z.number().nullable().default(null),

      userId: z.string().nullable().default(null),

      startDate: z.date().nullable().default(null),
      endDate: z.date().nullable().default(null),

      name: z.string(),
      desc: z.string().nullable().default(null)
    }))
    .mutation(async ({ ctx, input}) => {
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
