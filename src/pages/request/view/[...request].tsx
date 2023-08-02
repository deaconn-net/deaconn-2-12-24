import { type NextPage } from "next";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

const Page: NextPage = () => {
    return (
        <>
            <Meta
                title="View Request - Requests - Deaconn"
            />
            <Wrapper>
                <div className="content">
                    <p>Request View</p>
                </div>
            </Wrapper>
        </>
    );
};
export default Page;