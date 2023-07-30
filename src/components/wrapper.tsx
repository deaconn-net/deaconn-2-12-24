import React from "react";

import Header from "@components/header";
import Footer from "@components/footer";

const Wrapper: React.FC<{ 
    children: React.ReactNode
}> = ({
    children
}) => {
    // Retrieve URLs.
    let base_url;
    let full_url;

    if (typeof window !== "undefined") {
        base_url = window.location.protocol + "//" + window.location.host;
        full_url = base_url + window.location.pathname;
    }

    return (
        <main>
            <Header />
            {children}
            <Footer />
        </main>
    );
}

export default Wrapper;