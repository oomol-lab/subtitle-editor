import React from "react";
import WaveSurfer from "wavesurfer.js";
import Minimap from "wavesurfer.js/dist/plugins/minimap.esm.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

import type { Regions } from "wavesurfer.js/dist/plugins/regions.esm.js";

export type WavesurferInstances = {
    readonly wavesurfer: WaveSurfer;
    readonly regions: Regions;
};

export type WavesurferProps = {
    readonly url?: string;
    readonly initWavesurfer?: (instances: WavesurferInstances) => void;
    readonly firstDecode?: (instances: WavesurferInstances) => void;
};

export const WavesurferView = (props: WavesurferProps) => {
    const { initWavesurfer, firstDecode } = props;
    const wavesurferRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const regions = RegionsPlugin.create();
        const wavesurfer = WaveSurfer.create({
            container: wavesurferRef.current!,
            waveColor: "rgb(200, 0, 200)",
            progressColor: "rgb(100, 0, 100)",
            url: props.url,
            normalize: true,
            interact: false,
            plugins: [
                regions, ...createPlugins(),
            ],
        });
        const instances: WavesurferInstances = { wavesurfer, regions };
        if (initWavesurfer) {
            initWavesurfer(instances);
        }
        if (firstDecode) {
            // callback in wavesurfer never print errors
            // I need do it by myself
            wavesurfer.once("decode", () => {
                try {
                    firstDecode(instances);
                } catch (error) {
                    console.error(error);
                }
            });
        }
    }, []);
    return <div ref={wavesurferRef} />;
};

function createPlugins() {
    return [
        Minimap.create({
            height: 20,
            waveColor: "#ddd",
            progressColor: "#999",
        }),
    ];
}

export default WavesurferView;