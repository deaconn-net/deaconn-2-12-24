import ArrowRightIcon from "@components/icons/ArrowRight";
import Link from "next/link";

export type Breadcrumb = {
    name: string
    url: string
    target?: React.HTMLAttributeAnchorTarget
};

export default function Breadcrumbs ({
    breadcrumbs
} : {
    breadcrumbs: Breadcrumb[] | Breadcrumb
}) {
    const items = Array.isArray(breadcrumbs) ? breadcrumbs : [breadcrumbs];

    return (
        <div className="breadcrumbs">
            {items.map((item, i) => {
                return (
                    <>
                        <Link
                            key={`breadcrumb-${i.toString()}`}
                            href={item.url}
                            target={item.target}
                        >{item.name}</Link>
                        {(i + 1) != items?.length && (
                            <ArrowRightIcon
                                className="w-4 h-4 stroke-white"
                            />
                        )}
                    </>
                );
            })}
        </div>
    );
}