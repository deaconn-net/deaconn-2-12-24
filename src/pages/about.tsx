import Meta from "@components/meta";
import Wrapper from "@components/wrapper";
import { type NextPage } from "next";

const Page: NextPage = () => {
    return (
        <>
            <Meta
                title="About - Deaconn"
            />
            <Wrapper>
                <div className="content">
                    <p>About</p>
                </div>
            </Wrapper>
        </>
    );
}
export default Page;