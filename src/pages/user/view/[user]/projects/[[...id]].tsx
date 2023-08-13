import { useEffect, useState } from "react";
import { type GetServerSidePropsContext, type NextPage } from "next";

import { type User } from "@prisma/client";
import { type UserProjectWithSources } from "~/types/user/project";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import ProjectBrowser from "@components/user/project/browser";
import NotFound from "@components/errors/not_found";
import UserView from "@components/user/view";

import { type GlobalPropsType } from "@utils/global_props";
import { dateFormat, dateFormatThree } from "@utils/date";

import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import IconAndText from "@components/containers/icon_and_text";
import Link from "next/link";
import { SourceCode } from "eslint";
import SourceIcon from "@utils/icons/source";

const Page: NextPage<{
    user?: User,
    project?: UserProjectWithSources
} & GlobalPropsType> = ({
    user,
    project,

    footerServices,
    footerPartners
}) => {
    const [startDate, setStartDate] = useState<string | undefined>(undefined);
    const [endDate, setEndDate] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (project?.startDate)
            setStartDate(dateFormat(project.startDate, dateFormatThree) ?? undefined);
        
        if (project?.endDate)
            setEndDate(dateFormat(project.endDate, dateFormatThree) ?? undefined);
    }, [project]);
    
    return (
        <>
            <Meta
                title={`${project ? project.name + " - " : ""}Projects - ${user?.name ?? "Not Found"} - Users - Deaconn`}
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {user ? (
                        <UserView
                            user={user}
                            view="projects"
                        >
                            <div className="content-item">
                                {project ? (
                                    <>
                                        <h2>{project.name}</h2>
                                        {startDate && (
                                            <p><span className="text-lg font-bold">Start Date</span> - <span className="italic">{startDate}</span></p>
                                        )}
                                        {endDate && (
                                            <p><span className="text-lg font-bold">End Date</span> - <span className="italic">{endDate}</span></p>
                                        )}
                                        <ReactMarkdown className="markdown">
                                            {project.details ?? ""}
                                        </ReactMarkdown>
                                        {project.sources.length > 0 && (
                                            <div className="project-sources">
                                                {project.sources.map((source) => {
                                                    return (
                                                        <Link
                                                            href={source.url}
                                                            key={`project-source-${source.projectId.toString()}-${source.url}`}
                                                            className="project-source"
                                                            target="_blank"
                                                        >
                                                            <IconAndText
                                                                icon={
                                                                    <SourceIcon
                                                                        classes={[
                                                                            "w-10",
                                                                            "h-10",
                                                                            "fill-white"
                                                                        ]}
                                                                    />
                                                                }
                                                                text={
                                                                    <>{source.title}</>
                                                                }
                                                                inline={true}
                                                            />
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h1>Projects</h1>
                                        <ProjectBrowser
                                            userId={user.id}
                                            small={true}
                                        />
                                    </>
                                )}
                            </div>
                        </UserView>
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

    const userId = params?.user?.toString();
    const projectId = params?.id?.[0]?.toString();

    let user: User | null = null;
    let project: UserProjectWithSources | null = null;

    if (userId) {
        let lookup_url = true;

        if (userId[0] == "$") {
            lookup_url = false;
        }

        user = await prisma.user.findFirst({
            where: {
                ...(lookup_url && {
                    url: userId
                }),
                ...(!lookup_url && {
                    id: userId.substring(1)
                })
            }
        });

        if (projectId) {
            project = await prisma.userProject.findFirst({
                where: {
                    id: Number(projectId),
                    user: {
                        ...(lookup_url && {
                            url: userId
                        }),
                        ...(!lookup_url && {
                            id: userId.substring(1)
                        })
                    }
                },
                include: {
                    sources: true
                }
            })
        }
    }

    return {
        props: {
            user: JSON.parse(JSON.stringify(user)),
            project: JSON.parse(JSON.stringify(project))
        }
    };
}


export default Page;