import Meta from "@components/Meta";
import Wrapper from "@components/Wrapper";
import NotFound from "@components/error/NotFound";
import { type GlobalPropsType } from "@utils/GlobalProps";

export default function Page ({
    footerServices,
    footerPartners
} : GlobalPropsType) {
    return (
        <>
            <Meta
                title="Not Found - Deaconn"
            />
            <Wrapper
                footerPartners={footerPartners}
                footerServices={footerServices}
            >
                <NotFound />
            </Wrapper>
        </>
    )
}