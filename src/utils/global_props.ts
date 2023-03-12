import { prisma } from "~/server/db"

export const globalProps = async () => {
    const partners = await prisma.partner.findMany();

    return { partners: partners }
}