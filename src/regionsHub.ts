import { Editor, Descendant } from "slate";
import { val, Val } from "value-enhancer";
import { Region, Regions } from "wavesurfer.js/dist/plugins/regions.esm.js";
import { isElement, Element, isElementHasTimestamp, beginAndEnd } from "./data";

type Line = {
    readonly id: number;
    readonly textVal: Val<string>;
    region: Region | null;
    children: Descendant[];
};

// to see: https://wavesurfer.xyz/examples/?regions.js
// source code: https://github.com/katspaugh/wavesurfer.js/blob/main/src/plugins/regions.ts
export class RegionsHub {

    readonly #editor: Editor;

    #nextId = 0;
    #regions: Regions | null = null;
    #toLines: Map<Descendant, Line> = new Map();

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
            const children = child.children;
            const textVal = val(this.#getTextOfChildren(children));
            let region: Region | null = null;
            if (isElementHasTimestamp(child)) {
                region = this.#createRegionByChild(id, child, textVal);
            }
            this.#toLines.set(child, { id, region, textVal, children });
        }
    }

    public updateEditorValue(children: Descendant[]): void {
        const nextToVals = new Map<Descendant, Line>();
        for (const child of children) {
            if (!isElement(child)) {
                continue;
            }
            let line = this.#toLines.get(child);
            if (line) {
                this.#toLines.delete(child);
                const { region, textVal } = line;
                if (isElementHasTimestamp(child)) {
                    if (region) {
                        const [begin, endAt] = beginAndEnd(child.children);
                        const start = this.#toSeconds(begin);
                        const end = this.#toSeconds(endAt);
                        if (region.start !== start || region.end !== end) {
                            region.setOptions({ start, end });
                        }
                    } else {
                        line.region = this.#createRegionByChild(line.id, child, textVal);
                    }
                } else if (region) {
                    region.remove();
                    line.region = null;
                }
                if (line.children !== child.children) {
                    textVal.set(this.#getTextOfChildren(line.children));
                    line.children = line.children;
                }
            } else {
                const id = this.#generateId();
                const children = child.children;
                const textVal = val(this.#getTextOfChildren(children));
                let region: Region | null = null;
                if (isElementHasTimestamp(child)) {
                    region = this.#createRegionByChild(id, child, textVal);
                }
                line = { id, region, textVal, children };
            }
            nextToVals.set(child, line);
        }
        for (const toRemoveLine of this.#toLines.values()) {
            toRemoveLine.region?.remove();
        }
        this.#toLines = nextToVals;
    }

    #createRegionByChild(id: number, child: Element, textVal: Val<string>): Region {
        const textDom = document.createElement("div");
        const [begin, end] = beginAndEnd(child.children);

        textVal.subscribe(text => {
            textDom.textContent = text;
        });
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

        return this.#regions!.addRegion({
            id: `${id}`,
            start: this.#toSeconds(begin),
            end: this.#toSeconds(end),
            content: textDom,
            color: "rgba(255, 0, 0, 0.1)",
            drag: false,
            resize: false,
        })
    }

    #getTextOfChildren(children: Descendant[]): string {
        const strings: string[] = [];
        for (const child of children) {
            if ("text" in child) {
                strings.push(child.text);
            }
        }
        return strings.join("");
    }

    #generateId(): number {
        return this.#nextId ++;
    }

    #toSeconds(milliseconds: number): number {
        return milliseconds / 1000.0;
    }
}