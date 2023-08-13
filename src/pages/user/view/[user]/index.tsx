import { type User } from "@prisma/client";
import { type GetServerSidePropsContext, type NextPage } from "next";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import NotFound from "@components/errors/not_found";
import UserView from "@components/user/view";

import { dateFormat, dateFormatTwo } from "@utils/date";

import { ReactMarkdown } from "react-markdown/lib/react-markdown";

const Page: NextPage<{
    user?: User
} & GlobalPropsType> = ({
    user,

    footerServices,
    footerPartners
}) => {
    const birthday = (user?.birthday) ? dateFormat(user?.birthday, dateFormatTwo) : null;

    return (
        <>
            <Meta
                title={`${user?.name ?? "Not Found"} - Users - Deaconn`}
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {user ? (
                        <UserView
                            user={user}
                            view="general"
                        >
                            <div className="content-item">
                                <h1>General</h1>
                                {!user.aboutMe && !user.showEmail && !birthday && (
                                    <p>No general information to show.</p>
                                )}
                                {user.aboutMe && (
                                    <div className="p-6">
                                        <h3>About Me</h3>
                                        <ReactMarkdown
                                            className="markdown"
                                        >{user.aboutMe}</ReactMarkdown>
                                    </div>
                                )}
                                {user.showEmail && user.email && (
                                    <div className="p-6">
                                        <h3>Email</h3>
                                        <p className="italic">{user.email}</p>
                                    </div>
                                )}
                                {birthday && (
                                    <div className="p-6">
                                        <h3>Birthday</h3>
                                        <p className="italic">{birthday}</p>
                                    </div>
                                )}
                            </div>
                        </UserView>
                    ) : (
                        <NotFound item="User" />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve parameters.
    const { params } = ctx;

    const user_id = params?.user?.toString();

    let user: User | null = null;

    if (user_id) {
        let lookup_url = true;

        if (user_id[0] == "$") {
            lookup_url = false;
        }

        user = await prisma.user.findFirst({
            where: {
                ...(lookup_url && {
                    url: user_id
                }),
                ...(!lookup_url && {
                    id: user_id.substring(1)
                })
            }
        });
    }

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            user: JSON.parse(JSON.stringify(user))
        }
    };
}


export default Page;