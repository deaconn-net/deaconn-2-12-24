import Meta from "@components/Meta";
import Wrapper from "@components/Wrapper";
import ServerError from "@components/error/ServerError";

export default function Page() {
    return (
        <>
            <Meta
                title="Server-Side Error - Deaconn"
            />
            <Wrapper>
                <ServerError />
            </Wrapper>
        </>
    )
}