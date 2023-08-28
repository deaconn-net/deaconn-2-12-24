import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

interface ExtendedNextApiRequest extends NextApiRequest {
    body: {
        action?: string,
        commits?: {
            id: string,
            ref: string,
            url: string,
            message: string,
            author: {
                email?: string,
                name: string,
                username: string
            }
        }[],
        repository?: {
            name?: string
        }
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

    const apiKey = process.env.GITHUB_API_KEY || undefined;

    if (!apiKey || apiKey.length < 1) {
        return res.status(401).json({
            code: 404,
            message: "Unauthorized. No GitHub API set."
        });
    }

    const authHeaderVal = req.headers.authorization ?? "";
    const apiKeyFull = "Bearer " + apiKey;

    if (authHeaderVal != apiKeyFull) {
        return res.status(401).json({
            code: 404,
            message: "Unauthorized."
        });
    }

    const action = req.body?.action;

    if (!action) {
        return res.status(400).json({
            code: 400,
            message: "Action not specified in payload."
        });
    }
    
    // Make sure we're on the push event.
    if (action != "push") {
        return res.status(200).json({
            code: 200,
            message: "No pushes or commits detected."
        });
    }

    // Retrieve repository name.
    const repoName = req.body?.repository?.name;

    if (!repoName) {
        return res.status(400).json({
            code: 400,
            message: "Repository name not found."
        });
    }

    // Retrieve commits.
    const commits = req.body?.commits;

    let commitsAdded = 0;

    if (commits) {
        const commitsMapping = commits.map(async (commit) => {
            // Retrieve commit ID and message.
            const commitId = commit.id;
            const commitMsg = commit.message;

            // Retrieve branch (or tag).
            const repoBranch = commit.ref.split("/").pop();

            // Retrieve information on author.
            const authorName = commit.author.name;
            const authorUsername = commit.author.username;
            const authorEmail = commit.author.email;

            // Retrieve user ID if email is found in user table.
            let userId: string | undefined = undefined;

            // See if the email links to a user.
            if (authorEmail) {
                const userLookup = await prisma.user.findFirst({
                    where: {
                        email: authorEmail
                    }
                });

                if (userLookup)
                    userId = userLookup.id;
            }

            // Attempt to add commit.
            try {
                await prisma.gitLog.create({
                    data: {
                        userId: userId,
                        name: authorName,
                        username: authorUsername,
                        repoName: repoName,
                        repoBranch: repoBranch ?? "unknown",
                        commitId: commitId,
                        commitMsg: commitMsg
                    }
                });
            } catch (err) {
                console.error("Failed to parse commit.");
                console.error(err);

                return;
            }

            commitsAdded++;
        });

        await Promise.all(commitsMapping);
    }

    return res.status(200).json({
        code: 200,
        message: `Added ${commitsAdded.toString()} commits!`
    });
};

export default makeAdmin;
