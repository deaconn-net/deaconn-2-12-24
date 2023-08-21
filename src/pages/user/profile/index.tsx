import { getSession } from "next-auth/react";
import { type GetServerSidePropsContext, type NextPage } from "next";

import { type User } from "@prisma/client";
import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import UserSettingsPanel from "@components/user/settings_panel";
import GeneralForm from "@components/forms/user/general";
import NotSignedIn from "@components/error/not_signed_in";

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
                title="My Profile - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item"> 
                    {user ? (
                        <UserSettingsPanel view="general">
                            <div className="content-item">
                                <h2>General</h2>
                                <GeneralForm
                                    user={user}
                                />
                            </div>
                        </UserSettingsPanel>
                    ) : (
                        <NotSignedIn />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getSession(ctx);
   
    // Initialize user and skill.
    let user: User | null = null;

    // If signed in, retrieve user.
    if (session?.user) {
        // Retrieve user.
        user = await prisma.user.findFirst({
            where: {
                id: session.user.id
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