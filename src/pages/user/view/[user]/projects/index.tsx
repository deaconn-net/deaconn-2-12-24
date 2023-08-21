import { type GetServerSidePropsContext, type NextPage } from "next";

import { type User } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import ProjectBrowser from "@components/user/project/browser";
import NotFound from "@components/error/not_found";
import UserView from "@components/user/view";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<{
    user?: User,
} & GlobalPropsType> = ({
    user,

    footerServices,
    footerPartners
}) => {    
    return (
        <>
            <Meta
                title={`Projects - ${user?.name ?? "Not Found"} - Users - Deaconn`}
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {user ? (
                        <UserView
                            user={user}
                            view="projects"
                        >
                            <div className="content-item">
                                <h1>Projects</h1>
                                <ProjectBrowser
                                    userId={user.id}
                                    small={true}
                                />
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