import React from "react";
import styles from "./Header.module.css";
import cls from "classnames";
import WavesurferView, { WavesurferInstances } from "./WavesurferView";

import { DocumentState } from "../document";
import { bindWavesurfer, bindRegions } from "../wave";

export type HeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    readonly state: DocumentState;
};

const Header = (props: HeaderProps) => {
    const { state } = props;
    const [_, setInstances] = React.useState<WavesurferInstances | null>(null);
    const onFirstDecode = React.useCallback(({ wavesurfer, regions }: WavesurferInstances) => {
        wavesurfer.zoom(state.$.zoom.value);
        bindWavesurfer(state, wavesurfer);
        bindRegions(state, regions);
    }, [state]);

    return (
        <header
            {...props}
            className={cls(props.className, styles.container)}>
            <WavesurferView
                url="/data/Record.wav"
                initWavesurfer={setInstances}
                firstDecode={onFirstDecode}/>
        </header>
    );
};

export default Header;
