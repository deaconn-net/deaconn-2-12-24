import { type NextPage } from "next";

import Meta from "@components/Meta";
import Wrapper from "@components/Wrapper";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

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
                <div className="content-item2">
                    <div>
                        <h1>About Us</h1>
                    </div>
                    <div>
                        <p>This is the start of our about us page!</p>
                    </div>
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