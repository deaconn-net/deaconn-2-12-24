import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Partner } from "@prisma/client";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import PartnerForm from '@components/forms/partner/new';
import NoPermissions from "@components/errors/no_permissions";

import { has_role } from "@utils/user/auth";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<{
    authed: boolean,
    partner?: Partner
} & GlobalPropsType> = ({
    authed,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title="New Partner - Partners - Deaconn"
                robots="noindex"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {authed ? (
                        <>
                            <h1>Add Partner</h1>
                            <PartnerForm />
                        </>
                    ) : (
                        <NoPermissions />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getSession(ctx);

    // Check if we're authenticated.
    let authed = false;

    if (session && (has_role(session, "contributor") || has_role(session, "admin")))
        authed = true;

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return { 
        props: {
            ...globalProps,
            authed: authed
        }
    };
}

export default Page;