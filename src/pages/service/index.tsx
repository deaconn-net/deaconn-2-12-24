import { type NextPage } from "next";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import ServiceBrowser from "@components/service/browser";

const Page: NextPage = () => {
    return (
        <>
            <Meta
                title="Services - Deaconn"
                description="Find services offered by Deaconn ranging from bots to network firewalls!"
            />
            <Wrapper>
                <div className="content-item">
                    <h1>Services</h1>
                    <ServiceBrowser />
                </div>
            </Wrapper>
        </>
    );
}

export default Page;