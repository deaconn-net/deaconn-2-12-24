import { useEffect, useState } from "react";
import { type GetServerSidePropsContext, type NextPage } from "next";

import { type UserExperience, type User } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import NotFound from "@components/error/not_found";
import UserView from "@components/user/view";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";
import { dateFormat, dateFormatThree } from "@utils/date";

import Markdown from "@components/markdown/markdown";

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
                                        <Markdown>
                                            {experience.details ?? ""}
                                        </Markdown>
                                    </>
                                ) : (
                                    <NotFound item="Experience" />
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
    // Retrieve user ID and experience ID.
    const { params } = ctx;

    const userId = params?.user?.toString();
    const experienceId = params?.id?.toString();

    // Initialize user and experience.
    let user: User | null = null;
    let experience: UserExperience | null = null;

    // If user ID is found, retrieve user and others.
    if (userId) {
        let lookupUrl = true;

        if (userId[0] == "$")
            lookupUrl = false;

        user = await prisma.user.findFirst({
            where: {
                ...(lookupUrl && {
                    url: userId
                }),
                ...(!lookupUrl && {
                    id: userId.substring(1)
                })
            }
        });

        // If experience ID is found, retrieve experience.
        if (experienceId) {
            experience = await prisma.userExperience.findFirst({
                where: {
                    id: Number(experienceId),
                    user: {
                        ...(lookupUrl && {
                            url: userId
                        }),
                        ...(!lookupUrl && {
                            id: userId.substring(1)
                        })
                    }
                }
            })
        }
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            user: JSON.parse(JSON.stringify(user)),
            experience: JSON.parse(JSON.stringify(experience))
        }
    };
}


export default Page;