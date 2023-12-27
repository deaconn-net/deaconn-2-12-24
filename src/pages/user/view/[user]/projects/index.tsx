import { type GetServerSidePropsContext } from "next";

import { UserPublicSelect, type UserPublic } from "~/types/user/user";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import ProjectBrowser from "@components/user/project/Browser";
import NotFound from "@components/error/NotFound";
import UserView from "@components/user/View";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

export default function Page ({
    user,

    footerServices,
    footerPartners
} : {
    user?: UserPublic
} & GlobalPropsType) {   
    return (
        <>
            <Meta
                title={`Projects - ${user?.name ?? "Not Found"} - Users - Deaconn`}
            />
            <Wrapper
                breadcrumbs={[
                    {
                        name: "Profiles"
                    },
                    ...(user ? [{
                        name: user.name ?? "User",
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}`
                    }] : []),
                    ...(user ? [{
                        name: `Projects`,
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}/projects`
                    }] : [])
                ]}

                footerServices={footerServices}
                footerPartners={footerPartners}
            >
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
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve user ID.
    const { params, res } = ctx;

    const userId = params?.user?.toString();

    // Initialize user.
    let user: UserPublic | null = null;

    // If user ID is found, retrieve user.
    if (userId) {
        let lookupUrl = true;

        if (userId[0] == "$")
            lookupUrl = false;

        user = await prisma.user.findFirst({
            select: UserPublicSelect,
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

    // Return 404 if user is not found.
    if (!user)
        res.statusCode = 404;

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            user: JSON.parse(JSON.stringify(user))
        }
    };
}