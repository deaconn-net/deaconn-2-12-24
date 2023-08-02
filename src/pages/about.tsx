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
                <div className="content-item">
                    <h1>About Us</h1>
                    <p>This is the start of our about us page!</p>
                </div>
            </Wrapper>
        </>
    );
}
export default Page;