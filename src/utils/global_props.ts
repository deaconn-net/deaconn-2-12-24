import { prisma } from "~/server/db"

const GlobalProps = async () => {
    const partners = await prisma.partner.findMany();

    return { 
        partners: partners
    };
}

export default GlobalProps;