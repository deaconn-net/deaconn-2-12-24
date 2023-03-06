import { createTRPCRouter, modProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

import fs from 'fs';
import { TRPCError } from "@trpc/server";

export const filesystemRouter = createTRPCRouter({
    write: protectedProcedure
        .input(z.object({
            fileName: z.string(),
            data: z.string()
        }))
        .mutation(async ({ input }) => {
            try {
                fs.writeFileSync(input.fileName, input.data);
            } catch (error) {
                console.error(error);

                throw new TRPCError({ 
                    message: "Could not write file to disk (" + input.fileName + ").", 
                    code: "BAD_REQUEST" 
                });
            }
        }),
    rename: modProcedure
        .input(z.object({
            fileName: z.string(),
            newFileName: z.string()
        }))
        .mutation(async ({ input }) => {
            try {
                fs.renameSync(input.fileName, input.newFileName);
            } catch (error) {
                console.error(error);

                throw new TRPCError({
                    message: "Could not rename file on disk (" + input.fileName + " => " + input.newFileName + ").",
                    code: "BAD_REQUEST"
                });
            }
        }),
    delete: modProcedure
        .input(z.object({
            fileName: z.string()
        }))
        .mutation(async ({ input }) => {
            try {
                fs.rmSync(input.fileName);
            } catch (error) {
                console.error(error);

                throw new TRPCError({
                    message: "Could not delete file from disk (" + input.fileName + ").",
                    code: "BAD_REQUEST"
                });
            }
        })
});