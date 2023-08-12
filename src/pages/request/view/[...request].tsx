import { type NextPage } from "next";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<GlobalPropsType> = ({
    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title="View Request - Requests - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    <h1>Request View</h1>
                    <p>This is the request view page!</p>
                </div>
            </Wrapper>
        </>
    );
};

export async function getServerSideProps() {
    const globalProps = GlobalProps();

    return {
        props: {
            ...globalProps
        }
    }
}
export default Page;