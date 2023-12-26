import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";

import { type RequestReply } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import RequestReplyForm from "@components/forms/request/Reply";
import NoPermissions from "@components/error/NoPermissions";
import NotFound from "@components/error/NotFound";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { has_role } from "@utils/user/Auth";
import { useSession } from "next-auth/react";

export default function Page ({
    reply,

    footerServices,
    footerPartners
} : {
    reply?: RequestReply
} & GlobalPropsType) {
    // Retrieve user session and check if user has access to reply.
    const { data: session } = useSession();
    
    let authed = has_role(session, "admin") || has_role(session, "moderator");

    if (!authed && (session?.user && reply) && reply.userId == session.user.id)
        authed = true;

    return (
        <>
            <Meta
                title={`Editing Reply #${reply?.id?.toString() ?? "N/A"} - Requests - Deaconn`}
                description="Create or edit reply with Deaconn."
            />
            <Wrapper
                breadcrumbs={[
                    {
                        name: "Requests",
                        url: "/request"
                    },
                    {
                        name: "Replies"
                    },
                    {
                        name: "Editing"
                    },
                    ...(reply ? [{
                        name: `#${reply.id.toString()}`,
                        url: `/request/reply/edit/${reply.id.toString()}`
                    }] : [])
                ]}
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {(authed && reply) ? (
                        <div className="content-item2">
                            <div>
                                <h2>Edit Reply #{reply.id.toString()}</h2>
                            </div>
                            <div>
                                <RequestReplyForm
                                    requestId={reply.requestId}
                                    reply={reply}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {!authed ? (
                                <NoPermissions />
                            ) : (
                                <NotFound item="Reply" />
                            )}
                        </>
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    const session = await getServerAuthSession(ctx);

    // Make sure we're signed in and check if we're an administrator or not.
    let authed = has_role(session, "admin") || has_role(session, "moderator");

    const lookup_id = params?.id;

    let reply: RequestReply | null = null;

    if (lookup_id) {
        reply = await prisma.requestReply.findFirst({
            where: {
                id: Number(lookup_id.toString())
            }
        });

        // Check if user owns reply.
        if (!authed && (session?.user && reply) && reply.userId == session.user.id)
            authed = true;
    }

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            ...(authed && {
                reply: reply
            })
        }
    };
}