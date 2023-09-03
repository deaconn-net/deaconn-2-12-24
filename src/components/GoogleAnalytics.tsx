import Script from "next/script";

export default function GoogleAnalytics() {
    const id = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

    return (
        <>
            {id && (
                <>
                    <Script id="google-tag-manager" src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){window.dataLayer.push(arguments);}
                            gtag("js", new Date());

                            gtag("config", "${id}");
                        `}
                    </Script>
                </>
            )}

        </>
    );
}