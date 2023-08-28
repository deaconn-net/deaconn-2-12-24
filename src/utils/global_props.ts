import { type ServiceFooter } from "~/types/service";
import { type Partner } from "@prisma/client";

import { prisma } from "~/server/db"

export type GlobalPropsType = {
    footerServices?: ServiceFooter[],
    footerPartners?: Partner[]
}

export async function GlobalProps (): Promise<GlobalPropsType> {
    const services = await prisma.service.findMany({
        select: {
            id: true,
            name: true,
            url: true
        }
    });

    const partners = await prisma.partner.findMany({
        orderBy: {
            priority: "asc"
        }
    });

    const props: GlobalPropsType = {
        footerServices: services,
        footerPartners: partners
    };

    return props;
}

export default GlobalProps;