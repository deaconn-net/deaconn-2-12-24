import { type PartnerFooter } from "~/types/partner";
import { type ServiceFooter } from "~/types/service";

import { prisma } from "~/server/db"

export type GlobalPropsType = {
    footerServices?: ServiceFooter[],
    footerPartners?: PartnerFooter[]
}

const GlobalProps = async () => {
    const services = await prisma.service.findMany({
        select: {
            id: true,
            name: true,
            url: true
        }
    });

    const partners = await prisma.partner.findMany({
        select: {
            id: true,
            banner: true,
            name: true,
            url: true
        }
    });

    const props: GlobalPropsType = {
        footerServices: services,
        footerPartners: partners
    };

    return props;
}

export default GlobalProps;