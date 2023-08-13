import { useEffect, useState } from "react";
import { type GetServerSidePropsContext, type NextPage } from "next";

import { type UserExperience, type User } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import ExperienceBrowser from "@components/user/experience/browser";
import NotFound from "@components/errors/not_found";
import UserView from "@components/user/view";

import { type GlobalPropsType } from "@utils/global_props";
import { dateFormat, dateFormatThree } from "@utils/date";

import { ReactMarkdown } from "react-markdown/lib/react-markdown";

const Page: NextPage<{
    user?: User,
    experience?: UserExperience
} & GlobalPropsType> = ({
    user,
    experience,

    footerServices,
    footerPartners
}) => {
    const [startDate, setStartDate] = useState<string | undefined>(undefined);
    const [endDate, setEndDate] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (experience?.startDate)
            setStartDate(dateFormat(experience.startDate, dateFormatThree) ?? undefined);
        
        if (experience?.endDate)
            setEndDate(dateFormat(experience.endDate, dateFormatThree) ?? undefined);
    }, [experience]);

    return (
        <>
            <Meta
                title={`${experience ? experience.title + " - " : ""}Experiences - ${user?.name ?? "Not Found"} - Users - Deaconn`}
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {user ? (
                        <UserView
                            user={user}
                            view="experiences"
                        >
                            <div className="content-item">
                                {experience ? (
                                    <>
                                        <h2>{experience.title}</h2>
                                        {startDate && (
                                            <p><span className="text-lg font-bold">Start Date</span> - <span className="italic">{startDate}</span></p>
                                        )}
                                        {endDate && (
                                            <p><span className="text-lg font-bold">End Date</span> - <span className="italic">{endDate}</span></p>
                                        )}
                                        <ReactMarkdown className="markdown">
                                            {experience.details ?? ""}
                                        </ReactMarkdown>
                                    </>
                                ) : (
                                    <>
                                        <h1>Experiences</h1>
                                        <ExperienceBrowser
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
    const experienceId = params?.id?.[0]?.toString();

    let user: User | null = null;
    let experience: UserExperience | null = null;

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

        if (experienceId) {
            experience = await prisma.userExperience.findFirst({
                where: {
                    id: Number(experienceId),
                    user: {
                        ...(lookup_url && {
                            url: userId
                        }),
                        ...(!lookup_url && {
                            id: userId.substring(1)
                        })
                    }
                }
            })
        }
    }

    return {
        props: {
            user: JSON.parse(JSON.stringify(user)),
            experience: JSON.parse(JSON.stringify(experience))
        }
    };
}


export default Page;