import { ViewPortCtx } from "@components/Wrapper";
import Link from "next/link";
import { type MouseEventHandler, useState, useRef, useEffect, useContext } from "react";

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
    // Retrieve view port and check if mobile.
    const viewPort = useContext(ViewPortCtx);
    const isMobile = viewPort.mobile;

    const [tabOpen, setTabOpen] = useState(false);

    return (
        <ul className={`relative list-none flex flex-col gap-2 w-full overflow-hidden z-30 ${className ?? ""}`}>
            <button
                type="button"
                className="tab-item rounded sm:hidden"
                onClick={() => {                    
                    if (!isMobile)
                        return false;

                    setTabOpen(!tabOpen);
                }}
            >Show Tabs</button>
            <div
                className={`flex-col list-none w-full gap-2 ${isMobile ? `${tabOpen ? "flex" : "hidden"}` : "flex"}`}
            >
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

    // Retrieve child container.
    const container = childContainerRef.current;

    useEffect(() => {
        if (!container)
            return;

        // Create animate end callback.
        const animateEnd = (e: AnimationEvent) => {
            // If we have the child slide up animation, set to not closing.
            if (e.animationName == "child-slide-up")
                setIsChildClosing(false);
        }

        container.addEventListener("animationend", animateEnd, {
            once: false
        });

        return () => {
            container.removeEventListener("animationend", animateEnd);
        }
    }, [container])

    return (
        <div
            className="flex flex-col list-none w-full"
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
                className={`tab-item ${item.active ? "tab-active" : ""} ${item.className ?? ""} ${((isMobile && tabOpen) || (!isMobile && isChildOpen)) && (item.children && item.children.length > 0) ? "rounded-t" : "rounded"}`}
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
                <ul
                    ref={childContainerRef}
                    className={`list-none flex-col w-full ${(!isMobile && !isChildOpen) ? `animate-child-slide-up ${!isChildClosing ? "hidden" : ""}` : `flex ${!isMobile ? "animate-child-slide-down" : ""}`}`} 
                >
                    {item.children.map((child, childIndex) => {
                        if (child.active && !isChildOpen)
                            setIsChildOpen(true);

                        const isLastItem = ((item?.children?.length ?? 1) - 1) == childIndex;

                        return (
                            <Link
                                key={`tab-item-${index.toString()}-${childIndex.toString()}`}
                                href={child.url}
                                className={`tab-item !z-10 sm:block ${child.active ? "tab-active" : ""} ${child.className ?? ""} ${isLastItem ? "rounded-b" : ""}`}
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