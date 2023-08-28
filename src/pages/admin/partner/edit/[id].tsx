import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Partner } from "@prisma/client"

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/error/no_permissions";
import NotFound from "@components/error/not_found";

import { has_role } from "@utils/user/auth";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";
import PartnerForm from "@components/forms/partner/new";

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
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            <div className="content-item">
                <h2>Admin Panel</h2>
                {(authed && partner) ? (
                    <AdminSettingsPanel view="partners">
                        <PartnerForm
                            partner={partner}
                        />
                    </AdminSettingsPanel>
                ) : (
                    <>
                        {!authed ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Partner" />
                        )}
                    </>
                )}
            </div>
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getSession(ctx);

    // Check if we have permissions.
    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Retrieve partner ID.
    const { params } = ctx;

    const partnerId = params?.id?.toString();

    // Initialize partner.
    let partner: Partner | null = null;

    // If we're authenticated and have a partner ID, retrieve partner.
    if (authed && partnerId) {
        partner = await prisma.partner.findFirst({
            where: {
                id: Number(partnerId)
            }
        })
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