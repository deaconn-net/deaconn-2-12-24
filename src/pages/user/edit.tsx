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
                <div className="content-item">
                    <h1>User Edit</h1>
                    <p>This is the user edit page!</p>
                </div>
            </Wrapper>
        </>
    );
}

export default Page;