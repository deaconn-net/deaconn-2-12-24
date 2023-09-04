import Head from "next/head";
import { useRouter } from "next/router";

export type MetaType = {
    title?: string
    contentTitle?: string
    description?: string
    robots?: string
    image?: string
    web_type?: string
    key_words?: string[]

    article_ptime?: string
    article_mtime?: string
    article_etime?: string
    article_author?: string
    article_section?: string
    article_tags?: string[]

    includeUploadUrl?: boolean
};

export default function Meta ({
    title = "Deaconn",
    contentTitle,
    description = "A software developer and community with the goal to bring together and empower as many software, security, and network engineers and developers as possible.",
    robots = "index, follow",
    image = "/images/banner.png",
    web_type = "website",
    key_words = ["deaconn", "coding", "developer", "security", "network","tech", "cyber", "programming", "service", "tutorial"],
    
    article_ptime,
    article_mtime,
    article_etime,
    article_author,
    article_section,
    article_tags,
    
    includeUploadUrl
} : MetaType) {
    const router = useRouter();

    // Retrieve URLs.
    let baseUrl: string | undefined = undefined;
    let fullUrl: string | undefined = undefined;

    if (typeof window !== "undefined") {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const pathName = window.location.pathname;

        baseUrl = `${protocol}//${host}`;
        fullUrl = `${protocol}//${host}${pathName}`;
    } else {
        // If window is undefined, try using base URL from environmental variables as a fallback.
        const baseUrlEnv = process.env.NEXT_PUBLIC_BASE_URL ?? "";

        baseUrl = baseUrlEnv;
        fullUrl = baseUrl + router.asPath;
    }

    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";

    // Check if we must prepend CDN URL or use full URL instead.
    if (uploadUrl && image && includeUploadUrl)
        image = uploadUrl + image;
    else if (baseUrl) 
        image = baseUrl + image;

    if (!image.startsWith("http://") && !image.startsWith("https://"))
        image = baseUrl + image;

    return (
        <Head>
            <link rel="canonical" href={fullUrl} />

            {title && (
                <title>{title}</title>
            )}
            {contentTitle ? (
                <>
                    <meta property="twitter:title" content={contentTitle} />
                    <meta property="og:title" content={contentTitle} />
                </>
            ) : (
                <>
                    {title && (
                        <>
                            <meta property="twitter:title" content={title} />
                            <meta property="og:title" content={title} />
                        </>
                    )}
                </>
            )}
            {description && (
                <>
                    <meta name="description" content={description} />
                    <meta property="twitter:description" content={description} />
                    <meta property="og:description" content={description} />
                </>
            )}
            {image && (
                <>
                    <link rel="apple-touch-icon" href={image} />
                    <meta property="og:image" content={image} />
                    <meta property="twitter:image" content={image} />
                </>
            )}
            {web_type && (
                <meta property="og:type" content={web_type} />
            )}
            {robots && (
                <meta name="robots" content={robots} />
            )}
            {key_words && key_words.length > 0 && (
                <meta name="keywords" content={key_words.join(",")} />
            )}
            {web_type == "article" && (
                <>
                    {article_ptime && (
                        <meta property="article:published_time" content={article_ptime} />
                    )}

                    {article_mtime && (
                        <meta property="article:modified_time" content={article_mtime} />
                    )}

                    {article_etime && (
                        <meta property="article:expiration_time" content={article_etime} />
                    )}

                    {article_author && (
                        <meta property="article:author" content={article_author} />
                    )}

                    {article_section && (
                        <meta property="article:section" content={article_section} />
                    )}

                    {article_tags && (
                        <meta property="article:tag" content={article_tags.join(",")} />
                    )}
                </>
            )}

            <meta httpEquiv="X-UA-Compatible" content="IE=Edge,chrome=1" />
            <meta name="opt-targeting" content="{&quot;type&quot;:&quot;Browse&quot;}" />
            <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />

            <link rel="icon" type="image/x-icon" href="/favicon.ico" />

            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:site" content="@deaconn-net" />
            <meta property="twitter:creator" content="@deaconn-net" />

            <meta property="og:locale" content="en_US" />
            <meta property="og:site_name" content="Deaconn" />
            <meta property="og:url" content={fullUrl} />

            <meta name="msapplication-starturl" content={baseUrl} />
            <meta name="application-name" content="Deaconn" />
            <meta name="apple-mobile-web-app-title" content="Deaconn" />
            <meta name="theme-color" content="#181a1b" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-touch-fullscreen" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
        </Head>
    );
}