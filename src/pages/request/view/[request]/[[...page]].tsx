import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";

import { type RequestWithAll } from "~/types/request";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import NoPermissions from "@components/errors/no_permissions";
import NotFound from "@components/errors/not_found";
import Markdown from "@components/markdown";
import RequestReplyForm from "@components/forms/request/reply";
import UserGridRow from "@components/user/row/grid";

import { api } from "@utils/api";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";
import { has_role } from "@utils/user/auth";

const Page: NextPage<{
    authed: boolean,
    request?: RequestWithAll,
    nextPages: number[],
    repliesCnt: number
} & GlobalPropsType> = ({
    authed,
    request,
    nextPages,
    repliesCnt,

    footerServices,
    footerPartners
}) => {
    const { data: session } = useSession();

    const editUrl = `/request/edit/${request?.id ?? ""}`;

    const closeRequestMut = api.request.close.useMutation();
    const deleteReplyMut = api.request.delReply.useMutation();

    // Check if we can edit and close request.
    let canEditAndClose = false;

    if (session && (has_role(session, "admin") || has_role(session, "moderator")))
        canEditAndClose = true;

    if (!canEditAndClose && session?.user && request && session.user.id == request.userId)
        canEditAndClose = true;

    return (
        <>
            <Meta
                title="View Request - Requests - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {(request && authed) ? (
                    <div className="content-item">
                        <h1>{request?.title ?? `Request #${request.id.toString()}`}</h1>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-2">
                                <div className="p-4 flex flex-col gap-2 items-center">
                                    <UserGridRow
                                        user={request.user}
                                    />
                                    <p><span className="text-lg font-bold text-white">Price</span> ${request.price.toString()}</p>
                                    <p><span className="text-lg font-bold text-white">Timeframe</span> {request.timeframe.toString()} Hours</p>
                                </div>
                                <div className="grow p-4 bg-gray-800 rounded-sm flex flex-col gap-4">
                                    <Markdown>
                                        {request.content}
                                    </Markdown>
                                    {canEditAndClose && (
                                        <div className="flex flex-wrap gap-2">
                                            <Link
                                                href={editUrl}
                                                className="button sm:w-auto"
                                            >Edit</Link>
                                            <button
                                                className="button sm:w-auto"
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                    const yes = confirm("Are you sure you want to close this request?");

                                                    if (yes) {
                                                        closeRequestMut.mutate({
                                                            id: request.id
                                                        });
                                                    }
                                                }}
                                            >Close</button>
                                        </div>
                                    )}

                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h2>Replies ({repliesCnt.toString()})</h2>
                                {request.replies.map((reply) => {
                                    const editUrl = `/request/reply/edit/${reply.id.toString()}`;

                                    let canEdit = false;
                                    let canDelete = false;

                                    // Check if we can edit and delete reply.
                                    if (session && (has_role(session, "admin") || has_role(session, "moderator"))) {
                                        canEdit = true;
                                        canDelete = true;
                                    }

                                    if (!canEdit && session?.user && reply.userId == session.user.id)
                                        canEdit = true;

                                    return (
                                        <div
                                            key={`request-reply-${reply.id.toString()}`}
                                            className="flex flex-wrap gap-2"
                                        >
                                            <div className="p-4 flex flex-col gap-2 items-center">
                                                <UserGridRow
                                                    user={request.user}
                                                />
                                            </div>
                                            <div className="grow p-4 bg-gray-800 rounded-sm flex flex-col gap-4">
                                                <Markdown>
                                                    {reply.content}
                                                </Markdown>
                                                {canEdit && (
                                                    <div className="flex flex-wrap gap-2">
                                                        <Link
                                                            href={editUrl}
                                                            className="button button-primary sm:w-auto"
                                                        >Edit</Link>
                                                        {canDelete && (
                                                            <button
                                                                className="button button-danger sm:w-auto"
                                                                onClick={(e) => {
                                                                    e.preventDefault();

                                                                    const yes = confirm("Are you sure you want to delete this reply?");

                                                                    if (yes) {
                                                                        deleteReplyMut.mutate({
                                                                            id: reply.id
                                                                        });
                                                                    }
                                                                }}
                                                            >Delete</button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div> 
                                    );
                                })}
                                {nextPages.length > 0 && (
                                    <ul className="list-none flex flex-wrap gap-2">
                                        {nextPages.map((pageNum) => {
                                            const url = `/request/view/${request.id.toString()}/${pageNum.toString()}`;

                                            return (
                                                <Link
                                                    key={`page-number-${pageNum.toString()}`}
                                                    href={url}
                                                    className="hover:text-white"
                                                >
                                                    <li>{pageNum.toString()}</li>
                                                </Link>
                                            );
                                        })}
                                    </ul>
                                )}
                                <div className="p-4 bg-gray-800 flex flex-col gap-2">
                                    <h3>Add Reply</h3>
                                    <RequestReplyForm
                                        requestId={request.id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="content-item">
                        {!authed ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Request" />
                        )}
                    </div>
                )}
            </Wrapper>
        </>
    );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getSession(ctx);

    let authed = false;

    // Check if we're admin or moderator.
    if (session && (has_role(session, "admin") || has_role(session, "moderator")))
        authed = true;

    // Retrieve request ID and page number if any.
    const { params } = ctx;
    const lookupId = params?.request?.toString();
    const lookupPageNum = params?.page?.[0]?.toString();

    // Retrieve page number for replies if any.
    const repliesPerPage = 10;

    let repliesOffset = 0;
    let pageNum = 1;

    if (lookupPageNum) {
        pageNum = Number(lookupPageNum) || 1;

        repliesOffset = (pageNum - 1) * repliesPerPage;
    }

    let request: RequestWithAll | null = null;

    if (lookupId) {
        request = await prisma.request.findFirst({
            where: {
                id: Number(lookupId),
                ...(!authed && {
                    userId: session?.user?.id ?? "0"
                })
            },
            include: {
                service: true,
                replies: {
                    take: repliesPerPage,
                    skip: repliesOffset,
                    include: {
                        user: true
                    }
                },
                user: true
            }
        });
    }

    // Make sure we own request if not admin/moderator.
    if (!authed && request && session?.user && (request.userId == session?.user.id))
        authed = true;

    // Calculate next pages.
    let repliesCnt = 0;
    const nextPages: number[] = [];

    if (request) {
        repliesCnt = await prisma.requestReply.count({
            where: {
                requestId: request.id
            }
        });

        const maxPages = Math.floor(repliesCnt / repliesPerPage);

        for (let i = (pageNum - 3); i <= (pageNum + 3); i++) {
            if (i < 1 || i > maxPages)
                continue;

            nextPages.push(i);
        }
    }

    // Calculate next page numbers
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            request: JSON.parse(JSON.stringify(request)),
            nextPages: nextPages,
            repliesCnt: repliesCnt
        }
    }
}
export default Page;