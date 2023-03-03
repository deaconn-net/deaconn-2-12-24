import Head from 'next/head';
import React from 'react';

export type headArgs = {
    title?: string
    desc?: string
    image?: string
    robots?: string
    webType?: string
}

export const Deaconn: React.FC<{ headArgs?: headArgs, content: JSX.Element }> = ({ headArgs={ title: "Deaconn", desc: "Creating nextgen services and products under technology.", robots: "index, follow", webType: "website" }, content }) => {
    // Retrieve URLs.
    let base_url;
    let full_url;

    if (typeof window !== "undefined") {
        base_url = window.location.protocol + "//" + window.location.host;
        full_url = base_url +  window.location.pathname;
    }

    return (
        <>
            <Head>
                <link rel="canonical" href={full_url} key="headCanonical" />

                {headArgs.title && (
                    <>
                        <title key="headTitle">{headArgs.title}</title>
                        <meta property="twitter:title" content={headArgs.title} key="headTwitterTitle" />
                        <meta property="og:title" content={headArgs.title} key="headOGTitle" />
                    </>
                )}
                {headArgs.desc && (
                    <>
                        <meta name="description" content={headArgs.desc} key="headDesc" />
                        <meta property="twitter:description" content={headArgs.desc} key="headTwitterDesc" />
                        <meta property="og:description" content={headArgs.desc} key="headOGDesc" />
                    </>
                )}
                {headArgs.image && (
                    <>
                        <link rel="apple-touch-icon" href={headArgs.image} key="headAppIcon" />
                        <meta property="og:image" content={headArgs.image} key="headOGImg" />
                        <meta property="twitter:image" content={headArgs.image} key="headTwitterImg" />
                    </>
                )}
                {headArgs.webType && (
                    <meta property="og:type" content={headArgs.webType} key="headOGWebType"/>
                )}
                {headArgs.robots && (
                    <meta name="robots" content={headArgs.robots} key="headRobots" />
                )}

                <meta httpEquiv="X-UA-Compatible" content="IE=Edge,chrome=1" />
                <meta name="opt-targeting" content="{&quot;type&quot;:&quot;Browse&quot;}" />
                <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />

                <link rel="icon" type="image/x-icon" href="/favicon.ico" />

                <meta name="keywords" content="deaconn, technology, network, security, firewall, pentest, service, AI, machine, learning, blog" key="headKeywords" />
                
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:site" content="@deaconn-net" />
                <meta property="twitter:creator" content="@deaconn-net" />
                
                <meta property="og:locale" content="en_US" />
                <meta property="og:site_name" content="Deaconn" />
                <meta property="og:url" content={full_url} key="headOGUrl" />

                <meta name="msapplication-starturl" content={base_url} key="headMsappUrl"  />
                <meta name="application-name" content="Deaconn" />
                <meta name="apple-mobile-web-app-title" content="Deaconn" />
                <meta name="theme-color" content="#181a1b" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-touch-fullscreen" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
            </Head>
            <main>
                <Header />
                {content}
            </main>
        </>

    );
}

export const Header: React.FC = () => {
    return (
        <div className="p-6 bg-cyan-800">

        </div>
    );
}

export default Deaconn;