import React from "react";

import { type CategoryWithAllAndServiceCount, type CategoryWithAllAndAricleCount } from "~/types/category";
import Tabs, { type TabItemType } from "@components/tabs/Tabs";

export default function CategoryTabs ({
    categories_with_articles,
    categories_with_services,
    active
} : {
    categories_with_articles?: CategoryWithAllAndAricleCount[],
    categories_with_services?: CategoryWithAllAndServiceCount[]
    active?: number
}) {
    const categories = categories_with_articles ?? categories_with_services;

    if (!categories)
        return <></>;

    // Compile tabs.
    const tabs: TabItemType[] = [];

    categories.map((category) => {
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

        // Add to tabs.
        tabs.push({
            url: viewUrl,
            text:
                <div className="flex gap-2">
                    <span>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</span>
                    <span>({cnt})</span>
                </div>,
            active: active == category.id
        });

        // Parse children.
        category.children.map((categoryChild) => {
            const viewUrlChild = `/${categories_with_articles ? "blog" : "service"}/category/${category.url}/${categoryChild.url}`;
            const cntChild = "Article" in categoryChild._count
                ? (categoryChild._count as { Article: number }).Article
                : (categoryChild._count as { Service: number }).Service;

            // Add to tabs.
            tabs.push({
                url: viewUrlChild,
                text:
                    <div className="flex gap-2">
                        <span>{categoryChild.name.charAt(0) + categoryChild.name.slice(1)}</span>
                        <span>({cntChild})</span>
                    </div>,
                active: active == categoryChild.id,
                className: "sm:ml-4"
            })
        })
    })
    
    return (
        <Tabs
            items={tabs}
            className="sm:w-64"
        />
    );
}