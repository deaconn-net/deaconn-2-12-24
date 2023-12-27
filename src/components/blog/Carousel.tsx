import { type ArticleWithUser } from "~/types/blog/article";

import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useContext, useState } from "react";
import { ViewPortCtx } from "@components/Wrapper";
import ArticleRow from "./article/Row";
import { LeftArrow, RightArrow } from "@components/Carousel";
import { GetRandomInt } from "@utils/Random";

export default function BlogCarousel ({
    articles = [],
    infinite = true,
    autoPlay = true,
    autoPlaySpeedMin,
    autoPlaySpeedMax
} : {
    articles: ArticleWithUser[],
    infinite?: boolean
    autoPlay?: boolean
    autoPlaySpeedMin?: number
    autoPlaySpeedMax?: number
}) {
    const viewPort = useContext(ViewPortCtx);

    const responsive = {
        xl3: {
            breakpoint: { max: 4000, min: 2496 },
            items: 4
        },
        xl2: {
            breakpoint: { max: 2496, min: 2160 },
            items: 4
        },
        xl: {
            breakpoint: { max: 2160, min: 1844 },
            items: 4
        },
        lg: {
            breakpoint: { max: 1844, min: 1488 },
            items: 4
        },
        md: {
            breakpoint: { max: 1488, min: 1152 },
            items: 3
        },
        sm: {
            breakpoint: { max: 1152, min: 816 },
            items: 2
        },
        xs: {
            breakpoint: { max: 816, min: 0 },
            items: 1
        }
    };

    // Retrieve play speed.
    const [playSpeed, setPlaySpeed] = useState<number | undefined>(undefined);

    if (typeof autoPlaySpeedMin !== "undefined" && typeof autoPlaySpeedMax !== "undefined" && !playSpeed)
        setPlaySpeed(GetRandomInt(autoPlaySpeedMin, autoPlaySpeedMax))

    return (
        <Carousel
            responsive={responsive}
            itemClass="p-4"
            infinite={infinite}
            autoPlay={!viewPort.mobile ? autoPlay : false}
            autoPlaySpeed={playSpeed}
            customLeftArrow={<LeftArrow />}
            customRightArrow={<RightArrow />}
        >
            {articles.map((article, index) => {
                return (
                    <ArticleRow
                        key={`article-${index.toString()}`}
                        article={article}
                        simple={true}
                    />
                )
            })}
        </Carousel>
    )
}