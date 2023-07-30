import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

import HomeIcon from "@utils/icons/header/home";
import ServicesIcon from "@utils/icons/header/services";
import BlogIcon from "@utils/icons/header/blog";
import AboutUsIcon from "@utils/icons/header/aboutus";
import AccountIcon from "@utils/icons/header/account";
import SignOutIcon from "@utils/icons/header/signout";
import SignInIcon from "@utils/icons/header/signinicon";

const Header: React.FC = () => {
    const { data: session } = useSession();

    return (
        <header>
            <nav>
                <ul className="nav-section">
                    <Link className="nav-link" href="/">
                        <li className="nav-item">
                            <HomeIcon
                                classes={["w-10", "h-10", "fill-white", "stroke-gray-700"]}
                            />
                            <span className="nav-text">Home</span>
                        </li>
                    </Link>
                    <Link className="nav-link" href="/service">
                        <li className="nav-item">
                            <ServicesIcon
                                classes={["w-10", "h-10", "fill-white", "text-white"]}
                            />
                            <span className="nav-text">Services</span>
                        </li>
                    </Link>
                    <Link className="nav-link" href="/blog">
                        <li className="nav-item">
                            <BlogIcon
                                classes={["w-10", "h-10", "fill-white"]}
                            />
                            <span className="nav-text">Blog</span>
                        </li>
                    </Link>
                    <Link className="nav-link" href="/about">
                        <li className="nav-item">
                            <AboutUsIcon
                                classes={["w-10", "h-10", "fill-white"]}
                            />
                            <span className="nav-text">About Us</span>
                        </li>
                    </Link>
                </ul>
                <ul className="nav-section">
                    {session ? (
                        <>
                            <Link className="nav-link" href="/user/profile">
                                <li className="nav-item">
                                    <AccountIcon
                                        classes={["w-10", "h-10", "fill-white"]}
                                    />
                                    <span className="nav-text">Account</span>
                                </li>
                            </Link>
                            <Link className="nav-link" href="#" onClick={(e) => {
                                e.preventDefault();

                                signOut();
                            }}>
                                <li className="nav-item">
                                    <SignOutIcon
                                        classes={["w-10", "h-10", "fill-none", "stroke-white"]}
                                    />
                                    <span className="nav-text">Sign Out</span>
                                </li>
                            </Link>
                        </>
                    ) : (
                        <Link className="nav-link" href="#" onClick={(e) => {
                            e.preventDefault();

                            signIn("discord");
                        }}>
                            <li className="nav-item">
                                <SignInIcon
                                    classes={["w-10", "h-10", "fill-none", "stroke-white"]}
                                />
                                <span className="nav-text">Sign In</span>
                            </li>
                        </Link>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;