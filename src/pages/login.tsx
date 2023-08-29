import Link from "next/link";
import { type NextPage } from "next";

import { signIn, signOut, useSession } from "next-auth/react";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import IconAndText from "@components/containers/IconAndText";
import DiscordIcon from "@components/icons/social/Discord";
import GithubIcon from "@components/icons/social/Github";
import GoogleIcon from "@components/icons/social/Google";

const Page: NextPage<GlobalPropsType> = ({
    footerServices,
    footerPartners
}) => {
    const { data: session } = useSession();
    return (
        <>
            <Meta
                title="Home - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="flex justify-center">
                    <div className="content-item2">
                        <div>
                            <h1>Login Options</h1>
                        </div>
                        <div className="flex flex-col gap-4">
                            <p>Please make a <Link href="/request/new">request</Link> if you&apos;re having issues signing in!</p>
                            <div className="flex flex-col gap-4">
                                {session?.user ? (
                                    <button
                                        className="login-button"
                                        onClick={() => {
                                            signOut();
                                        }}
                                    >
                                        <span className="text-lg">Sign Out</span>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="login-button"
                                            onClick={() => {
                                                signIn("discord");
                                            }}
                                        >
                                            <IconAndText
                                                icon={
                                                    <DiscordIcon
                                                        className="w-10 h-10 fill-white"
                                                    />
                                                }
                                                text={<span className="text-lg text-center">Discord</span>}
                                                inline={true}
                                                className="gap-3 justify-center"
                                            />
                                        </button>
                                        <button
                                            className="login-button"
                                            onClick={() => {
                                                signIn("github");
                                            }}
                                        >
                                            <IconAndText
                                                icon={
                                                    <GithubIcon
                                                        className="w-10 h-10 fill-white"
                                                    />
                                                }

                                                text={<span className="text-lg">GitHub</span>}
                                                inline={true}
                                                className="gap-3 justify-center"
                                            />
                                        </button>
                                        <button
                                            className="login-button"
                                            onClick={() => {
                                                signIn("google");
                                            }}
                                        >
                                            <IconAndText
                                                icon={
                                                    <GoogleIcon
                                                        className="w-10 h-10 fill-white"
                                                    />
                                                }
                                                text={<span className="text-lg">Google</span>}
                                                inline={true}
                                                className="gap-3 justify-center"
                                            />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
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
    };
}

export default Page;