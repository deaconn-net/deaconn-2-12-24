import { useContext, useState } from "react";
import { ViewPortCtx } from "@components/Wrapper";
import { type Service } from "@prisma/client";

import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import ServiceRow from "./Row";
import { LeftArrow, RightArrow } from "@components/Carousel";
import { GetRandomInt } from "@utils/Random";

export default function ServiceCarousel ({
    services = [],
    infinite = true,
    autoPlay = true,
    autoPlaySpeedMin,
    autoPlaySpeedMax
} : {
    services: Service[],
    infinite?: boolean
    autoPlay?: boolean
    autoPlaySpeedMin?: number
    autoPlaySpeedMax?: number
}) {
    const viewPort = useContext(ViewPortCtx);

    const responsive = {
        xl4: {
            breakpoint: { max: 4000, min: 3000 },
            items: 7
        },
        xl3: {
            breakpoint: { max: 3000, min: 2496 },
            items: 6
        },
        xl2: {
            breakpoint: { max: 2496, min: 2160 },
            items: 5
        },
        xl: {
            breakpoint: { max: 2160, min: 1844 },
            items: 5
        },
        lg: {
            breakpoint: { max: 1844, min: 1488 },
            items: 4
        },
        md: {
            breakpoint: { max: 1488, min: 1210 },
            items: 3
        },
        sm: {
            breakpoint: { max: 1210, min: 639 },
            items: 2
        },
        xs: {
            breakpoint: { max: 639, min: 0 },
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