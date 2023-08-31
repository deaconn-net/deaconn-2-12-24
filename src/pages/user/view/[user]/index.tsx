import { type User } from "@prisma/client";
import { type GetServerSidePropsContext, type NextPage } from "next";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import NotFound from "@components/error/NotFound";
import UserView from "@components/user/View";

import { dateFormat, dateFormatTwo } from "@utils/Date";

import Markdown from "@components/markdown/Markdown";

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
                breadcrumbs={[
                    {
                        name: "Profiles"
                    },
                    ...(user ? [{
                        name: user.name ?? "User",
                        url: `/user/view/${user.url ? user.url : `$${user.id.toString()}`}`
                    }] : [])
                ]}
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {user ? (
                        <UserView
                            user={user}
                            view="general"
                            showDataBg={true}
                        >
                            <div className="content-item">
                                <h1>General</h1>
                                {!user.aboutMe && !user.showEmail && !birthday && (
                                    <p>No general information to show.</p>
                                )}
                                {user.aboutMe && (
                                    <div className="p-6">
                                        <h3>About Me</h3>
                                        <Markdown>
                                            {user.aboutMe}
                                        </Markdown>
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
    // Retrieve user ID.
    const { params } = ctx;

    const userId = params?.user?.toString();

    // Initialize user.
    let user: User | null = null;

    // If user ID is found, retrieve user.
    if (userId) {
        let lookupUrl = true;

        if (userId[0] == "$")
            lookupUrl = false;

        user = await prisma.user.findFirst({
            where: {
                ...(lookupUrl && {
                    url: userId
                }),
                ...(!lookupUrl && {
                    id: userId.substring(1)
                })
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            user: JSON.parse(JSON.stringify(user))
        }
    };
}


export default Page;