import styles from "./Element.module.less";
import React from "react";
import cls from "classnames";

import { PauseOutlined, CaretRightOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { RenderElementProps } from "slate-react";
import { useVal } from "use-value-enhancer";
import { Line } from "../document";
import { LinePlayState } from "../wave";

export const ElementView = (props: RenderElementProps): React.ReactNode => {
    const { attributes, children, element } = props;
    const [isHover, setHover] = React.useState(false);
    const line = Line.get(element);

    if (!line) {
        throw new Error("invalid element");
    }
    const player = line.player;
    const lineState$ = React.useMemo(() => player.lineState$(line), [player]);
    const lineState = useVal(lineState$);
    const displayTimestamp = useVal(line.$.displayTimestamp);

    // Slate need ref. I can't replace it.
    const ref = React.useMemo(() => {
        if (attributes.ref && line.setRef) {
            return (element: HTMLDivElement | null) => {
                attributes.ref(element);
                line.setRef(element);
            };
        } else {
            return attributes.ref || line.setRef || (() => void 0);
        }

    }, [attributes.ref, line.setRef]);

    const onMouseEnter = React.useCallback(() => setHover(true), [setHover]);
    const onMouseLeave = React.useCallback(() => setHover(false), [setHover]);
    const onClickPlay = React.useCallback(() => {
        if (!displayTimestamp) {
            line.clickCreateTimestamp();
        } else if (lineState === LinePlayState.MarkPlay) {
            line.player.clickPause();
        } else {
            line.player.clickPlay(line);
        }
    }, [line, lineState]);

    const begin = useVal(line.$.begin);
    const end = useVal(line.$.end);

    let showButton = false;
    let markPlay = false;
    let buttonIcon: React.ReactNode = null;

    switch (lineState) {
        case LinePlayState.MarkPlay: {
            showButton = true;
            markPlay = true;
            buttonIcon = <PauseOutlined />;
            break;
        }
        case LinePlayState.Free: {
            showButton = isHover;
            buttonIcon = displayTimestamp ? <CaretRightOutlined /> : <ClockCircleOutlined />;
            break;
        }
        case LinePlayState.Ban: {
            showButton = false;
            buttonIcon = <CaretRightOutlined />;
            break;
        }
    }
    return (
        <div {...attributes}
            ref={ref}
            className={cls(styles.container, markPlay && styles["mark-play"])}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}>
            <div
                className={styles.head}
                contentEditable={false}>
                <button
                    className={styles.button}
                    style={{ visibility: showButton ? "visible" : "hidden" }}
                    onClick={onClickPlay}>
                    {buttonIcon}
                </button>
                <div className={styles.timestamp}>
                    <span>{displayTimestamp ? formatTimestamp(begin) : ""}</span>
                    <span>{displayTimestamp ? formatTimestamp(end) : ""}</span>
                </div>
            </div>
            <div className={styles.content}>
                {children}
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