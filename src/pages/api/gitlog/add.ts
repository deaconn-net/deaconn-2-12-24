import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

import crypto from "crypto";

interface ExtendedNextApiRequest extends NextApiRequest {
    body: {
        ref: string,
        action?: string,
        commits?: {
            id: string,
            url: string,
            message: string,
            timestamp: string,
            author: {
                email?: string,
                name: string,
                username: string
            }
        }[],
        repository: {
            name: string,
            private: boolean
        }
    };
  }

const gitlogAdd = async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
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

    // This code can likely be improved on \o/
    const authToken = process.env.GITHUB_API_KEY || undefined;
    const authSecret = process.env.GITHUB_API_SECRET || undefined;

    if (!authToken && !authSecret) {
        return res.status(401).json({
            code: 400,
            message: "Both authorization and secret tokens not set on server-side."
        });
    }

    const secret = req.headers["x-hub-signature-256"]?.toString();
    const authHeaderToken = req.headers.authorization;

    if (!secret && !authHeaderToken) {
        return res.status(401).json({
            code: 400,
            message: "Both secret and authentication headers not set."
        });
    }

    if (secret && authSecret) {
        const sigHashAlg = "sha256";

        const data = JSON.stringify(req.body);

        const sig = Buffer.from(secret, "utf-8");
        const hmac = crypto.createHmac(sigHashAlg, authSecret);
        const digest = Buffer.from(`${sigHashAlg}=${hmac.update(data).digest("hex")}`, "utf-8");
        
        if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
            return res.status(401).json({
                code: 401,
                message: `Request body digest (${digest}) did not match 'X-Hub-Signature-256' (${sig}).`
            });
        }
    } else if (authHeaderToken && authToken) {
        const apiKeyFull = "Bearer " + authToken;

        if (authHeaderToken !== apiKeyFull) {
            return res.status(401).json({
                code: 404,
                message: "Unauthorized."
            });
        }
    } else {
        return res.status(401).json({
            code: 401,
            message: "Didn't perform any authentication checks."
        });
    }

    const action = req.headers["x-github-event"]?.toString() || req.body?.action;

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

    // Make sure this isn't private.
    const isPrivate = req.body.repository.private;

    if (isPrivate) {
        return res.status(404).json({
            code: 404,
            message: "Repository is private. Aborting."
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
    const ref = req.body.ref;
    const commits = req.body.commits;

    let commitsAdded = 0;

    if (commits) {
        // First, sort array by timestamp field.
        commits.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);

            return dateA.getTime() - dateB.getTime();
        });

        
        const commitsMapping = commits.reverse().map(async (commit) => {
            // Retrieve commit ID and message.
            const commitId = commit.id;
            const commitMsg = commit.message;

            // Retrieve branch (or tag).
            const repoBranch = ref.split("/").pop();

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

export default gitlogAdd;
