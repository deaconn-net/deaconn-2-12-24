import { useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type UpdateLogWithUser } from "~/types/updatelog";

import DeleteIcon from "@components/icons/Delete";
import Loader from "@components/Loader";
import UserRowGrid from "@components/user/row/Grid";

import EditIcon from "@components/icons/Edit";
import Markdown from "@components/markdown/Markdown";

import { api } from "@utils/Api";

import { dateFormat, dateFormatThree } from "@utils/Date";
import { ScrollToTop } from "@utils/Scroll";
import { has_role } from "@utils/user/Auth";

import InfiniteScroll from "react-infinite-scroller";

export default function UpdateBox ({
    showUser
} : {
    showUser?: boolean
}) {
    // Retrieve session.
    const { data: session } = useSession();

    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Check if we're an admin.
    let isAdmin = false;

    if (session && has_role(session, "admin"))
        isAdmin = true;

    const [requireItems, setRequireItems] = useState(true);

    const limit = 10;
    const { data, fetchNextPage, refetch } = api.updateLog.getAll.useInfiniteQuery({
        limit: limit
    },
    {
        getNextPageParam: (lastPage) => lastPage.nextCur
    });

    const loadMore = () => {
        void fetchNextPage();
    }

    const updateLogs: UpdateLogWithUser[] = [];

    if (data) {
        data.pages.map((pg) => {
            updateLogs.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }

    // Mutations.
    const addMut = api.updateLog.add.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Add Update Log Entry");
                errorCtx.setMsg("Failed to add update log entry.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Successfully Added Update Log Entry!");
                successCtx.setMsg("Successfully added update log entry!");

                ScrollToTop();

                refetch();
            }
        }
    });

    const [addMsg, setAddMsg] = useState<string | undefined>(undefined);

    const checkAndAddMsg = () => {
        if (addMsg && addMsg.length > 0) {
            addMut.mutate({
                msg: addMsg
            });
        } else if (errorCtx) {
            errorCtx.setTitle("Message Empty");
            errorCtx.setMsg("Update log message is empty. Aborting...");

            ScrollToTop();
        }
    }

    return (
        <>
            <div className="updatelog">
                {!data || updateLogs.length > 0 ? (
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={loadMore}
                        loader={<Loader key="loader" />}
                        hasMore={requireItems}
                        useWindow={false}
                    >
                        <table className="updatelog-table">
                            <tbody>
                                {updateLogs.map((update) => {
                                    return (
                                        <Row
                                            key={`updatelog-${update.id.toString()}`}
                                            update={update}
                                            showUser={showUser}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    </InfiniteScroll>
                ) : (
                    <p>No updates found</p>
                )}
            </div>
            {isAdmin && (
                <div className="flex flex-wrap justify-center gap-2">
                    <input
                        onChange={(e) => {
                            const val = e.currentTarget.value;

                            setAddMsg(val);
                        }}
                        onKeyUp={(e) => {
                            if (e.key == "Enter")
                                checkAndAddMsg();  
                        }}
                        className="form-input sm:w-2/3"
                    />
                    <button
                        onClick={(e) => {
                            e.preventDefault();

                            checkAndAddMsg();
                        }}
                        className="button button-primary w-full sm:w-24"
                    >Add!</button>
                </div>
            )}
        </>
    );
}

function Row ({
    update,
    showUser
} : {
    update: UpdateLogWithUser,
    showUser?: boolean
}) {
    // Retrieve session.
    const { data: session } = useSession();

    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Check if we're admin.
    let isAdmin = false;

    if (session && has_role(session, "admin"))
        isAdmin = true;

    const [dateStr, setDateStr] = useState<string | undefined>(undefined);

    useEffect(() => {
        const dateFormatted = dateFormat(update.createdAt, dateFormatThree);

        if (!dateStr)
            setDateStr(dateFormatted);
    }, [update.createdAt, dateStr])

    const [editMode, setEditMode] = useState(false);
    const [msg, setMsg] = useState(update.msg);

    // Mutations.
    const updateMut = api.updateLog.update.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Update Log Entry");
                errorCtx.setMsg("Failed to update log entry.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Successfully Updated Log Entry!");
                successCtx.setMsg("Successfully updated log entry!");

                setEditMode(false);

                ScrollToTop();
            }
        }
    });

    const deleteMut = api.updateLog.del.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Delete Update Log Entry");
                errorCtx.setMsg("Failed to delete update log entry.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Successfully Deleted Update Log Entry!");
                successCtx.setMsg("Successfully deleted update log entry!");

                ScrollToTop();
            }
        }
    });

    return (
        <tr>
            <td className="ul-pulse">
                <div className="w-2 h-2"><span className=" animate-pulse inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span></div>
            </td>
            {dateStr && (
                <td className="ul-date">
                    {dateStr}
                </td>
            )}
            <td className="ul-msg">
                {editMode && isAdmin ? (
                    <input
                        defaultValue={update.msg}
                        onChange={(e) => {
                            const val = e.currentTarget.value;

                            setMsg(val);  
                        }}
                        onKeyUp={(e) => {
                            if (e.key == "Enter") {
                                updateMut.mutate({
                                    id: update.id,
                                    msg: msg
                                });
                            }
                        }}
                        className="form-input w-auto"
                    />
                ) : (
                    <Markdown>
                        {msg}
                    </Markdown>
                )}
            </td>
            {showUser && (
                <td className="ul-author">
                    {update.user ? (
                        <span>
                            <UserRowGrid
                                user={update.user}
                                showInline={true}
                                avatarWidth={32}
                                avatarHeight={32}
                            />
                        </span>
                    ) : (
                        <span>System</span>
                    )}
                </td>
            )}
            {session && has_role(session, "admin") && (
                <td className="ul-actions">
                    <button
                        onClick={(e) => {
                            e.preventDefault();

                            setEditMode(!editMode);
                        }}
                    >
                        <EditIcon
                            className="w-4 h-4 fill-green-600"
                        />
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();

                            const yes = confirm("Are you sure you want to delete this update log entry?");

                            if (yes) {
                                deleteMut.mutate({
                                    id: update.id
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