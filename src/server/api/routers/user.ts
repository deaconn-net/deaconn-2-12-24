import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(z.object({
      id: z.string(),

      aboutMe: z.string().nullable(),
      experiences: z.string().nullable(),
      skills: z.string().nullable(),
      permissions: z.string().nullable()
    }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: input.id
        },
        data: {
          ...(input.aboutMe && {
            aboutMe: input.aboutMe
          })
        }
      });
    })
});
