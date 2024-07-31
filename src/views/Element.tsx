import styles from "./Element.module.css";
import React from "react";

import { CaretRightOutlined } from "@ant-design/icons";
import { RenderElementProps } from "slate-react";
import { Element } from "../data";

export const ElementView = (props: RenderElementProps): React.ReactNode => {
    const { attributes, children } = props;
    const element = props.element as Element;
    const [isHover, setHover] = React.useState(false);
    const onMouseEnter = React.useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = React.useCallback(() => setHover(false), [setHover]);
    return (
        <div {...attributes}
            className={styles.container}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}>
            <Head
                begin={element.begin}
                end={element.end}
                showButton={isHover}/>
            {children}
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