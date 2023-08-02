import { type GetServerSidePropsContext, type NextPage } from "next";

import { type Partner } from "@prisma/client";

import Form from '@components/forms/partner/new';
import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import { prisma } from "@server/db";

const Page: NextPage<{
    partner: Partner | null
}> = ({
    partner
}) => {
    return (
        <>
            <Meta
                title="New Partner - Partners - Deaconn"
                robots="noindex"
            />
            <Wrapper>
                <div className="content">
                    <h1>Create Partner</h1>
                    <Form
                        partner={partner ?? undefined}
                    />
                </div>
            </Wrapper>
        </>
    );
}


export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { query } = ctx;

    const lookup_id = query?.id;
    const lookup_url = query?.url;

    let partner: Partner | null = null;

    if (lookup_id || lookup_url) {
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

    return { 
        props: { 
            partner: partner
        }
    };
}

export default Page;