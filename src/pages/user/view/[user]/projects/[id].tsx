import { useEffect, useState } from "react";
import { type GetServerSidePropsContext } from "next";

import { UserPublicSelect, type UserPublic } from "~/types/user/user";
import { type UserProjectWithSources } from "~/types/user/project";
import { type ProjectSource } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import NotFound from "@components/error/NotFound";
import UserView from "@components/user/View";
import Markdown from "@components/markdown/Markdown";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { dateFormat, dateFormatThree } from "@utils/Date";

import IconAndText from "@components/containers/IconAndText";
import Link from "next/link";
import SourceIcon from "@components/icons/Source";

export default function Page ({
    user,
    project,

    footerServices,
    footerPartners
} : {
    user?: UserPublic,
    project?: UserProjectWithSources
} & GlobalPropsType) {
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
                breadcrumbs={[
                    {
                        name: "Profiles"
                    },
                    ...(user ? [{
                        name: user.name ?? "User",
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}`
                    }] : []),
                    ...(user ? [{
                        name: `Projects`,
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}/projects`
                    }] : []),
                    ...(user && project ? [{
                        name: project.name,
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}/projects/${project.id.toString()}`
                    }] : [])
                ]}

                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {user ? (
                    <UserView
                        user={user}
                        view="projects"
                    >
                        {project ? (
                            <div className="content-item2">
                                <div>
                                    <h2>{project.name}</h2>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {startDate && (
                                        <p><span className="text-lg font-bold">Start Date</span> - <span className="italic">{startDate}</span></p>
                                    )}
                                    {endDate && (
                                        <p><span className="text-lg font-bold">End Date</span> - <span className="italic">{endDate}</span></p>
                                    )}
                                    <Markdown>
                                        {project.details ?? ""}
                                    </Markdown>
                                    {project.sources.length > 0 && (
                                        <div className="flex flex-wrap gap-4">
                                            {project.sources.map((source, index) => {
                                                return (
                                                    <Source
                                                        key={`source-${index.toString()}`}
                                                        source={source}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                    {project.openSource && (
                                        <div className="flex justify-center">
                                            <p>This project is <span className="text-green-400 font-bold">open source</span>!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <NotFound item="Project" />
                        )}
                    </UserView>
                ) : (
                    <NotFound item="User" />
                )}
            </Wrapper>
        </>
    );
}

function Source ({
    source
} : {
    source: ProjectSource
}) {
    return (
        <Link
            href={source.url}
            className="bg-cyan-700 hover:bg-cyan-600 p-4 rounded w-full sm:w-auto sm:min-w-[24rem] sm:max-w-full hover:text-white"
            target="_blank"
        >
            <IconAndText
                icon={
                    <SourceIcon
                        className="w-10 h-10 fill-white"
                    />
                }
                text={
                    <>{source.title}</>
                }
                inline={true}
            />
        </Link>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve user and project IDs.
    const { params, res } = ctx;

    const userId = params?.user?.toString();
    const projectId = params?.id?.toString();

    // Initialize user and project.
    let user: UserPublic | null = null;
    let project: UserProjectWithSources | null = null;

    // If user ID is found, retrieve user.
    if (userId) {
        let lookupUrl = true;

        if (userId[0] == "$")
            lookupUrl = false;

        user = await prisma.user.findFirst({
            select: UserPublicSelect,
            where: {
                ...(lookupUrl && {
                    url: userId
                }),
                ...(!lookupUrl && {
                    id: userId.substring(1)
                })
            }
        });

        // If project ID is found, retrieve project.
        if (projectId) {
            project = await prisma.userProject.findFirst({
                where: {
                    id: Number(projectId),
                    user: {
                        ...(lookupUrl && {
                            url: userId
                        }),
                        ...(!lookupUrl && {
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

    // Return 404 if project is not found.
    if (!project)
        res.statusCode = 404;

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            user: JSON.parse(JSON.stringify(user)),
            project: JSON.parse(JSON.stringify(project))
        }
    };
}