import React from "react";
import styles from "./Header.module.css";
import cls from "classnames";
import WavesurferView, { WavesurferInstances } from "./WavesurferView";

import { DocumentState } from "../document";
import { bindWavesurfer, bindRegions, Player } from "../wave";
import PlayerPanel from "./PlayerPanel";

export type HeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    readonly state: DocumentState;
    readonly player: Player;
};

const Header = (props: HeaderProps) => {
    const { state, player } = props;
    const [_, setInstances] = React.useState<WavesurferInstances | null>(null);
    const onFirstDecode = React.useCallback(({ wavesurfer, regions }: WavesurferInstances) => {
        wavesurfer.zoom(state.$.zoom.value);
        player.bindWaveSurfer(wavesurfer);
        bindWavesurfer(state, wavesurfer);
        bindRegions(state, regions);
    }, [state, player]);

    return (
        <header
            {...props}
            className={cls(props.className, styles.container)}>
            <WavesurferView
                url="/data/Record.wav"
                initWavesurfer={setInstances}
                firstDecode={onFirstDecode} />
            <PlayerPanel player={player} />
        </header>
    );
};

export default Header;
