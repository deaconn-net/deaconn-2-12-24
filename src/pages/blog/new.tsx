import { type GetServerSidePropsContext, type NextPage } from "next";

import Form from '@components/forms/article/new';
import Wrapper from "@components/wrapper";
import { prisma } from "@server/db";
import { type Article } from "@prisma/client";

const Page: NextPage<{
    article: Article | null
}> = ({
    article
}) => {
    return (
        <Wrapper>
            <div className="content">
                <h1>Create Article</h1>
                <Form
                    article={article ?? undefined}
                />
            </div>
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { query } = ctx;

    const lookup_id = query?.id;
    const lookup_url = query?.url;

    let article: Article | null = null;

    if (lookup_id || lookup_url) {
        article = await prisma.article.findFirst({
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
            article: JSON.parse(JSON.stringify(article))
        }
    }
}

export default Page;