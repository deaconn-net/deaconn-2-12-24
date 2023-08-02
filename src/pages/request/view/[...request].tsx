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
                <div className="content-item">
                    <h1>Request View</h1>
                    <p>This is the request view page!</p>
                </div>
            </Wrapper>
        </>
    );
};
export default Page;