import React from "react";
import SavePanel from "./SavePanel";
import styles from "./PlayerPanel.module.less";

import { Button, Checkbox, Select } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { PauseOutlined, CaretRightOutlined } from "@ant-design/icons";
import { useVal } from "use-value-enhancer";
import { Val } from "value-enhancer";
import { SrtEditor, PlayerState } from "subtitle-editor";

export type PlayerPanelProps = {
    readonly srtFilePath: string;
    readonly srtEditor: SrtEditor;
}

const PlayerPanel = ({ srtEditor, srtFilePath }: PlayerPanelProps): React.ReactNode => {
    const rateList = React.useMemo(() => [0.1, 0.25, 0.5, 0.75, 0.8, 1.0, 1.5, 2.0, 3.0, 4.0, 10.0], []);
    const willAlwaysPlay = useVal(srtEditor.$.willAlwaysPlay);
    const playerState = useVal(srtEditor.$.panelPlayState);

    const onAlwaysPlayChanged = React.useCallback(
        (event: CheckboxChangeEvent) => srtEditor.$.willAlwaysPlay.set(event.target.checked),
        [srtEditor.$],
    );
    const onClickPlayOrPause: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(
        () => {
            switch (playerState) {
                case PlayerState.Playing: {
                    srtEditor.pause();
                    break;
                }
                case PlayerState.Paused: {
                    srtEditor.play();
                    break;
                }
            }
        },
        [srtEditor, playerState],
    );
    let showPauseIcon = false;
    let disabled = false;

    switch (playerState) {
        case PlayerState.Disable: {
            disabled = true;
            break;
        }
        case PlayerState.Playing: {
            showPauseIcon = true;
            break;
        }
    }
    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <Button
                    className={styles.field}
                    shape="circle"
                    disabled={disabled}
                    icon={showPauseIcon ? <PauseOutlined /> : <CaretRightOutlined />}
                    onClick={onClickPlayOrPause} />
                <Checkbox
                    className={styles.field}
                    checked={willAlwaysPlay}
                    onChange={onAlwaysPlayChanged}>
                    always play
                </Checkbox>
                <label className={styles.field}>
                    <span>zoom</span>
                    <SelectPercent
                        initValue={SrtEditor.zoomInitValue}
                        value$={srtEditor.$.zoom}
                        rateList={rateList}
                        reverse />
                </label>
                <label className={styles.field}>
                    <span>volume</span>
                    <SelectPercent
                        initValue={SrtEditor.volumeInitValue}
                        value$={srtEditor.$.volume}
                        rateList={rateList} />
                </label>
            </div>
            <SavePanel
                className={styles.right}
                initialPath={srtFilePath}
                srtEditor={srtEditor} />
        </div>
    );
};

type SelectPercentProps = {
    readonly initValue: number;
    readonly value$: Val<number>;
    readonly rateList: number[];
    readonly reverse?: boolean;
};

const SelectPercent = ({ initValue, value$, rateList, reverse }: SelectPercentProps): React.ReactNode => {
    const zoom = useVal(value$);
    const options: { key: string, value: number, label: string }[] = React.useMemo(() => rateList.map((rate, index) => ({
        key: `${index}`,
        value: initValue * (reverse ? (1 / rate) : rate),
        label: `${Math.round(rate * 100)}%`,
    })), [rateList, reverse]);

    const onChange = React.useCallback((value: number) => {
        value$.set(value);
    }, [value$]);

    let selectValue: number;

    if (reverse) {
        selectValue = options[0].value;
        for (let i = options.length - 1; i >= 0; i--) {
            const { value } = options[i];
            if (value >= zoom) {
                selectValue = value;
                break;
            }
        }
    } else {
        selectValue = options[options.length - 1].value;
        for (let i = 0; i < options.length; i++) {
            const { value } = options[i];
            if (value >= zoom) {
                selectValue = value;
                break;
            }
        }
    }
    return (
        <Select
            className={styles.select}
            value={selectValue}
            onChange={onChange}
            options={options.map(o => ({
                label: <span>{o.label}</span>,
                value: o.value,
            }))} />
    );
};

export default PlayerPanel;