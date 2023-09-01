import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

interface ExtendedNextApiRequest extends NextApiRequest {
    body: {
        repositories?: number,
        commits?: number
    };
  }

const statsGithub = async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
    const method = req.method;

    if (method != "POST") {
        return res.status(405).json({
            code: 405,
            message: "Method not allowed."
        });
    }

    if (!req.body) {
        return res.status(401).json({
            code: 401,
            message: "Reqeust body empty!"
        });
    }

    const apiKey = process.env.ROOT_API || undefined;

    if (!apiKey) {
        return res.status(401).json({
            code: 404,
            message: "API token not set."
        });
    }

    const authHeaderVal = req.headers.authorization || undefined;

    if (!authHeaderVal) {
        return res.status(401).json({
            code: 401,
            message: "Authentication header not set."
        });
    }

    const apiKeyFull = "Bearer " + apiKey;

    if (authHeaderVal !== apiKeyFull) {
        return res.status(401).json({
            code: 404,
            message: "Unauthorized."
        });
    }

    const repos = req.body.repositories; 
    const commits = req.body.commits;

    if (repos) {
        try {
            await prisma.githubStats.upsert({
                create: {
                    key: "repositories",
                    val: repos.toString()
                },
                update: {
                    val: repos.toString()
                },
                where: {
                    key: "repositories"
                }
            });
        } catch (err) {
            console.error(err);

            return res.status(400).json({
                code: 400,
                message: `Error attempting to update repositories. Error => ${typeof err == "string" ? err : "Check console"}.`
            });
        }
    }

    if (commits) {
        try {
            await prisma.githubStats.upsert({
                create: {
                    key: "commits",
                    val: commits.toString()
                },
                update: {
                    val: commits.toString()
                },
                where: {
                    key: "commits"
                }
            })
        } catch (err) {
            console.error(err);

            return res.status(400).json({
                code: 400,
                message: `Error attempting to update commits. Error => ${typeof err == "string" ? err : "Check console"}.`
            });
        }
    }

    return res.status(200).json({
        code: 200,
        message: `${repos ? "Updated repositories!" : ""} ${commits ? "Updated commits!" : ""}`
    });
};

export default statsGithub;
