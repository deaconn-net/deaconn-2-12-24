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
import { HasRole } from "@utils/user/Auth";

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
    const isAdmin = HasRole(session, "ADMIN");

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
            <div className="w-full overflow-y-auto h-96">
                {!data || updateLogs.length > 0 ? (
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={loadMore}
                        loader={<Loader key="loader" />}
                        hasMore={requireItems}
                        useWindow={false}
                    >
                        <table className="w-full table-auto border-separate border-spacing-2">
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
                        className="w-full bg-cyan-900 p-2 rounded sm:w-2/3"
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
    const isAdmin = HasRole(session, "ADMIN");

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
        <tr className="p-2">
            {dateStr && (
                <td className="text-sm">
                    {dateStr}
                </td>
            )}
            <td>
                {editMode && isAdmin ? (
                    <input
                        className="w-full bg-cyan-900 p-2 rounded"
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
                    />
                ) : (
                    <Markdown>
                        {msg}
                    </Markdown>
                )}
            </td>
            {showUser && (
                <td>
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
            {HasRole(session, "ADMIN") && (
                <td className="flex gap-2">
                    <button
                        type="button"
                        className="button button-primary p-1"
                        onClick={() => setEditMode(!editMode)}
                    >
                        <EditIcon
                            className="w-4 h-4 fill-white"
                        />
                    </button>
                    <button
                        type="button"
                        className="button button-danger p-1"
                        onClick={() => {
                            const yes = confirm("Are you sure you want to delete this update log entry?");

                            if (yes) {
                                deleteMut.mutate({
                                    id: update.id
                                });
                            }
                        }}
                    >
                        <DeleteIcon
                            className="w-4 h-4 fill-white"
                        />
                    </button>
                </td>
            )}
        </tr>
    );
}