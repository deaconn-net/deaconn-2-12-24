import { type GetServerSidePropsContext } from "next";
import { type DefaultSession, getServerSession, type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { type UserRole } from "@prisma/client";

import DiscordProvider from "next-auth/providers/discord";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: DefaultSession["user"] & {
            id: string
            roles: string[],
            isRestricted?: boolean
        };
    }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;

                let roles: UserRole[] = [];

                // Retrieve user roles.
                try {
                    roles = await prisma.userRole.findMany({
                        where: {
                            userId: user.id
                        }
                    });
                } catch (error) {
                    console.error(`Failed to retrieve user roles (ID #${user.id})`);
                }

                if (roles)
                    session.user.roles = roles.map(role => role.roleId);

                // See if we're restricted.
                const isRestrictedQuery = await prisma.user.count({
                    where: {
                        id: user.id,
                        isRestricted: true
                    }
                });

                session.user.isRestricted = (isRestrictedQuery > 0) ? true : false;
            }

            return session;
        },
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        DiscordProvider({
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        }),
        GithubProvider({
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET
        }),
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET
        })
    ]
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
    req: GetServerSidePropsContext["req"];
    res: GetServerSidePropsContext["res"];
}) => {
    return getServerSession(ctx.req, ctx.res, authOptions);
};
