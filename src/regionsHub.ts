import { Editor, Descendant } from "slate";
import { val, Val } from "value-enhancer";
import { Region, Regions } from "wavesurfer.js/dist/plugins/regions.esm.js";
import { isElement, Element } from "./data";

type Line = {
    readonly id: number;
    readonly region: Region;
};

// to see: https://wavesurfer.xyz/examples/?regions.js
// source code: https://github.com/katspaugh/wavesurfer.js/blob/main/src/plugins/regions.ts
export class RegionsHub {

    readonly #editor: Editor;

    #nextId = 0;
    #regions: Regions | null = null;
    #toVals: Map<Descendant, Val<Line>> = new Map();

    public constructor(editor: Editor) {
        this.#editor = editor;
    }

    public bindRegions(regions: Regions): void {
        if (this.#regions) {
            throw new Error("Regions already bound");
        }
        this.#regions = regions;
        for (const child of this.#editor.children) {
            if (!isElement(child)) {
                continue;
            }
            const id = this.#generateId();
            const region = this.#createRegionByChild(id, child);
            this.#toVals.set(child, val({ id, region }));
        }
    }

    public updateEditorValue(children: Descendant[]): void {
        const nextToVals = new Map<Descendant, Val<Line>>();
        for (const child of children) {
            if (!isElement(child)) {
                continue;
            }
            let toVal = this.#toVals.get(child);
            if (toVal) {
                this.#toVals.delete(child);
                const { region } = toVal.value;
                const start = this.#toSeconds(child.begin);
                const end = this.#toSeconds(child.end);
                if (region.start !== start || region.end !== end) {
                    region.setOptions({ start, end });
                }
            } else {
                const id = this.#generateId();
                const region = this.#createRegionByChild(id, child);
                toVal = val({ id, region });
            }
            nextToVals.set(child, toVal);
        }
        for (const toRemoveVal of this.#toVals.values()) {
            toRemoveVal.value.region.remove();
        }
        this.#toVals = nextToVals;
    }

    #createRegionByChild(id: number, child: Element): Region {
        return this.#regions!.addRegion({
            id: `${id}`,
            start: this.#toSeconds(child.begin),
            end: this.#toSeconds(child.end),
            content: "holder",
            color: "rgba(255, 0, 0, 0.1)",
        })
    }

    #generateId(): number {
        return this.#nextId ++;
    }

    #toSeconds(milliseconds: number): number {
        return milliseconds / 1000.0;
    }
}