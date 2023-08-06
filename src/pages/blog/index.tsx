import { type NextPage } from "next";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import ArticleBrowser from "@components/blog/article/browser";

const Page: NextPage = () => {
    return (
        <>
            <Meta
                title="Blog - Deaconn"
                description="Deaconn's blog includes artiles on technology, programming, security, networking, and more!"
            />
            <Wrapper>
                <div className="content-item">
                    <h1>Blog</h1>
                    <ArticleBrowser />
                </div>
            </Wrapper>
        </>
    );
}

export default Page;