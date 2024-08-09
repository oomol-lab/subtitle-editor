import React from "react";
import WaveSurfer from "wavesurfer.js";

export type WavesurferProps = {
    readonly url?: string;
    readonly initWavesurfer?: (wavesurfer: WaveSurfer) => void;
};

export const WavesurferView = (props: WavesurferProps) => {
    const { initWavesurfer } = props;
    const wavesurferRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const wavesurfer = WaveSurfer.create({
            container: wavesurferRef.current!,
            waveColor: "rgb(200, 0, 200)",
            progressColor: "rgb(100, 0, 100)",
            url: props.url,
            normalize: true,
        });
        if (initWavesurfer) {
            initWavesurfer(wavesurfer);
        }
    }, []);
    return <div ref={wavesurferRef} />;
};

export default WavesurferView;