import Head from "next/head";

export type Meta = {
    title?: string
    desc?: string
    image?: string
    robots?: string
    webType?: string
};

export const MetaInfo: React.FC<{ meta?: Meta, full_url?: string, base_url?: string }> = ({ meta={ title: "Deaconn", desc: "Creating nextgen services and products under technology.", robots: "index, follow", webType: "website" }, full_url, base_url }) => {
    return (
        <Head>
            <link rel="canonical" href={full_url} key="headCanonical" />

            {meta.title && (
                <>
                    <title key="headTitle">{meta.title}</title>
                    <meta property="twitter:title" content={meta.title} key="headTwitterTitle" />
                    <meta property="og:title" content={meta.title} key="headOGTitle" />
                </>
            )}
            {meta.desc && (
                <>
                    <meta name="description" content={meta.desc} key="headDesc" />
                    <meta property="twitter:description" content={meta.desc} key="headTwitterDesc" />
                    <meta property="og:description" content={meta.desc} key="headOGDesc" />
                </>
            )}
            {meta.image && (
                <>
                    <link rel="apple-touch-icon" href={meta.image} key="headAppIcon" />
                    <meta property="og:image" content={meta.image} key="headOGImg" />
                    <meta property="twitter:image" content={meta.image} key="headTwitterImg" />
                </>
            )}
            {meta.webType && (
                <meta property="og:type" content={meta.webType} key="headOGWebType"/>
            )}
            {meta.robots && (
                <meta name="robots" content={meta.robots} key="headRobots" />
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
    );
}