import { GetServerSidePropsContext, NextPage } from "next";
import { Deaconn } from '../../components/main';

import { RequestForm } from '../../components/forms/request/new';

const Content: React.FC<{ lookupId?: number | null }> = ({ lookupId }) => {
    return (
        <div className="content">
            <h1 className="text-3xl text-white font-bold italic">Create Request</h1>
            <RequestForm
                lookupId={lookupId}
            />
        </div>
    )
}

const Page: NextPage<{ lookupId?: number | null, lookupUrl?: string | null }> = ({ lookupId, lookupUrl }) => {
    return (
        <Deaconn
            content={
                <Content
                    lookupId={lookupId}
                />
            }
        />
    );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const lookupId = (ctx.query.id) ? Number(ctx.query.id) : null;

    return { props: { lookupId: lookupId } };
}

export default Page;