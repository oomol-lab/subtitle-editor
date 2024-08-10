import { combine, derive, ReadonlyVal, ValDisposer } from "value-enhancer";
import { Region, Regions } from "wavesurfer.js/dist/plugins/regions.esm.js";

import { DocumentState, Line } from "../document";
import { toSeconds } from "../utils";

// to see: https://wavesurfer.xyz/examples/?regions.js
// source code: https://github.com/katspaugh/wavesurfer.js/blob/main/src/plugins/regions.ts
export function bindRegions(state: DocumentState, regions: Regions): void {
    const RegionColor = "rgba(255, 125, 125, 0.1)";
    const RegionSelectedColor = "rgba(255, 65, 65, 0.2)";
    const displayedRegions: Map<Line, Region> = new Map();

    state.$.lines.value.forEach(onCreateLine);
    state.events.on("addedLine", onCreateLine);

    function onCreateLine(line: Line): void {
        const display$ = combine(
            [line.$.displayTimestamp, line.$.removed],
            ([displayTimestamp, removed]) => (displayTimestamp && !removed),
        )
        const disposers: ValDisposer[] = [];
        let region: Region | null = null;

        display$.subscribe(display => {
            if (display) {
                const textDom = createTextDom();
                const options$ = combine(
                    [line.$.begin, line.$.end, line.$.selected],
                    ([begin, end, selected]) => ({
                        start: toSeconds(begin),
                        end: toSeconds(end),
                        color: selected ? RegionSelectedColor : RegionColor,
                    }),
                    {
                        equal: (o1, o2) => o1.start === o2.start && o1.end === o2.end && o1.color === o2.color,
                    },
                );
                disposers.push(
                    line.$.text.subscribe(text => {
                        textDom.textContent = text;
                    }),
                    options$.reaction(options => {
                        region?.setOptions(options);
                    }),
                );
                region = regions.addRegion({
                    start: toSeconds(line.$.begin.value),
                    end: toSeconds(line.$.end.value),
                    content: textDom,
                    color: line.$.selected.value ? RegionSelectedColor : RegionColor,
                    drag: false,
                    resize: false,
                });
                displayedRegions.set(line, region);
            } else {
                for (const dispose of disposers.splice(0)) {
                    dispose();
                }
                region?.remove();
                region = null;
                displayedRegions.delete(line);
            }
        });
    }

    function createTextDom(): HTMLDivElement {
        const textDom = document.createElement("div");
        // cannot use css because of shadow dom from Slate
        textDom.style.color = "white";
        textDom.style.fontSize = "10px";
        textDom.style.padding = "3px 6px";
        textDom.style.backgroundColor = "rgba(128,128,128,0.5)";
        textDom.style.borderRadius = "3px";
        textDom.style.whiteSpace = "nowrap";
        textDom.style.overflow = "hidden";
        textDom.style.textOverflow = "ellipsis";
        textDom.style.marginRight = "1px";
        return textDom;
    }
}