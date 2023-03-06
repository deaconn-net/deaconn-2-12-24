import React from 'react';

import { type Meta, MetaInfo } from './meta';
import { Header } from './header';
import { Footer } from './footer';

export const Deaconn: React.FC<{ meta?: Meta, content: JSX.Element }> = ({ meta, content }) => {
    // Retrieve URLs.
    let base_url;
    let full_url;

    if (typeof window !== "undefined") {
        base_url = window.location.protocol + "//" + window.location.host;
        full_url = base_url +  window.location.pathname;
    }

    return (
        <>
            <MetaInfo   
                meta={meta}
                full_url={full_url}
                base_url={base_url}
            />
            <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-gray-900">
                <Header />
                {content}
                <Footer />
            </main>
        </>
    );
}


export default Deaconn;