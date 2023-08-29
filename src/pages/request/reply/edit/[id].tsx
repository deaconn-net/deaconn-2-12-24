import { type GetServerSidePropsContext, type NextPage } from "next";
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

const Page: NextPage<{
    authed: boolean,
    reply?: RequestReply,
} & GlobalPropsType> = ({
    authed,
    reply,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`Editing Reply #${reply?.id?.toString() ?? "N/A"} - Requests - Deaconn`}
                description="Create or edit reply with Deaconn."
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {(authed && reply) ? (
                        <>
                            <h1>Edit Reply</h1>
                            <RequestReplyForm
                                requestId={reply.requestId}
                                reply={reply}
                            />
                        </>
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

    // Make sure we're signed in.
    let authed = false;

    // Check if admin or moderator.
    if (session && (has_role(session, "admin") || has_role(session, "moderator")))
        authed = true;

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
            authed: authed,
            reply: reply
        }
    };
}

export default Page;