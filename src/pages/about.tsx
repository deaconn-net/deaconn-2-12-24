import { type NextPage } from "next";

import Meta from "@components/meta";
import Wrapper from "@components/wrapper";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<GlobalPropsType> = ({
    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title="About - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    <h1>About Us</h1>
                    <p>This is the start of our about us page!</p>
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps() {
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps
        }
    }
}

export default Page;