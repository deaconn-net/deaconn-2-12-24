import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type RequestReply } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import RequestReplyForm from "@components/forms/request/reply";
import NoPermissions from "@components/errors/no_permissions";
import NotFound from "@components/errors/not_found";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";
import { has_role } from "@utils/user/auth";

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
                title={`Editing Reply ${reply ? `#${reply.id.toString()}` : `N/A`} - Requests - Deaconn`}
                description="Create or edit reply with Deaconn."
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {(authed && reply) ? (
                    <div className="content-item">
                        <h1>Edit Reply</h1>
                        <RequestReplyForm
                            requestId={reply.requestId}
                            reply={reply}
                        />
                    </div>
                ) : (
                    <div className="content-item">
                        {reply ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Reply" />
                        )}
                    </div>
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    const session = await getSession(ctx);

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