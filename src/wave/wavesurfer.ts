import WaveSurfer from "wavesurfer.js";

import { DocumentState, Line } from "../document";
import { derive, ReadonlyVal } from "value-enhancer";
import { toSeconds } from "./utils";

export function bindWavesurfer(state: DocumentState, wavesurfer: WaveSurfer): void {
    const firstSelectedLine$: ReadonlyVal<Line | null> = derive(state.$.selectedLines, lines => {
        if (lines.length > 0) {
            return lines[0];
        } else {
            return null;
        }
    });
    firstSelectedLine$.subscribe(firstSelectedLine => {
        if (!firstSelectedLine) {
            return;
        }
        const $ = firstSelectedLine.$;
        const zoom = state.$.zoom.value;
        const selectedBegin = toSeconds($.begin.value);
        const selectedEnd = toSeconds($.end.value);
        const selectedWidth = selectedEnd - selectedBegin;
        const scrollBegin = wavesurfer.getScroll() / zoom;
        const scrollWidth = wavesurfer.getWidth() / zoom;
        const scrollEnd = scrollBegin + scrollWidth;

        if (selectedWidth >= scrollWidth) {
            if (scrollEnd < selectedBegin || scrollBegin > selectedEnd) { // not touch
                wavesurfer.setScrollTime(selectedBegin);
            }
        } else if (selectedBegin < scrollBegin || selectedEnd > scrollEnd) { // not include
            const time = selectedBegin - (scrollWidth - selectedWidth) * 0.15;
            wavesurfer.setScrollTime(time);
        }
    });
}