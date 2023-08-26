import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

import Image from "next/image";

import IconAndText from "@components/containers/icon_and_text";

import ServicesIcon from "@components/icons/header/services";
import BlogIcon from "@components/icons/header/blog";
import AboutUsIcon from "@components/icons/header/aboutus";
import AccountIcon from "@components/icons/header/account";
import SignInIcon from "@components/icons/header/signinicon";
import MobileMenuIcon from "@components/icons/header/mobile_menu";
import MobileMenuCollapseIcon from "@components/icons/header/mobile_menu_collapse";

export default function Header () {
    const { data: session } = useSession();

    const router = useRouter();
    const location = router.pathname;

    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header>
            <button
                className="navbar-mobile-button"
                onClick={(e) => {
                    e.preventDefault();

                    setMobileOpen(!mobileOpen);
                }}
            >
                {mobileOpen ? (
                    <MobileMenuCollapseIcon
                        classes={[
                            "nav-item-icon",
                            "fill-white"
                        ]}
                    />
                ) : (
                    <MobileMenuIcon
                        classes={[
                            "nav-item-icon",
                            "fill-white"
                        ]}
                    />
                )}
            </button>
            <nav className={mobileOpen ? "block" : ""}>
                <ul className="nav-section">
                    <Link
                        href="/"
                        className={`nav-link`}
                    >
                        <li className="nav-item">
                            <Image
                                src="/images/header_banner.png"
                                className="h-16 p-2"
                                width={200}
                                height={72}
                                alt="Deaconn Banner"
                            />
                        </li>
                    </Link>
                    <Link
                        href="/service"
                        className={`nav-link ${location.includes("/service") ? "nav-active" : ""}`}
                    >
                        <li className="nav-item">
                            <IconAndText
                                icon={
                                    <ServicesIcon
                                        classes={[
                                            "nav-item-icon",
                                            "fill-white"
                                        ]}
                                    />
                                }
                                text={
                                    <>Services</>
                                }
                            />
                        </li>
                    </Link>
                    <Link
                        href="/blog"
                        className={`nav-link ${location.includes("/blog") ? "nav-active" : ""}`}
                    >
                        <li className="nav-item">
                            <IconAndText
                                icon={
                                    <BlogIcon
                                        classes={[
                                            "nav-item-icon",
                                            "fill-white"
                                        ]}
                                    />
                                }
                                text={
                                    <>Blog</>
                                }
                            />
                        </li>
                    </Link>
                    <Link
                        href="/about"
                        className={`nav-link ${location == "/about" ? "nav-active" : ""}`}
                    >
                        <li className="nav-item">
                            <IconAndText
                                icon={
                                    <AboutUsIcon
                                        classes={[
                                            "nav-item-icon",
                                            "fill-white"
                                        ]}
                                    />
                                }
                                text={
                                    <>About Us</>
                                }
                            />
                        </li>
                    </Link>
                    <div className="grow"></div>
                    {session ? (
                        <>
                            <Link
                                href="/user/profile"
                                className="nav-link" 
                            >
                                <li className="nav-item">
                                    <IconAndText
                                        icon={
                                            <AccountIcon
                                                classes={[
                                                    "nav-item-icon",
                                                    "fill-white"
                                                ]}
                                            />
                                        }
                                        text={
                                            <>Account</>
                                        }
                                    />
                                </li>
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="nav-link" 
                        >
                            <li className="nav-item">
                                <IconAndText
                                    icon={
                                        <SignInIcon
                                            classes={[
                                                "nav-item-icon",
                                                "fill-none",
                                                "stroke-white"
                                            ]}
                                        />
                                    }
                                    text={
                                        <>Sign In</>
                                    }
                                />
                            </li>
                        </Link>
                    )}
                </ul>
            </nav>
        </header>
    );
}