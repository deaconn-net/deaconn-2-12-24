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
      id: z.string(),

      selId: z.boolean().default(true),
      selEmail: z.boolean().default(true),
      selCredit: z.boolean().default(true),
      selImage: z.boolean().default(true),
      selName: z.boolean().default(true),
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
      return ctx.prisma.user.findFirst({
        select: {
          id: input.selId,
          email: input.selEmail,
          credit: input.selCredit,
          image: input.selImage,
          name: input.selName,
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
          id: input.id
        }
      });
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.string(),

      credit: z.number().nullable().default(null),

      image: z.string().nullable().default(null),
      name: z.string().nullable().default(null),
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
          ...(input.title && {
            title: input.title
          }),
          ...(input.aboutMe && {
            aboutMe: input.aboutMe
          }),
          ...(input.birthday && {
            birthday: input.birthday
          }),
          ...(input.showEmail && {
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
          const expQuery = await ctx.prisma.experience.upsert({
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
        await ctx.prisma.experience.deleteMany({
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
          const skillQuery = await ctx.prisma.skill.upsert({
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
        await ctx.prisma.skill.deleteMany({
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
          const proQuery = await ctx.prisma.project.upsert({
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
        await ctx.prisma.project.deleteMany({
          where: {
            id: {
              notIn: projectIds
            }
          }
        })
      }

      if (!res)
        throw new TRPCError({ code: "BAD_REQUEST" });
    })
});
