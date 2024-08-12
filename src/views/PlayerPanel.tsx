import React from "react";
import styles from "./PlayerPanel.module.css";

import { useVal } from "use-value-enhancer";
import { Player } from "../wave";

export type PlayerPanelProps = {
    readonly player: Player;
}

const PlayerPanel = ({ player }: PlayerPanelProps): React.ReactNode => {
    const willAlwaysPlay = useVal(player.$.willAlwaysPlay);
    const onAlwaysPlayChanged: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        event => player.$.willAlwaysPlay.set(event.target.checked),
        [player.$],
    );
    return (
        <div className={styles.container}>
            <label className={styles.field}>
                <input
                    type="checkbox"
                    checked={willAlwaysPlay}
                    onChange={onAlwaysPlayChanged}/>
                <span>always play</span>
            </label>
        </div>
    );
};

export default PlayerPanel;