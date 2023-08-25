import Link from "next/link";
import { type NextPage } from "next";

import { signIn, signOut, useSession } from "next-auth/react";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";
import IconAndText from "@components/containers/icon_and_text";
import DiscordIcon from "@components/icons/social/discord";
import GithubIcon from "@components/icons/social/github";
import GoogleIcon from "@components/icons/social/google";

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
                <div className="flex flex-col gap-4 justify-center items-center">
                    <h2>Login Options</h2>
                    <div className="bg-gray-800 p-6 flex flex-col gap-4">
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
                                                    classes={[
                                                        "w-10",
                                                        "h-10",
                                                        "fill-white"
                                                    ]}
                                                />
                                            }
                                            text={<span className="text-lg text-center">Discord</span>}
                                            inline={true}
                                            classes={["gap-3", "justify-center"]}
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
                                                    classes={[
                                                        "w-10",
                                                        "h-10",
                                                        "fill-white"
                                                    ]}
                                                />
                                            }

                                            text={<span className="text-lg">GitHub</span>}
                                            inline={true}
                                            classes={["gap-3", "justify-center"]}
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
                                                    classes={[
                                                        "w-10",
                                                        "h-10",
                                                        "fill-white"
                                                    ]}
                                                />
                                            }
                                            text={<span className="text-lg">Google</span>}
                                            inline={true}
                                            classes={["gap-3", "justify-center"]}
                                        />
                                    </button>
                                </>
                            )}
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