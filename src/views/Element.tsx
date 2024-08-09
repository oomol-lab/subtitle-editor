import styles from "./Element.module.css";
import React from "react";

import { CaretRightOutlined } from "@ant-design/icons";
import { RenderElementProps } from "slate-react";
import { Element, Leaf } from "../data";

export const ElementView = (props: RenderElementProps): React.ReactNode => {
    const { attributes, children } = props;
    const element = props.element as Element;
    const [isHover, setHover] = React.useState(false);
    const onMouseEnter = React.useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = React.useCallback(() => setHover(false), [setHover]);
    let begin = Number.MAX_SAFE_INTEGER;
    let end = Number.MIN_SAFE_INTEGER;

    for (const child of element.children) {
        const leaf = (child as Leaf);
        if ("selected$" in leaf) {
            begin = Math.min(begin, leaf.begin);
            end = Math.max(end, leaf.end);
        }
    }
    return (
        <div {...attributes}
            className={styles.container}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}>
            <Head
                begin={begin}
                end={end}
                showButton={isHover}/>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
};

type HeadProps = {
    readonly begin: number;
    readonly end: number;
    readonly showButton: boolean;
};

const Head = ({ begin, end, showButton }: HeadProps): React.ReactNode => {
    return (
        <div
            className={styles.head}
            contentEditable={false}>
            <button
                className={styles.button}
                style={{ visibility: showButton ? "visible" : "hidden" }} >
                <CaretRightOutlined/>
            </button>
            <div className={styles.timestamp}>
                <span>{formatTimestamp(begin)}</span>
                <span>{formatTimestamp(end)}</span>
            </div>
        </div>
    );
};

function formatTimestamp(milliseconds: number): string {
    if (milliseconds === Number.MAX_SAFE_INTEGER ||
        milliseconds === Number.MIN_SAFE_INTEGER) {
        return "";
    }
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    const millisecondsRemainder = milliseconds % 1000;

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");
    const formattedMilliseconds = millisecondsRemainder.toString().padStart(3, "0");

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
};