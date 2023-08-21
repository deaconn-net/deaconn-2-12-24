import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Partner } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import PartnerForm from '@components/forms/partner/new';
import NoPermissions from "@components/errors/no_permissions";

import { has_role } from "@utils/user/auth";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";
import NotFound from "@components/errors/not_found";

const Page: NextPage<{
    authed: boolean,
    partner?: Partner
} & GlobalPropsType> = ({
    authed,
    partner,
    
    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`Editing Partner ${partner?.name ?? "N/A"} - Partners - Deaconn`}
                robots="noindex"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {(authed && partner) ? (
                        <>
                            <h1>Edit Partner</h1>
                            <PartnerForm
                                partner={partner}
                            />
                        </>
                    ) : (
                        <>
                            {partner ? (
                                <NoPermissions />
                            ) : (
                                <NotFound item="Partner" />
                            )}
                        </>
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

    // Retrieve lookup ID.
    const { params } = ctx;

    const lookupId = params?.id?.toString();

    // Initialize partner.
    let partner: Partner | null = null;

    // Retrieve partner if we have a lookup ID and are authenticated.
    if (lookupId && authed) {
        partner = await prisma.partner.findFirst({
            where: {
                id: Number(lookupId)
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return { 
        props: {
            ...globalProps,
            authed: authed,
            partner: partner
        }
    };
}

export default Page;