import React from "react";
import Image from "next/image";
import Link from "next/link";

import { type User } from "@prisma/client"

import Tabs, { type TabItemType } from "@components/tabs/Tabs";

import { FormatSocialUrl } from "@utils/Social";
import WebsiteIcon from "@components/icons/social/Website";
import TwitterIcon from "@components/icons/social/Twitter";
import GithubIcon from "@components/icons/social/Github";
import LinkedinIcon from "@components/icons/social/Linkedin";
import FacebookIcon from "@components/icons/social/Facebook";

export default function UserView ({
    user,
    view,
    showDataBg,

    children
} : {
    user: User,
    view: string,
    showDataBg?: boolean

    children: React.ReactNode
}) {
    const baseUrl = `/user/view/${user?.url ? user.url : "$" + (user?.id ?? "")}`;

    // Compile tabs.
    const tabs: TabItemType[] = [
        {
            url: baseUrl,
            text: <>General</>,
            active: view == "general"
        },
        {
            url: `${baseUrl}/experiences`,
            text: <>Experiences</>,
            active: view == "experiences"
        },
        {
            url: `${baseUrl}/skills`,
            text: <>Skills</>,
            active: view == "skills"
        },
        {
            url: `${baseUrl}/projects`,
            text: <>Projects</>,
            active: view == "projects"
        }
    ];

    return (
        <div className="tab-menu-with-data">
            <div className="flex flex-col gap-4 !justify-normal">
                <div className="flex flex-col items-center justify-center gap-2">
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
                    {(user.website || user.socialTwitter || user.socialGithub || user.socialLinkedin || user.socialFacebook) && (
                        <div className="flex flex-wrap gap-2 items-center">
                            {user.website && (
                                <Link
                                    href={FormatSocialUrl(user.website, "website")}
                                    target="_blank"
                                >
                                    <WebsiteIcon
                                        className="w-6 h-6 stroke-gray-400 hover:stroke-white"
                                    />
                                </Link>
                            )}
                            {user.socialTwitter && (
                                <Link
                                    href={FormatSocialUrl(user.socialTwitter, "twitter")}
                                    target="_blank"
                                >
                                    <TwitterIcon
                                        className="w-6 h-6 fill-gray-400 hover:fill-white"
                                    />
                                </Link>
                            )}
                            {user.socialGithub && (
                                <Link
                                    href={FormatSocialUrl(user.socialGithub, "github")}
                                    target="_blank"
                                >
                                    <GithubIcon
                                        className="w-6 h-6 fill-gray-400 hover:fill-white"
                                    />
                                </Link>
                            )}
                            {user.socialLinkedin && (
                                <Link
                                    href={FormatSocialUrl(user.socialLinkedin, "linkedin")}
                                    target="_blank"
                                >
                                    <LinkedinIcon
                                        className="w-6 h-6 fill-gray-400 hover:fill-white"
                                    />
                                </Link>
                            )}
                            {user.socialFacebook && (
                                <Link
                                    href={FormatSocialUrl(user.socialFacebook, "facebook")}
                                    target="_blank"
                                >
                                    <FacebookIcon
                                        className="w-6 h-6 fill-gray-400 hover:fill-white"
                                    />
                                </Link>
                            )}
                        </div>
                    )}
                </div>
                <Tabs
                    items={tabs}
                    className="sm:w-64"
                />
            </div>

            <div className={showDataBg ? "bg-gradient-to-b from-deaconn-data to-deaconn-data2" : undefined}>
                {children}
            </div>
        </div>
    );
}