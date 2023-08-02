import { getServerSideSitemapLegacy } from "next-sitemap"
import { type GetServerSideProps } from "next"

import { prisma } from "@server/db";

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

    // Push URLs we are already aware of.
    items.push({
        loc: "https://deaconn.net/",
        lastmod: new Date().toISOString(),
        priority: 0.7,
        changefreq: "always"
    });
    items.push({
        loc: "https://deaconn.net/blog",
        lastmod: new Date().toISOString(),
        priority: 0.7
    });
    items.push({
        loc: "https://deaconn.net/service",
        lastmod: new Date().toISOString(),
        priority: 0.7
    });
    items.push({
        loc: "https://deaconn.net/about",
        lastmod: new Date().toISOString(),
        priority: 0.4
    });

    // Handle articles.
    const articles = await prisma.article.findMany();

    articles.map((article) => {
        items.push({
            loc: "https://deaconn.net/blog/view/" + article.url,
            lastmod: new Date().toISOString(),
            priority: 0.5
        });
    })

    // Handle services.
    const services = await prisma.service.findMany();

    services.map((service) => {
        items.push({
            loc: "https://deaconn.net/service/view/" + service.url,
            lastmod: new Date().toISOString(),
            priority: 0.5
        });
    })

    return getServerSideSitemapLegacy(ctx, items)
}

// Default export to prevent next.js errors
export default function Sitemap() {};