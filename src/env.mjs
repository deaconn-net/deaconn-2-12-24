import { z } from "zod";

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z.object({
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string().min(1) : z.string().url(),
    ),
    // Add `.min(1) on ID and SECRET if you want to make sure they're not empty

    UPLOADS_DIR: z.string().default("/uploads"),
    ROOT_API: z.string().optional(),

    // Providers
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),

    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    // Limits
    LIMIT_EXPERIENCES_MAX: z.string().optional(),
    LIMIT_SKILLS_MAX: z.string().optional(),
    LIMIT_PROJECTS_MAX: z.string().optional(),

    // GitHub
    GITHUB_API_SECRET: z.string().optional(),
    GITHUB_API_KEY: z.string().optional()

});

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
    NEXT_PUBLIC_UPLOADS_URL: z.string().optional(),
    NEXT_PUBLIC_DEFAULT_ARTICLE_IMAGE: z.string().default("/images/blog/default.jpg"),
    NEXT_PUBLIC_DEFAULT_SERVICE_IMAGE: z.string().default("/images/service/default.png"),
    NEXT_PUBLIC_DEFAULT_AVATAR_IMAGE: z.string().default("/images/users/avatars/default.png"),
    NEXT_PUBLIC_DISCORD_SERVER_ID: z.string().optional(),
    NEXT_PUBLIC_GITHUB_ORG_URL: z.string().optional(),
    NEXT_PUBLIC_GITHUB_REPO_URL: z.string().optional(),
    NEXT_PUBLIC_ROOT_USER_URL: z.string().optional(),
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
    NEXT_PUBLIC_BASE_URL: z.string().optional()
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
    /* Server */
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    UPLOADS_DIR: process.env.UPLOADS_DIR,
    ROOT_API: process.env.ROOT_API,

    // Providers
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    // Limits
    LIMIT_EXPERIENCES_MAX: process.env.LIMIT_EXPERIENCES_MAX,
    LIMIT_SKILLS_MAX: process.env.LIMIT_SKILLS_MAX,
    LIMIT_PROJECTS_MAX: process.env.LIMIT_PROJECTS_MAX,

    // GitHub
    GITHUB_API_SECRET: process.env.GITHUB_API_SECRET,
    GITHUB_API_KEY: process.env.GITHUB_API_KEY,

    /* Client */
    NEXT_PUBLIC_UPLOADS_URL: process.env.CDN_URL,
    NEXT_PUBLIC_DEFAULT_ARTICLE_IMAGE: process.env.NEXT_PUBLIC_DEFAULT_ARTICLE_IMAGE,
    NEXT_PUBLIC_DEFAULT_SERVICE_IMAGE: process.env.NEXT_PUBLIC_DEFAULT_SERVICE_IMAGE,
    NEXT_PUBLIC_DEFAULT_AVATAR_IMAGE: process.env.NEXT_PUBLIC_DEFAULT_AVATAR_IMAGE,
    NEXT_PUBLIC_DISCORD_SERVER_ID: process.env.NEXT_PUBLIC_DISCORD_SERVER_ID,
    NEXT_PUBLIC_GITHUB_ORG_URL: process.env.NEXT_PUBLIC_GITHUB_ORG_URL,
    NEXT_PUBLIC_GITHUB_REPO_URL: process.env.NEXT_PUBLIC_GITHUB_REPO_URL,
    NEXT_PUBLIC_ROOT_USER_URL: process.env.NEXT_PUBLIC_ROOT_USER_URL,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

let env = /** @type {MergedOutput} */ (process.env);

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === "undefined";

  const parsed = /** @type {MergedSafeParseReturn} */ (
    isServer
      ? merged.safeParse(processEnv) // on server we can validate all env vars
      : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
  );

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`,
        );
      return target[/** @type {keyof typeof target} */ (prop)];
    },
  });
}

export { env };
