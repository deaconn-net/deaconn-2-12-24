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
import Home2Icon from "./icons/header/home2";

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
                        className="nav-item-icon fill-white"
                    />
                ) : (
                    <MobileMenuIcon
                        className="nav-item-icon fill-white"
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
                        href="/"
                        className={`nav-link ${location == "/" ? "nav-active" : ""}`}
                    >
                        <li className="nav-item">
                            <IconAndText
                                icon={
                                    <Home2Icon
                                        className="nav-item-icon fill-white"
                                    />
                                }
                                text={<>Home</>}
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
                                        className="nav-item-icon fill-white"
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
                                        className="nav-item-icon fill-white"
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
                                        className="nav-item-icon fill-white"
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
                                                className="nav-item-icon fill-white"
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
                                            className="nav-item-icon fill-white"
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