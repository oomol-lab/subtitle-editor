import React from "react";
import styles from "./PlayerPanel.module.css";

import { PauseOutlined, CaretRightOutlined } from "@ant-design/icons";
import { useVal } from "use-value-enhancer";
import { PanelPlayState, Player } from "../wave";
import { Val } from "value-enhancer";

export type PlayerPanelProps = {
    readonly player: Player;
}

const PlayerPanel = ({ player }: PlayerPanelProps): React.ReactNode => {
    const rateList = React.useMemo(() => [0.1, 0.25, 0.5, 0.75, 0.8, 1.0, 1.5, 2.0, 3.0, 4.0, 10.0], []);
    const willAlwaysPlay = useVal(player.$.willAlwaysPlay);
    const playerState = useVal(player.$.panelPlayState);

    const onAlwaysPlayChanged: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        event => player.$.willAlwaysPlay.set(event.target.checked),
        [player.$],
    );
    const onClickPlayOrPause: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(
        () => {
            switch (playerState) {
                case PanelPlayState.Playing: {
                    player.clickPause();
                    break;
                }
                case PanelPlayState.Paused: {
                    player.clickPlay();
                    break;
                }
            }
        },
        [player, playerState],
    );
    let showPauseIcon = false;
    let disabled = false;

    switch (playerState) {
        case PanelPlayState.Disable: {
            disabled = true;
            break;
        }
        case PanelPlayState.Playing: {
            showPauseIcon = true;
            break;
        }
    }
    return (
        <div className={styles.container}>
            <button
                disabled={disabled}
                className={styles.button}
                onClick={onClickPlayOrPause}>
                {showPauseIcon ? <PauseOutlined /> : <CaretRightOutlined />}
            </button>
            <label className={styles.field}>
                <input
                    type="checkbox"
                    checked={willAlwaysPlay}
                    onChange={onAlwaysPlayChanged}/>
                <span>always play</span>
            </label>
            <label className={styles.field}>
                <span>zoom</span>
                <SelectPercent
                    initValue={Player.zoomInitValue}
                    value$={player.$.zoom}
                    rateList={rateList}
                    reverse/>
            </label>
            <label className={styles.field}>
                <span>volume</span>
                <SelectPercent
                    initValue={Player.volumeInitValue}
                    value$={player.$.volume}
                    rateList={rateList} />
            </label>
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

    const onChange = React.useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Number.parseFloat(event.target.value);
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
        <select
            value={selectValue}
            onChange={onChange}>
            {options.map(o => (
                <option
                    key={o.key}
                    value={`${o.value}`}>
                    {o.label}
                </option>
            ))}
        </select>
    );
};

export default PlayerPanel;