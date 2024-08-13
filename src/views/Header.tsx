import React from "react";
import styles from "./Header.module.css";
import cls from "classnames";
import PlayerPanel from "./PlayerPanel";
import WavesurferView, { WavesurferInstances } from "./WavesurferView";

import { DocumentState } from "../document";
import { bindWavesurfer, bindRegions, Player } from "../wave";

export type HeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    readonly state: DocumentState;
    readonly player: Player;
};

const Header = (props: HeaderProps) => {
    const { state, player } = props;
    const onFirstDecode = React.useCallback(({ wavesurfer, regions }: WavesurferInstances) => {
        player.bindWaveSurfer(wavesurfer);
        bindWavesurfer(state, player, wavesurfer);
        bindRegions(state, regions);
    }, [state, player]);

    return (
        <header
            {...props}
            className={cls(props.className, styles.container)}>
            <WavesurferView
                url="/data/englishRecord.wav"
                firstDecode={onFirstDecode} />
            <PlayerPanel player={player} />
        </header>
    );
};

export default Header;
