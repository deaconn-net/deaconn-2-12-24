import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Partner } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import Form from '@components/forms/partner/new';
import NoPermissions from "@components/errors/no_permissions";

import { has_role } from "@utils/user/auth";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

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
                title="New Partner - Partners - Deaconn"
                robots="noindex"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {authed ? (
                    <div className="content-item">
                        <h1>{partner ? "Save" : "Create"} Partner</h1>
                        <Form
                            partner={partner}
                        />
                    </div>
                ) : (
                    <NoPermissions />
                )}

            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { query } = ctx;

    const session = await getSession(ctx);

    // Check if we're authenticated.
    let authed = false;

    if (session && (has_role(session, "contributor") || has_role(session, "admin")))
        authed = true;

    const lookup_id = query?.id;
    const lookup_url = query?.url;

    let partner: Partner | null = null;

    if (authed && (lookup_id || lookup_url)) {
        partner = await prisma.partner.findFirst({
            where: {
                ...(lookup_id && {
                    id: Number(lookup_id.toString())
                }),
                ...(lookup_url && {
                    url: lookup_url.toString()
                })
            }
        });
    }

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