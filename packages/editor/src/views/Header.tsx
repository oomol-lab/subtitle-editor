import React from "react";
import styles from "./Header.module.css";
import cls from "classnames";
import WavesurferView, { WavesurferInstances } from "./WavesurferView";

import { DocumentState } from "../document";
import { bindWavesurfer, bindRegions, Player } from "../wave";

export type HeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    readonly audioURL: string;
    readonly state: DocumentState;
    readonly player: Player;
};

const Header = (props: HeaderProps) => {
    const { audioURL, state, player, children, ...restProps } = props;
    const onFirstDecode = React.useCallback(({ wavesurfer, regions }: WavesurferInstances) => {
        player.bindWaveSurfer(wavesurfer);
        bindWavesurfer(state, player, wavesurfer);
        bindRegions(state, regions);
    }, [state, player]);

    return (
        <header
            {...restProps}
            className={cls(props.className, styles.container)}>
            <WavesurferView
                url={audioURL}
                firstDecode={onFirstDecode} />
            {children}
        </header>
    );
};

export default Header;
