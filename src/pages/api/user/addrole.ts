import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

interface ExtendedNextApiRequest extends NextApiRequest {
    body: {
        id?: string,
        role?: string
    };
  }

const makeAdmin = async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
    const method = req.method;

    if (method != "POST") {
        return res.status(405).json({
            code: 405,
            message: "Method not allowed."
        });
    }

    if (!process.env.ROOT_API || process.env.ROOT_API.length < 1) {
        return res.status(401).json({
            code: 404,
            message: "Unauthorized. No root API set."
        });
    }

    const authHeaderVal = req.headers.authorization ?? "";
    const authKey = "Bearer " + process.env.ROOT_API;

    if (authHeaderVal != authKey) {
        return res.status(401).json({
            code: 404,
            message: "Unauthorized."
        });
    }

    const id = req.body?.id;
    const role = req?.body?.role;

    if (!id) {
        return res.status(400).json({
            code: 400,
            message: "Missing ID from POST body."
        });
    }

    if (!role) {
        return res.status(400).json({
            code: 400,
            message: "Missing role from POST body."
        });
    }

    // Ensure our role is created.
    try {
        await prisma.role.upsert({
            where: {
                id: role
            },
            update: {

            },
            create: {
                id: role,
                title: role.charAt(0).toUpperCase() + role.slice(1)
            }
        });
    } finally {}

    try {
        await prisma.userRole.create({
            data: {
                userId: id,
                roleId: role
            }
        });
    } catch (err) {
        console.error(err);

        return res.status(400).json({
            code: 400,
            message: `Failed to update user. Error => ${typeof err == "string" ? err : "Check console."}`
        });
    }

    return res.status(200).json({
        code: 200,
        message: `Success added user with ID '${id}' to admin!`
    });
};

export default makeAdmin;
