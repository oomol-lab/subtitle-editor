import styles from "./Element.module.css";
import React from "react";

import { PauseOutlined, CaretRightOutlined } from "@ant-design/icons";
import { RenderElementProps } from "slate-react";
import { ReadonlyVal } from "value-enhancer";
import { useVal } from "use-value-enhancer";
import { Line } from "../document";

export const ElementView = (props: RenderElementProps): React.ReactNode => {
    const { attributes, children, element } = props;
    const [isHover, setHover] = React.useState(false);
    const line = Line.get(element);
    const onMouseEnter = React.useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = React.useCallback(() => setHover(false), [setHover]);
    const onClickPlay = React.useCallback(() => line?.clickPlayOrPauseButton(), [line]);

    if (!line) {
        throw new Error("invalid element");
    }
    const begin = useVal(line.$.begin);
    const end = useVal(line.$.end);
    const isPlaying$ = line.$.isPlaying;

    return (
        <div {...attributes}
            className={styles.container}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}>
            <Head
                begin={begin}
                end={end}
                showButton={isHover}
                isPlaying$={isPlaying$}
                onClickPlay={onClickPlay}/>
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
    readonly isPlaying$: ReadonlyVal<boolean>;
    readonly onClickPlay: () => void;
};

const Head = ({ begin, end, showButton, isPlaying$, onClickPlay }: HeadProps): React.ReactNode => {
    const isPlaying = useVal(isPlaying$);
    return (
        <div
            className={styles.head}
            contentEditable={false}>
            <button
                className={styles.button}
                style={{ visibility: showButton ? "visible" : "hidden" }}
                onClick={onClickPlay}>
                {isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
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