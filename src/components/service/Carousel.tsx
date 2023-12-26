import { useContext } from "react";
import { ViewPortCtx } from "@components/Wrapper";
import { type Service } from "@prisma/client";

import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import ServiceRow from "./Row";
import { LeftArrow, RightArrow } from "@components/Carousel";

export default function ServiceCarousel ({
    services = [],
    infinite = true,
    autoPlay = true,
    autoPlaySpeed
} : {
    services: Service[],
    infinite?: boolean
    autoPlay?: boolean
    autoPlaySpeed?: number
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

    return (
        <Carousel
            responsive={responsive}
            itemClass="p-4"
            infinite={infinite}
            autoPlay={!viewPort.mobile ? autoPlay : false}
            autoPlaySpeed={autoPlaySpeed}
            customLeftArrow={<LeftArrow />}
            customRightArrow={<RightArrow />}
        >
            {services.map((service, index) => {
                return (
                    <ServiceRow
                        key={`article-${index.toString()}`}
                        service={service}
                        simple={true}
                    />
                )
            })}
        </Carousel>
    )
}