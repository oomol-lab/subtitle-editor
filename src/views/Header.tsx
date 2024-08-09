import React from "react";
import styles from "./Header.module.css";
import cls from "classnames";
import WavesurferView, { WavesurferInstances } from "./WavesurferView";

import { State } from "../state";

export type HeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    readonly state: State;
};

const Header = (props: HeaderProps) => {
    const { state } = props;
    const { regionsHub } = state;
    const [_, setInstances] = React.useState<WavesurferInstances | null>(null);
    const onFirstDecode = React.useCallback(({ wavesurfer, regions }: WavesurferInstances) => {
        wavesurfer.zoom(50);
        regionsHub.bindRegions(regions);
    }, [regionsHub]);
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
