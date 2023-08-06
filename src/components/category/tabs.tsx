import React from "react";
import Link from "next/link";

import { type CategoryWithAllAndServiceCount, type CategoryWithAllAndAricleCount } from "~/types/category";

const CategoryTabs: React.FC<{
    categories_with_articles?: CategoryWithAllAndAricleCount[],
    categories_with_services?: CategoryWithAllAndServiceCount[]
    active?: number
}> = ({
    categories_with_articles,
    categories_with_services,
    active
}) => {
    const categories = categories_with_articles ?? categories_with_services;

    if (!categories)
        return <></>;
    
    return (
        <ul className="tab-container w-64">
            {categories.map((category) => {
                const viewUrl = `/${categories_with_articles ? "blog" : "service"}/category/${category.url}`;
                let cnt = "Article" in category._count
                    ? (category._count as { Article: number }).Article
                    : (category._count as { Service: number }).Service;

                // Add children count to our primary category count.
                category.children.map((childCnt) => { 
                    if ("Article" in childCnt._count)
                        cnt += (childCnt._count as { Article: number }).Article;
                    else 
                        cnt += (childCnt._count as { Service: number }).Service;
                });

                return (
                    <React.Fragment key={`category-tab-${category.id.toString()}`}>
                        <Link
                            href={viewUrl}
                            className={`tab-link ${active == category.id ? "tab-active" : ""}`}
                        >
                            <div className="flex gap-2">
                                <span>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</span>
                                <span>({cnt})</span>
                            </div>
                        </Link>

                        {category.children.map((categoryChild) => {
                            const viewUrlChild = `/${categories_with_articles ? "blog" : "service"}/category/${category.url}/${categoryChild.url}`;
                            const cntChild = "Article" in categoryChild._count
                                ? (categoryChild._count as { Article: number }).Article
                                : (categoryChild._count as { Service: number }).Service;

                            return (
                                <Link
                                    key={`article-category-${categoryChild.id.toString()}`}
                                    href={viewUrlChild}
                                    className={`sm:ml-4 tab-link ${active == categoryChild.id ? "tab-active" : ""}`}
                                >
                                    <div className="flex gap-2">
                                        <span>{categoryChild.name.charAt(0) + categoryChild.name.slice(1)}</span>
                                        <span>({cntChild})</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </React.Fragment>
                );
            })}
        </ul>
    );
}

export default CategoryTabs;