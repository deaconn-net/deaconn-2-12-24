import Head from "next/head";

export type MetaType = {
    title?: string
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
    article_tags?: string[],

    include_cdn?: boolean
};

const Meta: React.FC<MetaType> = ({
    title = "Deaconn",
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
    
    include_cdn
}) => {
    // Retrieve URLs.
    let base_url;
    let full_url;

    if (typeof window !== "undefined") {
        base_url = window.location.protocol + "//" + window.location.host;
        full_url = base_url + window.location.pathname;
    }

    // Check if we must prepend CDN URL or use full URL instead.
    if (process.env.NEXT_PUBLIC_CDN_URL && image && include_cdn)
        image = process.env.NEXT_PUBLIC_CDN_URL + image;
    else if (full_url) {
        const partOne = window.location.protocol + "//";
        let partTwo = window.location.host + image;

        // Make sure we replace duplicate slashes in part two.
        partTwo = partTwo.replaceAll("//", "/");

        image = partOne + partTwo;
    }

    return (
        <Head>
            <link rel="canonical" href={full_url} />

            {title && (
                <>
                    <title>{title}</title>
                    <meta property="twitter:title" content={title} />
                    <meta property="og:title" content={title} />
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
                        <meta key="meta_apt" property="article:published_time" content={article_ptime} />
                    )}

                    {article_mtime && (
                        <meta key="meta_amt" property="article:modified_time" content={article_mtime} />
                    )}

                    {article_etime && (
                        <meta key="meta_aet" property="article:expiration_time" content={article_etime} />
                    )}

                    {article_author && (
                        <meta key="meta_aa" property="article:author" content={article_author} />
                    )}

                    {article_section && (
                        <meta key="meta_as" property="article:section" content={article_section} />
                    )}

                    {article_tags && (
                        <meta key="meta_t" property="article:tag" content={article_tags.join(",")} />
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
            <meta property="og:url" content={full_url} />

            <meta name="msapplication-starturl" content={base_url} />
            <meta name="application-name" content="Deaconn" />
            <meta name="apple-mobile-web-app-title" content="Deaconn" />
            <meta name="theme-color" content="#181a1b" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-touch-fullscreen" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
        </Head>
    );
}

export default Meta;