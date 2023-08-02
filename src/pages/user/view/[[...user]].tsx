import { type User } from "@prisma/client";
import { type GetServerSidePropsContext, type NextPage } from "next";
import Link from "next/link";
import Image from "next/image";

import Wrapper from "@components/wrapper";

import ExperienceBrowser from "@components/user/experience/browser";
import ProjectBrowser from "@components/user/project/browser";
import SkillBrowser from "@components/user/skill/browser";
import NotFound from "@components/errors/not_found";
import Meta from "@components/meta";

import { prisma } from "@server/db";

import { dateFormat, dateFormatTwo } from "@utils/date";

import { ReactMarkdown } from "react-markdown/lib/react-markdown";

const Page: NextPage<{
    user: User | null,
    view: string
}> = ({
    user,
    view
}) => {
    const baseUrl = "/user/view/" + ((user?.url) ? user.url : "$" + (user?.id ?? ""));

    const birthday = (user?.birthday) ? dateFormat(user?.birthday, dateFormatTwo) : null;

    return (
        <>
            <Meta
                title={`Viewing ${user?.name ?? "Not Found"} ${view.charAt(0).toUpperCase() + view.slice(1)} - Users - Deaconn`}
            />
            <Wrapper>
                <div className="content-item">
                    {user ? (
                        <div className="flex flex-wrap">
                            <div className="w-full sm:w-1/12">
                                <div className="pb-6 flex flex-col items-center justify-center">
                                    {user.image && (
                                        <Image
                                            className="w-20 h-20"
                                            src={user.image}
                                            width={50}
                                            height={50}
                                            alt="User Avatar"
                                        />
                                    )}
                                    {user.title && (
                                        <p className="text-lg font-bold text-white">{user.title}</p>
                                    )}
                                    {user.name && (
                                        <p>{user.name}</p>
                                    )}
                                </div>
                                <ul className="list-none">
                                    <Link href={baseUrl}>
                                        <li className={"profile-item" + ((view == "general") ? " !bg-cyan-800" : "")}>General</li>
                                    </Link>
                                    <Link href={baseUrl + "/experiences"}>
                                        <li className={"profile-item" + ((view == "experiences") ? " !bg-cyan-800" : "")}>Experiences</li>
                                    </Link>
                                    <Link href={baseUrl + "/skills"}>
                                        <li className={"profile-item" + ((view == "skills") ? " !bg-cyan-800" : "")}>Skills</li>
                                    </Link>
                                    <Link href={baseUrl + "/projects"}>
                                        <li className={"profile-item" + ((view == "projects") ? " !bg-cyan-800" : "")}>Projects</li>
                                    </Link>
                                </ul>
                            </div>

                            <div className="w-full sm:w-11/12">
                                {view == "general" && (
                                    <>
                                        <h1>General</h1>
                                        {!user.aboutMe && !user.showEmail && !birthday && (
                                            <p>No general information to show.</p>
                                        )}
                                        {user.aboutMe && (
                                            <div className="p-6">
                                                <h3>About Me</h3>
                                                <ReactMarkdown
                                                    className="markdown"
                                                >{user.aboutMe}</ReactMarkdown>
                                            </div>
                                        )}
                                        {user.showEmail && user.email && (
                                            <div className="p-6">
                                                <h3>Email</h3>
                                                <p className="italic">{user.email}</p>
                                            </div>
                                        )}
                                        {birthday && (
                                            <div className="p-6">
                                                <h3>Birthday</h3>
                                                <p className="italic">{birthday}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                {view == "experiences" && (
                                    <div className="p-6">
                                        <h1>Experiences</h1>
                                        <ExperienceBrowser
                                            userId={user.id}
                                        />
                                    </div>
                                )}
                                {view == "skills" && (
                                    <div className="p-6">
                                        <h1>Skills</h1>
                                        <SkillBrowser
                                            userId={user.id}
                                        />
                                    </div>
                                )}
                                {view == "projects" && (
                                    <div className="p-6">
                                        <h1>Projects</h1>
                                        <ProjectBrowser
                                            userId={user.id}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <NotFound item="User" />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve parameters.
    const { params } = ctx;

    const user_id = params?.user?.[0];
    const view = params?.user?.[1] ?? "general";

    let user: User | null = null;

    if (user_id) {
        let lookup_url = true;

        if (user_id[0] == "$") {
            lookup_url = false;
        }

        user = await prisma.user.findFirst({
            where: {
                ...(lookup_url && {
                    url: user_id
                }),
                ...(!lookup_url && {
                    id: user_id.substring(1)
                })
            }
        });
    }

    return {
        props: {
            user: JSON.parse(JSON.stringify(user)),
            view: view
        }
    };
}


export default Page;