import { type NextPage } from "next";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

const Page: NextPage = () => {
    return (
        <>
            <Meta
                title="Editing User - Users - Deaconn"
            />
            <Wrapper>
                <div className="content">
                    <p>User Edit</p>
                </div>
            </Wrapper>
        </>
    );
}

export default Page;