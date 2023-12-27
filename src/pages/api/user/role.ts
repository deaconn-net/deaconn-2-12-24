import { type UserRoles } from "@prisma/client";
import { CheckApiAccess } from "@utils/ApiFuncs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function Role (req: NextApiRequest, res: NextApiResponse) {
    const key = process.env.ROOT_API ?? "";

    // Check if we have access.
    const [ret, err, method] = await CheckApiAccess({
        req: req,
        key: key,
        methods: ["POST", "DELETE"]
    });

    if (ret !== 200) {
        return res.status(ret).json({
            message: err
        })
    }

    // Attempt to retrieve ID and role from body.
    const {
        id,
        role
    } : {
        id?: string
        role?: UserRoles
    } = req.body;

    if (!id) {
        return res.status(400).json({
            code: 400,
            message: "Missing ID from body."
        });
    }

    if (!role) {
        return res.status(400).json({
            code: 400,
            message: "Missing role from body."
        });
    }

    // Check for adding a role.
    if (method === "POST") {
        try {
            await prisma.user.update({
                data: {
                    roles: {
                        push: role
                    }
                },
                where: {
                    id: id
                }
            })
        } catch (err: unknown) {
            res.status(400).json({
                message: `Error adding role '${role}' to user '${id}. Error => ${err}`
            })
        }

        return res.status(200).json({
            code: 200,
            message: `Successfully added role '${role}' to user '${id}'!`
        });
    } else if (method === "DELETE") {
        try {
            const user = await prisma.user.findFirstOrThrow({
                where: {
                    id: id
                }
            })

            // Copy to new roles.
            const newRoles = user.roles;

            const idx = newRoles.findIndex(tmp => tmp == role);

            if (idx !== -1)
                newRoles.splice(idx, 1);

            await prisma.user.update({
                data: {
                    roles: {
                        set: newRoles
                    }
                },
                where: {
                    id: id
                }
            })
        } catch (err: unknown) {
            res.status(400).json({
                message: `Error deleting role '${role}' from user '${id}'. Error => ${err}`
            })
        }

        return res.status(200).json({
            code: 200,
            message: `Successfully deleted role '${role}' from user '${id}'!`
        });
    }

    return res.status(405).json({
        message: "Method not allowed."
    })
}