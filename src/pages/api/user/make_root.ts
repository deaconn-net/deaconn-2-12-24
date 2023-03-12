import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

const genRatings = async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method;

    if (method != "POST")
        return res.status(405).json({ code: 405, message: "Method not allowed." });

    if (!process.env.ROOT_API || process.env.ROOT_API.length < 1)
        return res.status(401).json({ code: 404, message: "Unauthorized. No root API set." });

    const authHeaderVal = req.headers.authorization ?? "";
    const authKey = "Bearer " + process.env.ROOT_API;

    if (authHeaderVal != authKey)
        return res.status(401).json({ code: 404, message: "Unauthorized." });

    const id = req.query.id ?? null;

    const update = await prisma.user.update({
        where: {
            id: id?.toString()
        },
        data: {
            isRoot: true
        }
    });

    if (update.id)
        return res.status(200).json({ code: 200, message: "Success!" });

    return res.status(400).json({ code: 400, message: "ID not found." });
};

export default genRatings;
