import Link from "next/link";
import { type MouseEventHandler, useState, useRef, useEffect } from "react";

export type TabItemType = {
    url: string,
    text: JSX.Element,
    className?: string,
    active?: boolean,
    target?: React.HTMLAttributeAnchorTarget
    onClick?: MouseEventHandler<HTMLAnchorElement>,
    onMouseEnter?: MouseEventHandler<HTMLAnchorElement>,
    onMouseLeave?: MouseEventHandler<HTMLAnchorElement>,
    children?: TabItemType[]
};

export default function Tabs ({
    items,
    className
} : {
    items: TabItemType[]
    className?: string
}) {
    const [tabOpen, setTabOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const checkSize = () => {
                if (window.innerWidth < 640)
                    setIsMobile(true);
                else if (window.innerWidth >= 640)
                    setIsMobile(false);
            }

            checkSize();
            
            window.addEventListener("resize", checkSize);
        }
    }, []);

    return (
        <ul className={`tab-container ${className ?? ""}`}>
            <Link
                href="#"
                className={`tab-link rounded sm:hidden`}
                onClick={(e) => {
                    e.preventDefault();
                    
                    if (!isMobile)
                        return false;

                    setTabOpen(!tabOpen);
                }}
            >Show Tabs</Link>
            <div className={isMobile ? `${tabOpen ? "flex" : "hidden"}` : "flex"} ref={containerRef}>
                {items.map((item, index) => {
                    return (
                        <Row
                            key={`tab-item-${index.toString()}`}
                            item={item}
                            index={index}
                            tabOpen={tabOpen}
                            isMobile={isMobile}
                        />
                    );
                })}
            </div>
        </ul>
    );
}

function Row ({
    item,
    index,
    tabOpen,
    isMobile
} : {
    item: TabItemType,
    index: number,
    tabOpen: boolean,
    isMobile: boolean
}) {
    const childContainerRef = useRef<HTMLUListElement | null>(null);

    const [isChildOpen, setIsChildOpen] = useState(false);
    const [isChildClosing, setIsChildClosing] = useState(false);

    const animateEnd = (e: AnimationEvent) => {
        if (e.animationName == "child-slide-up")
            setIsChildClosing(false);
    }
    
    // Add event listener.
    if (childContainerRef.current) {
        const container = childContainerRef.current;

        container.addEventListener("animationend", animateEnd, {
            once: true
        });
    }

    return (
        <div
            onMouseEnter={() => {
                if (isMobile)
                    return;

                if (item.children && item.children.length > 0)
                    setIsChildOpen(true);
            }}
            onMouseLeave={() => {
                if (isMobile)
                    return;

                if (item.children && item.children.length > 0) {
                    setIsChildOpen(false);
                    setIsChildClosing(true);
                }
            }}
        >
            <Link
                href={item.url}
                className={`tab-link ${item.active ? "tab-active" : ""} ${item.className ?? ""} ${((isMobile && tabOpen) || (!isMobile && isChildOpen)) && (item.children && item.children.length > 0) ? "rounded-t" : "rounded"}`}
                onClick={item.onClick}
                target={item.target}
                onMouseEnter={item.onMouseEnter}
                onMouseLeave={item.onMouseLeave}
            >
                <li>
                    {item.text}
                </li>
            </Link>

            {item.children && item.children.length > 0 && (
                <ul className={(!isMobile && !isChildOpen) ? `animate-child-slide-up ${!isChildClosing ? "hidden" : ""}` : `flex ${!isMobile ? "animate-child-slide-down" : ""}`} ref={childContainerRef}>
                    {item.children.map((child, childIndex) => {
                        if (child.active && !isChildOpen)
                            setIsChildOpen(true);

                        const isLastItem = ((item?.children?.length ?? 1) - 1) == childIndex;

                        return (
                            <Link
                                key={`tab-item-${index.toString()}-${childIndex.toString()}`}
                                href={child.url}
                                className={`tab-link-child ${child.active ? "tab-active-child" : ""} ${child.className ?? ""} ${isLastItem ? "rounded-b" : ""}`}
                                onClick={child.onClick}
                                target={child.target}
                                onMouseEnter={child.onMouseEnter}
                                onMouseLeave={child.onMouseLeave}
                            >
                                <li>
                                    {child.text}
                                </li>
                            </Link>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}