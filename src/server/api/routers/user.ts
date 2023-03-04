import { createTRPCRouter, protectedProcedure } from "../trpc";
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
  updateProfile: protectedProcedure
    .input(z.object({
      id: z.string(),

      isTeam: z.boolean().nullable(),
      aboutMe: z.string().nullable(),

      experiences: z.array(expSchema).nullable(),
      skills: z.array(skillSchema).nullable(),
      projects: z.array(projectSchema).nullable(),

      permissions: z.string().nullable()
    }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.prisma.user.update({
        where: {
          id: input.id
        },
        data: {
          ...(input.aboutMe && {
            aboutMe: input.aboutMe
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
