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
        <footer>
            <div className="footer-content">
                <div className="footer-section">
                    <div className="content-item">
                        <h3>Links</h3>
                        <ul className="footer-list">
                            <li className="footer-link"><Link href="/">Home</Link></li>
                            <li className="footer-link"><Link href="/service">Services</Link></li>
                            <li className="footer-link"><Link href="/blog">Blog</Link></li>
                            <li className="footer-link"><Link href="/about">About Us</Link></li>
                            <li className="footer-link"><Link href="/request">My Requests</Link></li>
                            <li className="footer-link"><Link href="/request/new">New Request</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-section">
                    <div className="content-item">
                        <h3>Services</h3>
                        <ul className="footer-list">
                            {services && services.length > 0 ? (
                                <>
                                    {services.map((service) => {
                                        const viewLink = "/service/view/" + service.url;

                                        return (
                                            <li key={"footer-service-" + service.id.toString()} className="footer-link"><Link href={viewLink}>{service.name}</Link></li>
                                        );
                                    })}

                                </>
                            ) : (
                                <p>No services.</p>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="footer-section">
                    <div className="flex flex-col gap-4">
                        <div className="content-item">
                            <h3>Partners</h3>
                            <ul className="footer-list">
                                {partners && partners.length > 0 ? (
                                    <>
                                        {partners.map((partner) => {
                                            return (
                                                <Link
                                                    href={`https://${partner.url}`}
                                                    className="footer-link"
                                                    key={`footer-partner-${partner.id.toString()}`}
                                                    target="_blank"
                                                >
                                                    <li>{partner.name}</li>
                                                </Link>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <p>No partners.</p>
                                )}
                            </ul>
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
                </div>
            </div>
        </footer>
    );
}