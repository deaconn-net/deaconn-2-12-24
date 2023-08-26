import Link from "next/link";
import { type MouseEventHandler, useState } from "react";

export type TabItemType = {
    url: string,
    text: JSX.Element,
    classes?: string[],
    active?: boolean,
    onClick?: MouseEventHandler<HTMLAnchorElement>,
    onMouseEnter?: MouseEventHandler<HTMLAnchorElement>,
    onMouseLeave?: MouseEventHandler<HTMLAnchorElement>
};

export default function Tabs ({
    items,
    classes
} : {
    items: TabItemType[]
    classes?: string[]
}) {
    const [tabOpen, setTabOpen] = useState(false);

    return (
        <ul className={`tab-container ${classes?.join(" ") ?? ""}`}>
            <Link
                href="#"
                className="tab-link sm:hidden"
                onClick={(e) => {
                    e.preventDefault();
                    
                    const tabItems = document.getElementsByClassName("tab-item");

                    for (let i = 0; i < tabItems.length; i++) {
                        const ele = tabItems[i];

                        if (!ele)
                            continue;
                        
                        if (tabOpen)
                            ele.setAttribute("style", "display: none;");
                        else
                            ele.setAttribute("style", "display: block;");

                        setTabOpen(!tabOpen);
                    }
                }}
            >Show Tabs</Link>
            {items.map((item) => {
                return (
                    <Link
                        key={`tab-item-${item.url}`}
                        href={item.url}
                        className={`tab-link tab-item ${item.active ? "tab-active" : ""} ${item.classes?.join(" ") ?? ""}`}
                        onClick={item.onClick}
                        onMouseEnter={item.onMouseEnter}
                        onMouseLeave={item.onMouseLeave}
                    >
                        <li>
                            {item.text}
                        </li>
                    </Link>
                );
            })}
        </ul>
    );
}