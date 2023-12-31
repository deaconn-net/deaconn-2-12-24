import React from "react";
import Link from "next/link";

import { type ServiceFooter } from "~/types/service";
import { type PartnerFooter } from "~/types/partner";

import TwitterIcon from "@components/icons/social/Twitter";
import GithubIcon from "@components/icons/social/Github";
import FacebookIcon from "@components/icons/social/Facebook";
import LinkedinIcon from "@components/icons/social/Linkedin";

export default function Footer ({
    services,
    partners
} : {
    services?: ServiceFooter[],
    partners?: PartnerFooter[]
}) {
    return (
        <footer className="p-6 bg-slate-800 z-20">
            <div className="container mx-auto flex flex-wrap text-center text-sm">
                <Section>
                    <div className="content-item">
                        <h3>Links</h3>
                        <List>
                            <ListItem url="/">Home</ListItem>
                            <ListItem url="/service">Services</ListItem>
                            <ListItem url="/blog">Blog</ListItem>
                            <ListItem url="/about">About Us</ListItem>
                            <ListItem url="/request">My Requests</ListItem>
                            <ListItem url="/request/new">New Request</ListItem>
                        </List>
                    </div>
                </Section>
                <Section>
                    <div className="content-item">
                        <h3>Services</h3>
                        <List>
                            {services && services.length > 0 ? (
                                <>
                                    {services.map((service, index) => {
                                        const viewLink = "/service/view/" + service.url;

                                        return (
                                            <ListItem
                                                key={`service-${index.toString()}`}
                                                url={viewLink}
                                            >
                                                {service.name}
                                            </ListItem>
                                        );
                                    })}

                                </>
                            ) : (
                                <p>No services.</p>
                            )}
                        </List>
                    </div>
                    </Section>
                <Section>
                    <div className="flex flex-col gap-4">
                        <div className="content-item">
                            <h3>Partners</h3>
                            <List>
                                {partners && partners.length > 0 ? (
                                    <>
                                        {partners.map((partner, index) => {
                                            return (
                                                <ListItem
                                                    key={`partner-${index.toString()}`}
                                                    url={`https://${partner.url}`}
                                                    newTab={true}
                                                >
                                                    {partner.name}
                                                </ListItem>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <p>No partners.</p>
                                )}
                            </List>
                        </div>
                        <div className="content-item">
                            <h3>Follow Us!</h3>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <Link
                                    href="https://twitter.com/deaconn_"
                                    target="_blank"
                                >
                                    <TwitterIcon
                                        className="w-6 h-6 fill-gray-400 hover:fill-white"
                                    />
                                </Link>
                                <Link
                                    href="https://github.com/deaconn-net"
                                    target="_blank"
                                >
                                    <GithubIcon
                                        className="w-6 h-6 fill-gray-400 hover:fill-white"
                                    />
                                </Link>
                                <Link
                                    href="https://www.facebook.com/deaconn.net"
                                    target="_blank"
                                >
                                    <FacebookIcon
                                        className="w-6 h-6 fill-gray-400 hover:fill-white"
                                    />
                                </Link>
                                <Link
                                    href="https://linkedin.com/company/89513696"
                                    target="_blank"
                                >
                                    <LinkedinIcon
                                        className="w-6 h-6 fill-gray-400 hover:fill-white"
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
        </footer>
    );
}

function Section ({
    children
} : {
    children: React.ReactNode
}) {
    return (
        <div className="p-6 w-full sm:w-1/3">
            {children}
        </div>
    )
}

function List ({
    children
} : {
    children: React.ReactNode
}) {
    return (
        <ul className="list-none flex flex-col gap-3">
            {children}
        </ul>
    )
}

function ListItem ({
    url,
    newTab = false,
    children
} : {
    url: string
    newTab?: boolean
    children: React.ReactNode
}) {
    return (
        <Link
            href={url}
            target={newTab ? "_blank" : undefined}
            className="hover:text-deaconn-link2"
        >
            {children}
        </Link>
    )
}