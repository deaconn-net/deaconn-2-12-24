import { useEffect, useState } from "react";
import { type GetServerSidePropsContext } from "next";

import { type UserExperience } from "@prisma/client";
import { UserPublicSelect, type UserPublic } from "~/types/user/user";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import NotFound from "@components/error/NotFound";
import UserView from "@components/user/View";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { dateFormat, dateFormatThree } from "@utils/Date";

import Markdown from "@components/markdown/Markdown";

export default function Page ({
    user,
    experience,

    footerServices,
    footerPartners
} : {
    user?: UserPublic
    experience?: UserExperience
} & GlobalPropsType) {
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
                breadcrumbs={[
                    {
                        name: "Profiles"
                    },
                    ...(user ? [{
                        name: user.name ?? "User",
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}`
                    }] : []),
                    ...(user ? [{
                        name: `Experiences`,
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}/experiences`
                    }] : []),
                    ...(user && experience ? [{
                        name: experience.title,
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}/experiences/${experience.id.toString()}`
                    }] : [])
                ]}

                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {user ? (
                        <UserView
                            user={user}
                            view="experiences"
                        >
                            {experience ? (
                                <div className="content-item2">
                                    <div>
                                        <h2>{experience.title}{experience.company ? ` @ ${experience.company}` : ``}</h2>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {startDate && (
                                            <p><span className="text-lg font-bold">Start Date</span> - <span className="italic">{startDate}</span></p>
                                        )}
                                        {endDate && (
                                            <p><span className="text-lg font-bold">End Date</span> - <span className="italic">{endDate}</span></p>
                                        )}
                                        {experience.company && (
                                            <p><span className="text-lg font-bold">Company</span> - <span className="italic">{experience.company}</span></p>
                                        )}
                                        <Markdown>
                                            {experience.details ?? ""}
                                        </Markdown>
                                    </div>
                                </div>
                            ) : (
                                <NotFound item="Experience" />
                            )}
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
    let user: UserPublic | null = null;
    let experience: UserExperience | null = null;

    // If user ID is found, retrieve user and others.
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