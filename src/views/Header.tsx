import React from "react";
import styles from "./Header.module.css";
import cls from "classnames";
import WaveSurfer from "wavesurfer.js";
import WavesurferView from "./WavesurferView";

import { State } from "../state";

export type HeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    readonly state: State;
};

const Header = (props: HeaderProps) => {
    const [wavesurfer, setWavesurfer] = React.useState<WaveSurfer | null>(null);
    const onInitWavesurfer = React.useCallback((wavesurfer: WaveSurfer) => {
        setWavesurfer(wavesurfer);
        wavesurfer.on("decode", () => {

        });
     }, [setWavesurfer]);
    return (
        <header
            {...props}
            className={cls(props.className, styles.container)}>
            <WavesurferView
                url="/data/Record.wav"
                initWavesurfer={onInitWavesurfer}/>
        </header>
    );
};

export default Header;
