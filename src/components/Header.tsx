import React, { useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

import Image from "next/image";

import IconAndText from "@components/containers/IconAndText";

import ServicesIcon from "@components/icons/header/Services";
import BlogIcon from "@components/icons/header/Blog";
import AboutUsIcon from "@components/icons/header/AboutUs";
import AccountIcon from "@components/icons/header/Account";
import SignInIcon from "@components/icons/header/SignIn";
import MobileMenuIcon from "@components/icons/header/MobileMenu";
import { ViewPortCtx } from "./Wrapper";
import LeftArrowIcon from "./icons/LeftArrow";
import HomeIcon from "./icons/header/Home";

function NavItem ({
    link,
    newTab = false,
    active = false,
    className,
    children
} : {
    link: string
    newTab?: boolean
    active?: boolean
    className?: string
    children: React.ReactNode
}) {
    return (
        <Link
            href={link}
            className={typeof className !== "undefined" ? className : `h-full flex items-center p-2 text-sm hover:text-white hover:duration-150 ${active ? "text-white font-bold bg-cyan-800" : "text-gray-200"}`}
            target={newTab ? "_blank" : undefined}
        >
            {children}
        </Link>
    )
}

export default function Header () {
    const { data: session } = useSession();

    const router = useRouter();
    const location = router.pathname;

    // Figure out if this is our first render.
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;
    }, [firstRender])

    const isFirstRender = firstRender.current;

    const [mobileOpen, setMobileOpen] = useState(false);
    const mobileMenu = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const ele = mobileMenu.current;

        if (!ele)
            return;

        if (mobileOpen) {
            ele.classList.remove("hidden");
            ele.classList.remove("animate-menu-right-to-left");

            ele.classList.add("flex");
            ele.classList.add("animate-menu-left-to-right");
        } else if (!isFirstRender) {
            ele.classList.remove("animate-menu-left-to-right");
            ele.classList.add("animate-menu-right-to-left");
        }

        const onAnimateEnd = (e: AnimationEvent) => {
            if (e.animationName == "menu-right-to-left") {
                ele.classList.remove("flex");
                ele.classList.add("hidden");
            }
        }

        ele.addEventListener("animationend", onAnimateEnd, {
            once: true
        });

        return () => {
            ele.removeEventListener("animationend", onAnimateEnd);
        }
    }, [mobileOpen, isFirstRender])


    const viewPort = useContext(ViewPortCtx);

    return (
        <header className="bg-slate-800 sticky top-0 z-50">
            <button
                className={`sm:hidden p-4 top-0 left-0`}
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <MobileMenuIcon
                    className="icon-nav-item fill-white"
                />
            </button>
            <nav ref={mobileMenu} className={`hidden flex-col gap-2 bg-deaconn-data2 overflow-auto fixed top-0 left-0 p-2 h-full w-2/3 sm:w-1/2 sm:hidden`}>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <LeftArrowIcon className="fill-white w-6 h-6" />
                    </button>
                </div>
                <div className="flex flex-col gap-6">
                    <NavItem
                        link="/"
                        className=""
                    >
                        <IconAndText
                            icon={
                                <HomeIcon
                                    className="icon-nav-item fill-white"
                                />
                            }
                            text={<>Home</>}
                            inline={true}
                        />
                    </NavItem>
                    <NavItem
                        link="/service"
                        className=""
                    >
                        <IconAndText
                            icon={
                                <ServicesIcon
                                    className="icon-nav-item fill-white"
                                />
                            }
                            text={
                                <>Services</>
                            }
                            inline={true}
                        />
                    </NavItem>
                    <NavItem
                        link="/blog"
                        className=""
                    >
                        <IconAndText
                            icon={
                                <BlogIcon
                                    className="icon-nav-item fill-white"
                                />
                            }
                            text={
                                <>Blog</>
                            }
                            inline={true}
                        />
                    </NavItem>
                    <NavItem
                        link="/about"
                        className=""
                    >
                        <IconAndText
                            icon={
                                <AboutUsIcon
                                    className="icon-nav-item fill-white"
                                />
                            }
                            text={
                                <>About Us</>
                            }
                            inline={true}
                        />
                    </NavItem>
                    <h2>Account</h2>
                    {session ? (
                        <NavItem
                            link="/user/profile"
                            className=""
                        >
                            <IconAndText
                                icon={
                                    <AccountIcon
                                        className="icon-nav-item fill-white"
                                    />
                                }
                                text={
                                    <>Account</>
                                }
                                inline={true}
                            />
                        </NavItem>
                    ) : (
                        <NavItem
                            link="/login"
                            className=""
                        >
                            <IconAndText
                                icon={
                                    <SignInIcon
                                        className="icon-nav-item fill-white"
                                    />
                                }
                                text={
                                    <>Sign In</>
                                }
                                inline={true}
                            />
                        </NavItem>
                    )}
                </div>
            </nav>
            <nav className={`hidden container mx-auto sm:flex !flex-nowrap justify-between text-center items-center sm:gap-1 md:gap-4 transition-all duration-150 ${viewPort.scrollY > 0 ? "h-12" : "h-16"}`}>
                <NavItem className="h-full flex items-center" link="/">
                    {viewPort.scrollY > 0 ? (
                        <Image
                            src="/images/header_icon.png"
                            className="max-h-full w-12"
                            width={48}
                            height={48}
                            alt="Deaconn Icon"
                        />
                    ) : (
                        <Image
                            src="/images/header_banner.png"
                            className="max-h-full h-auto w-32"
                            width={128}
                            height={64}
                            alt="Deaconn Banner"
                            priority={true}
                        />
                    )}
                    
                </NavItem>
                <NavItem
                    link="/"
                    active={location == "/"}
                >
                    <IconAndText
                        icon={
                            <HomeIcon
                                className="icon-nav-item fill-white"
                            />
                        }
                        text={<>Home</>}
                        inline={true}
                    />
                </NavItem>
                <NavItem
                    link="/service"
                    active={location.includes("/service")}
                >
                    <IconAndText
                        icon={
                            <ServicesIcon
                                className="icon-nav-item fill-white"
                            />
                        }
                        text={
                            <>Services</>
                        }
                        inline={true}
                    />
                </NavItem>
                <NavItem
                    link="/blog"
                    active={location.includes("/blog")}
                >
                    <IconAndText
                        icon={
                            <BlogIcon
                                className="icon-nav-item fill-white"
                            />
                        }
                        text={
                            <>Blog</>
                        }
                        inline={true}
                    />
                </NavItem>
                <NavItem
                    link="/about"
                    active={location == "/about"}
                >
                    <IconAndText
                        icon={
                            <AboutUsIcon
                                className="icon-nav-item fill-white"
                            />
                        }
                        text={
                            <>About Us</>
                        }
                        inline={true}
                    />
                </NavItem>
                <div className="grow"></div>
                {session ? (
                    <NavItem
                        link="/user/profile"
                        active={location.includes("/user/profile")}
                    >
                        <IconAndText
                            icon={
                                <AccountIcon
                                    className="icon-nav-item fill-white"
                                />
                            }
                            text={
                                <>Account</>
                            }
                            inline={true}
                        />
                    </NavItem>
                ) : (
                    <NavItem link="/login">
                        <IconAndText
                            icon={
                                <SignInIcon
                                    className="icon-nav-item fill-white"
                                />
                            }
                            text={
                                <>Sign In</>
                            }
                            inline={true}
                        />
                    </NavItem>
                )}
            </nav>
        </header>
    );
}