import React from "react";
import { type ArrowProps } from "react-multi-carousel";

export function ArrowFix (props: ArrowProps & {
    children: React.ReactNode
}) {
    const {children, onClick} = props;

    return (
        <span onClick={onClick}>
            {children}
        </span>
    )
}

export function LeftArrow (props: ArrowProps) {
    return (
        <ArrowFix {...props}>
            <button aria-label="Go to previous slide" className="react-multiple-carousel__arrow react-multiple-carousel__arrow--left !z-10" type="button"></button>
        </ArrowFix>
    )
}

export function RightArrow (props: ArrowProps) {
    return (
        <ArrowFix {...props}>
            <button aria-label="Go to next slide" className="react-multiple-carousel__arrow react-multiple-carousel__arrow--right !z-10" type="button"></button>
        </ArrowFix>
    )
} 