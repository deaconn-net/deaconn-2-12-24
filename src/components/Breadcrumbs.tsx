import React from "react";
import Link from "next/link";

import ArrowRightIcon from "@components/icons/ArrowRight";

export type Breadcrumb = {
    name: string
    url?: string
    target?: React.HTMLAttributeAnchorTarget
};

export default function Breadcrumbs ({
    breadcrumbs
} : {
    breadcrumbs: Breadcrumb[] | Breadcrumb
}) {
    const items = Array.isArray(breadcrumbs) ? breadcrumbs : [breadcrumbs];

    return (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-4 px-4 text-sm font-bold">
            {items.map((item, i) => {
                return (
                    <React.Fragment key={`breadcrumb-${i.toString()}`}>
                        {item.url ? (
                            <Link
                                href={item.url}
                                target={item.target}
                            >{item.name}</Link>
                        ) : (
                            <span>{item.name}</span>
                        )}
                        {(i + 1) != items?.length && (
                            <ArrowRightIcon
                                className="w-4 h-4 stroke-white"
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}