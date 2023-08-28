import { useContext } from "react";
import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type Partner } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/error/no_permissions";

import { api } from "@utils/api";
import { has_role } from "@utils/user/auth";
import { ScrollToTop } from "@utils/scroll";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

import PartnerForm from "@components/forms/partner/new";

const Page: NextPage<{
    authed: boolean,
    partners?: Partner[],
} & GlobalPropsType> = ({
    authed,
    partners,

    footerServices,
    footerPartners
}) => {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Prepare mutations.
    const partnerDeleteMut = api.partner.delete.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Partner Not Deleted");
                errorCtx.setMsg("Partner not deleted successfully.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Partner Deleted!");
                successCtx.setMsg("Partner deleted successfully.");

                ScrollToTop();
            }
        }
    });

    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            {authed ? (
                <div className="content-item">
                    <h2>Admin Panel</h2>
                    <AdminSettingsPanel view="partners">
                        <div className="flex flex-col gap-4">
                            <div className="content-item">
                                <h2>Add Partner</h2>
                                <PartnerForm />
                            </div>
                            <div className="content-item">
                                <h2>Existing Partners</h2>
                                <div className="flex gap-4">
                                    {partners?.map((partner) => {
                                        // Compile links.
                                        const editUrl = `/admin/partner/edit/${partner.id.toString()}`;

                                        return (
                                            <div
                                                key={`admin-partners-${partner.id.toString()}`}
                                                className="p-6 bg-cyan-900 flex flex-col gap-2 rounded-md"
                                            >
                                                <div className="flex flex-col gap-2 items-center">
                                                    <h2 className="text-center">{partner.name}</h2>
                                                    <p className="italic">
                                                        <Link
                                                            href={partner.url}
                                                            target="_blank"
                                                        >
                                                            {partner.url}
                                                        </Link>
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Link
                                                        href={editUrl}
                                                        className="button button-primary"
                                                    >Edit</Link>
                                                    <button
                                                        className="button button-danger"
                                                        onClick={(e) => {
                                                            e.preventDefault();

                                                            const yes = confirm("Are you sure you want to delete this partner?");

                                                            if (yes) {
                                                                partnerDeleteMut.mutate({
                                                                    id: partner.id
                                                                });
                                                            }

                                                            ScrollToTop();
                                                        }}
                                                    >Delete</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </AdminSettingsPanel>
                </div>
            ) : (
                <NoPermissions />
            )}
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getSession(ctx);

    // Make sure we're authenticated.
    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Initialize partners.
    let partners: Partner[] | undefined = undefined;

    // If we're authenticated, retrieve partners.
    if (authed)
        partners = await prisma.partner.findMany();

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            partners: partners ? JSON.parse(JSON.stringify(partners)) : null
        }
    }
}

export default Page;