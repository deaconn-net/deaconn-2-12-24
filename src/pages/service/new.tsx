import { GetServerSidePropsContext, NextPage } from "next";
import { Deaconn } from '../../components/main';

import { ServiceForm } from '../../components/forms/service/new';

const Content: React.FC<{ lookupId?: number | null, lookupUrl?: string | null }> = ({ lookupId, lookupUrl }) => {
    return (
        <div className="content">
            <h1 className="text-3xl text-white font-bold italic">Create Service</h1>
            <ServiceForm
                lookupId={lookupId}
                lookupUrl={lookupUrl}
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
                    lookupUrl={lookupUrl}
                />
            }
        />
    );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const lookupId = (ctx.query.id) ? Number(ctx.query.id) : null;
    const lookupUrl = (ctx.query.url) ? ctx.query.url : null;

    return { props: { lookupId: lookupId, lookupUrl: lookupUrl } };
}

export default Page;