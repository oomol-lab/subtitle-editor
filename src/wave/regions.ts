import { val, combine, derive, Val, ValDisposer } from "value-enhancer";
import { Region, Regions } from "wavesurfer.js/dist/plugins/regions.esm.js";

import { DocumentState, Line } from "../document";
import { toMilliseconds, toSeconds } from "./utils";

// to see: https://wavesurfer.xyz/examples/?regions.js
// source code: https://github.com/katspaugh/wavesurfer.js/blob/main/src/plugins/regions.ts
export function bindRegions(state: DocumentState, regions: Regions): void {
    const RegionColor = "rgba(255, 125, 125, 0.1)";
    const RegionSelectedColor = "rgba(255, 65, 65, 0.2)";
    const RegionEditableColor = "rgba(255, 128, 65, 0.3)";

    const regionVals: Map<Line, Val<Region | null>> = new Map();
    const region2Lines: Map<Region, Line> = new Map();
    const editableLine$ = derive(state.$.selectedLines, selectedLines => {
        if (selectedLines.length === 1) {
            return selectedLines[0];
        } else {
            return null;
        }
    });
    state.$.lines.value.forEach(onCreateLine);
    state.events.on("addedLine", onCreateLine);
    state.events.on("removedLine", onRemoveLine);

    regions.on("region-updated", onRegionUpdated);
    regions.on("region-clicked", onRegionClicked);

    function onCreateLine(line: Line): void {
        const display$ = combine(
            [line.$.displayTimestamp, line.$.removed],
            ([displayTimestamp, removed]) => (displayTimestamp && !removed),
        )
        const disposers: ValDisposer[] = [];
        const region$ = val<Region | null>(null);

        display$.subscribe(display => {
            if (display) {
                const textDom = createTextDom();
                const options$ = combine(
                    [line.$.begin, line.$.end, line.$.selected, editableLine$],
                    ([begin, end, selected, editableLine]) => regionOptions(begin, end, selected, line, editableLine),
                    {
                        equal: (o1, o2) => o1.start === o2.start && o1.end === o2.end && o1.color === o2.color,
                    },
                );
                disposers.push(
                    line.$.text.subscribe(text => {
                        textDom.textContent = text;
                    }),
                    options$.reaction(options => {
                        region$.value?.setOptions(options);
                    }),
                );
                const region = regions.addRegion({
                    ...options$.value,
                    content: textDom,
                    drag: false,
                });
                region$.set(region);
                region2Lines.set(region, line);

            } else {
                const region = region$.value;

                for (const dispose of disposers.splice(0)) {
                    dispose();
                }
                region$.set(null);
                if (region) {
                    region.remove();
                    region2Lines.delete(region);
                }
            }
        });
        regionVals.set(line, region$);
    }

    function onRemoveLine(line: Line): void {
        regionVals.delete(line);
    }

    function onRegionUpdated(region: Region): void {
        const line = region2Lines.get(region);
        if (!line) {
            return;
        }
        const begin = toMilliseconds(region.start);
        const end = toMilliseconds(region.end);

        line.updateRange(begin, end);
    }

    function onRegionClicked(region: Region, _: MouseEvent): void {
        const line = region2Lines.get(region);
        if (!line) {
            return;
        }
        state.selectWholeLine(line);
    }

    function regionOptions(
        begin: number, end: number, selected: boolean,
        line: Line, editableLine: Line | null,
    ): Parameters<Region["setOptions"]>[0] {
        let color: string;
        let resize = false;

        if (line === editableLine) {
            resize = true;
            color = RegionEditableColor;
        } else if (selected) {
            color = RegionSelectedColor;
        } else {
            color = RegionColor;
        }
        return {
            start: toSeconds(begin),
            end: toSeconds(end),
            color,
            resize,
        };
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
        textDom.style.marginTop = "1px";
        textDom.style.marginRight = "1px";
        return textDom;
    }
}