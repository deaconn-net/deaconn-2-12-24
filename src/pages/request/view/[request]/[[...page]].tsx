import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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
import { dateFormat, dateFormatFour, dateFormatThree } from "@utils/date";

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

    // Success and error management.
    let sucTitle: string | undefined = undefined;
    let sucMsg: string | undefined = undefined;
    let errTitle: string | undefined = undefined;
    let errMsg: string | undefined = undefined;

    // Compile URLs.
    const editUrl = `/request/edit/${request?.id ?? ""}`;

    // Handle mutations.
    const statusMut = api.request.setStatus.useMutation();
    const deleteReplyMut = api.request.delReply.useMutation();
    const acceptReqMut = api.request.setAccept.useMutation();

    if (statusMut.isSuccess) {
        sucTitle = "Updated Status!";
        sucMsg = "Updated request status successfully!";
    } else if (statusMut.isError) {
        console.error(statusMut.error.message);

        errTitle = "Failed To Update Status";
        errMsg = "Failed to update request status. Please contact administrator or check your console for more details.";
    }

    if (deleteReplyMut.isSuccess) {
        sucTitle = "Deleted Reply!";
        sucMsg = "Deleted reply successfully!";
    } else if (deleteReplyMut.isError) {
        console.error(deleteReplyMut.error.message);

        errTitle = "Failed To Delete Reply";
        errMsg = "Failed to delete reply. Please contact administrator or check your console for more details.";
    }

    // Check if we can edit, set status, or accept/reject request.
    let isAdmin = false;

    if (session && has_role(session, "admin"))
        isAdmin = true;

    let canEditAndStatus = false;

    if (session && (has_role(session, "admin") || has_role(session, "moderator")))
        canEditAndStatus = true;

    if (!canEditAndStatus && session?.user && request && session.user.id == request.userId)
        canEditAndStatus = true;

    const [isCompleted, setIsCompleted] = useState(request?.status == 2 ?? false);

    // Accept or reject request.
    const [accept, setAccept] = useState(request?.accepted ?? false);

    if (acceptReqMut.isSuccess) {
        sucTitle = `${accept ? "Accepted" : "Rejected"} Request!`;
        sucMsg = `Successfully ${accept ? "accepted" : "rejected"} this request!`;
    } else if (acceptReqMut.isError) {
        console.error(acceptReqMut.error.message);

        errTitle = `Failed To ${accept ? "Accept" : "Reject"} Request`;
        errMsg = `Failed to ${accept ? "accept" : "reject"} request. Look at console for more details.`;
    }

    // Dates    
    const [reqUpdatedAt, setReqUpdatedAt] = useState<string | undefined>(undefined);
    const [reqCreatedAt, setReqCreatedAt] = useState<string | undefined>(undefined);
    const [reqStartDate, setReqStartDate] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!request)
            return;

        if (!reqUpdatedAt)
            setReqUpdatedAt(dateFormat(request.updatedAt, dateFormatFour));

        if (!reqCreatedAt)
            setReqCreatedAt(dateFormat(request.createdAt, dateFormatFour));

        if (!reqStartDate && request.startDate)
            setReqStartDate(dateFormat(request.startDate, dateFormatThree));
    }, [request, reqUpdatedAt, reqCreatedAt, reqStartDate])

    return (
        <>
            <Meta
                title="View Request - Requests - Deaconn"
            />
            <Wrapper
                successTitleOverride={sucTitle}
                successMsgOverride={sucMsg}
                errorTitleOverride={errTitle}
                errorMsgOverride={errMsg}

                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {(request && authed) ? (
                        <>
                            <h1>{request?.title ?? `Request #${request.id.toString()}`}</h1>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap">
                                    <div className="p-4 flex flex-col gap-1 items-center bg-gray-700 rounded-tl-lg rounded-bl-lg">
                                        <UserGridRow
                                            user={request.user}
                                        />
                                        <p className="text-xl font-bold"><span className="text-green-500">$</span>{request.price.toString()}</p>
                                        <p className="text-lg font-bold">{request.timeframe.toString()} Hours</p>
                                        {reqStartDate && (
                                            <p className="text-lg font-bold">On {reqStartDate}</p>
                                        )}
                                    </div>
                                    <div className="grow p-4 bg-gray-800 rounded-sm flex flex-col gap-4 rounded-tr-lg rounded-br-lg">
                                        <div className="flex flex-wrap gap-2">
                                            <Markdown className="grow">
                                                {request.content}
                                            </Markdown>
                                            <div>
                                                <p className="text-xl font-bold">
                                                    {request.accepted ? (
                                                        <span className="text-green-300">Accepted</span>
                                                    ) : (
                                                        <span className="text-red-400">Not Accepted</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        {canEditAndStatus && (
                                            <div className="flex flex-wrap gap-2 justify-between items-center">
                                                <div className="flex flex-wrap gap-2">
                                                    {isAdmin && (
                                                        <button
                                                            className={`button sm:w-auto ${accept ? "button-danger" : "button-primary"}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                
                                                                // Update request.
                                                                acceptReqMut.mutate({
                                                                    requestId: request.id,
                                                                    accepted: !accept
                                                                });

                                                                setAccept(!accept);
                                                            }}
                                                        >{accept ? "Reject" : "Accept"}</button>
                                                    )}
                                                    <Link
                                                        href={editUrl}
                                                        className="button button-primary sm:w-auto"
                                                    >Edit</Link>
                                                    <button
                                                        className={`button sm:w-auto ${isCompleted ? "button-secondary" : "button-primary"}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();

                                                            const newStatus = isCompleted ? 0 : 2;

                                                            statusMut.mutate({
                                                                id: request.id,
                                                                status: newStatus
                                                            });

                                                            setIsCompleted(!isCompleted);
                                                        }}
                                                    >{isCompleted ? "Reopen" : "Mark As Completed"}</button>
                                                </div>
                                                <div className="flex flex-col text-sm">
                                                    <p>Created On <span className="italic">{reqCreatedAt}</span></p>
                                                    <p>Last Updated On <span className="italic">{reqUpdatedAt}</span></p>
                                                </div>
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

                                        // Dates.
                                        const repCreatedAt = dateFormat(reply.createdAt, dateFormatFour);
                                        const repUpdatedAt = dateFormat(reply.updatedAt, dateFormatFour);

                                        return (
                                            <div
                                                key={`request-reply-${reply.id.toString()}`}
                                                className="flex flex-wrap"
                                            >
                                                <div className="p-4 flex flex-col gap-2 items-center bg-gray-700 rounded-tl-lg rounded-bl-lg">
                                                    <UserGridRow
                                                        user={request.user}
                                                    />
                                                </div>
                                                <div className="grow p-4 bg-gray-800 rounded-sm flex flex-col gap-4 rounded-tr-lg rounded-br-lg">
                                                    <Markdown>
                                                        {reply.content}
                                                    </Markdown>
                                                    {canEdit && (
                                                        <div className="flex flex-wrap gap-2 justify-between items-center">
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
                                                            <div className="flex flex-col text-sm">
                                                                <p>Created On <span className="italic">{repCreatedAt}</span></p>
                                                                <p>Last Updated On <span className="italic">{repUpdatedAt}</span></p>
                                                            </div>
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
                        </>
                    ) : (
                        <>
                            {!authed ? (
                                <NoPermissions />
                            ) : (
                                <NotFound item="Request" />
                            )}
                        </>
                    )}
                </div>
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