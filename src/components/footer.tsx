import Link from "next/link";

export const Footer: React.FC = () => {
    return (
        <footer className="p-18 bg-slate-800">
            <div className="container mx-auto flex flex-wrap text-center">
                <div className="footer-section">
                    <div>
                        <h3 className="footer-title">Links</h3>
                        <ul className="list-none">
                            <li className="footer-link"><Link href="/">Home</Link></li>
                            <li className="footer-link"><Link href="/service">Services</Link></li>
                            <li className="footer-link"><Link href="/blog">Blog</Link></li>
                            <li className="footer-link"><Link href="/about">About Us</Link></li>
                            <li className="footer-link"><Link href="/request/new">New Request</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-section">
                    <div>
                        <h3 className="footer-title">Services</h3>
                    </div>
                </div>
                <div className="footer-section">
                    <div>
                        <h3 className="footer-title">Partners</h3>
                        <ul className="list-none">
                            <li className="footer-link"><a href="https://moddingcommunity.com" target="_blank">The Modding Community</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}