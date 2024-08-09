import React from "react";
import styles from "./Header.module.css";
import cls from "classnames";
import WavesurferView, { WavesurferInstances } from "./WavesurferView";

import { useVal } from "use-value-enhancer";
import { State } from "../state";

export type HeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    readonly state: State;
};

const Header = (props: HeaderProps) => {
    const { state } = props;
    const [_, setInstances] = React.useState<WavesurferInstances | null>(null);
    const zoom = useVal(state.zoom$);
    const onFirstDecode = React.useCallback(({ wavesurfer, regions }: WavesurferInstances) => {
        const { regionsHub } = state;
        wavesurfer.zoom(zoom);
        state.bindWaveSurfer(wavesurfer);
        regionsHub.bindRegions(regions);
    }, [state, zoom]);

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
