import { getServerSideSitemapLegacy } from "next-sitemap"
import { type GetServerSideProps } from "next"

import { UserPublicRefSelect } from "~/types/user/user";

import { prisma } from "@server/db";
import { dateToYMD } from "@utils/Date";

type Changefreq =
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const items: Array<{
        loc: string, lastmod: string,
        priority?: number,
        changefreq?: Changefreq
    }> = [];

    // Get current date in YYYY-MM-DD format.
    const curDateYmd = dateToYMD(new Date());

    // Push URLs we are already aware of.
    items.push({
        loc: "https://deaconn.net/",
        lastmod: curDateYmd,
        priority: 1.0,
        changefreq: "always"
    });
    items.push({
        loc: "https://deaconn.net/blog",
        lastmod: curDateYmd,
        priority: 0.8,
        changefreq: "daily"
    });
    items.push({
        loc: "https://deaconn.net/service",
        lastmod: curDateYmd,
        priority: 0.8,
        changefreq: "daily"
    });
    items.push({
        loc: "https://deaconn.net/about",
        lastmod: curDateYmd,
        priority: 0.8,
        changefreq: "weekly"
    });

    // Handle articles.
    const articles = await prisma.article.findMany();

    articles.map((article) => {
        const dateYmd = dateToYMD(article.updatedAt);
        
        items.push({
            loc: "https://deaconn.net/blog/view/" + article.url,
            lastmod: dateYmd,
            priority: 0.7,
            changefreq: "weekly"
        });
    })

    // Handle services.
    const services = await prisma.service.findMany();

    services.map((service) => {
        const dateYmd = dateToYMD(service.updatedAt);

        items.push({
            loc: "https://deaconn.net/service/view/" + service.url,
            lastmod: dateYmd,
            priority: 0.7,
            changefreq: "weekly"
        });
    })

    // User projects.
    const userProjects = await prisma.userProject.findMany({
        include: {
            user: {
                select: UserPublicRefSelect
            }
        }
    });

    userProjects.map((project) => {
        const url = `https://deaconn.net/user/view/${project.user.url ? project.user.url : `$${project.user.id.toString()}`}/projects/${project.id.toString()}`;

        items.push({
            loc: url,
            lastmod: new Date().toISOString(),
            priority: 0.5,
            changefreq: "weekly"
        });
    })

    return getServerSideSitemapLegacy(ctx, items)
}

// Default export to prevent next.js errors
export default getServerSideProps;