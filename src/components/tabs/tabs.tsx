import Link from "next/link";
import { MouseEventHandler } from "react";

export type TabItemType = {
    url: string,
    text: JSX.Element,
    classes?: string[],
    active?: boolean,
    onClick?: MouseEventHandler<HTMLAnchorElement>
};

const Tabs: React.FC<{
    items: TabItemType[]
    classes?: string[]
}> = ({
    items,
    classes
}) => {
    return (
        <ul className={`tab-container ${classes?.join(" ") ?? ""}`}>
            {items.map((item) => {
                return (
                    <Link
                        key={`category-item-${item.url}`}
                        href={item.url}
                        className={`tab-link ${item.active ? "tab-active" : ""} ${item.classes?.join(" ") ?? ""}`}
                        onClick={item.onClick}
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

export default Tabs;