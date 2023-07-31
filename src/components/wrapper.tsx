import React from "react";

import Header from "@components/header";
import Footer from "@components/footer";

const Wrapper: React.FC<{ 
    children: React.ReactNode
}> = ({
    children
}) => {
    return (
        <main>
            <Header />
            {children}
            <Footer />
        </main>
    );
}

export default Wrapper;