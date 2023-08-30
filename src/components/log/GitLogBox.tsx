import { useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type GitLogWithUser } from "~/types/gitlog";

import DeleteIcon from "@components/icons/Delete";
import Loader from "@components/Loader";
import UserRowGrid from "@components/user/row/Grid";

import { api } from "@utils/Api";

import { dateFormat, dateFormatThree } from "@utils/Date";
import { ScrollToTop } from "@utils/Scroll";
import { has_role } from "@utils/user/Auth";

import InfiniteScroll from "react-infinite-scroller";

export default function GitLogBox () {
    const [requireItems, setRequireItems] = useState(true);

    const limit = 10;
    const { data, fetchNextPage } = api.gitLog.getAll.useInfiniteQuery({
        limit: limit
    },
    {
        getNextPageParam: (lastPage) => lastPage.nextCur
    });

    const loadMore = () => {
        void fetchNextPage();
    }

    const gitLogs: GitLogWithUser[] = [];

    if (data) {
        data.pages.map((pg) => {
            gitLogs.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }

    return (
        <div className="gitlog">
            {!data || gitLogs.length > 0 ? (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    loader={<Loader key="loader" />}
                    hasMore={requireItems}
                    useWindow={false}
                >
                    <table className="gitlog-table">
                        <tbody>
                            {gitLogs.map((log) => {
                                return (
                                    <Row
                                        key={`gitlog-${log.id.toString()}`}
                                        log={log}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </InfiniteScroll>
            ) : (
                <p>No commits found</p>
            )}
        </div>
    );
}

function Row ({
    log
} : {
    log: GitLogWithUser
}) {
    // Retrieve session.
    const { data: session } = useSession();

    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Retrieve GitHub org URL environmental variable.
    const gitOrgUrl = process.env.NEXT_PUBLIC_GITHUB_ORG_URL || "";

    // Compile URLs.
    const viewUrl = `${gitOrgUrl}/${log.repoName}/commit/${log.commitId}`;
    const repoUrl = `${gitOrgUrl}/${log.repoName}`;
    const branchUrl = `${gitOrgUrl}/${log.repoName}/tree/${log.repoBranch}`;
    const githubUserUrl = `https://github.com/${log.username ?? ""}`;

    // Retrieve short version of commit ID.
    const shortCommitId = log.commitId.substring(0, 7);

    const [dateStr, setDateStr] = useState<string | undefined>(undefined);

    useEffect(() => {
        const dateFormatted = dateFormat(log.createdAt, dateFormatThree);

        if (!dateStr)
            setDateStr(dateFormatted);
    }, [log.createdAt, dateStr])

    // Mutations.
    const deleteMut = api.gitLog.del.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Delete Git Log Entry");
                errorCtx.setMsg("Failed to delete Git log entry.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Successfully Deleted Git Log Entry!");
                successCtx.setMsg("Successfully deleted Git log entry!");

                ScrollToTop();
            }
        }
    });

    return (
        <tr>
            {dateStr && (
                <td className="gl-date">
                    {dateStr}
                </td>
            )}
            <td className="gl-name">
                <Link
                    href={repoUrl}
                    target="_blank"
                    className="text-blue-300"
                >
                    {log.repoName.charAt(0) + log.repoName.slice(1)}
                </Link>
                <span>:</span>
                <Link
                    href={branchUrl}
                    target="_blank"
                    className="text-blue-200"
                >
                    {log.repoBranch}
                </Link>
            </td>
            <td className="gl-commit">
                <Link
                    href={viewUrl}
                    target="_blank"
                >
                    <span className="text-blue-300">{shortCommitId}</span>
                </Link>
            </td>
            <td className="gl-msg">
                <span>{log.commitMsg}</span>
            </td>
            <td className="gl-author">
                    {log.user ? (
                        <span>
                            <UserRowGrid
                                user={log.user}
                                showInline={true}
                                avatarWidth={32}
                                avatarHeight={32}
                            />
                        </span>
                    ) : (
                        <span>
                            <Link
                                href={githubUserUrl}
                                target="_blank"
                            >{log.username ?? "N/A"}</Link>
                        </span>
                    )}
            </td>
            {session && has_role(session, "admin") && (
                <td className="gl-actions">
                    <button
                        onClick={(e) => {
                            e.preventDefault();

                            const yes = confirm("Are you sure you want to delete this Git log entry?");

                            if (yes) {
                                deleteMut.mutate({
                                    id: log.id
                                });
                            }
                        }}
                    >
                        <DeleteIcon
                            className="w-4 h-4 fill-red-600"
                        />
                    </button>
                </td>
            )}
        </tr>
    );
}