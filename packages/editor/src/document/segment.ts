import { Text, Node } from "slate";
import { derive, ReadonlyVal, val, Val } from "value-enhancer";

export type Segment$ = {
    readonly selected: ReadonlyVal<boolean>;
    readonly begin: ReadonlyVal<number>;
    readonly end: ReadonlyVal<number>;
    readonly text: ReadonlyVal<string>;
};

export type SegmentLeaf = Text & {
    readonly ins: Segment;
};

export class Segment {

    public readonly $: Segment$;

    readonly #selected$: Val<boolean>;
    readonly #begin$: Val<number>;
    readonly #end$: Val<number>;
    readonly #text$: Val<string>;

    #lastLeaf: SegmentLeaf | null = null;

    public constructor(begin: number, end: number, text: string) {
        this.#selected$ = val(false);
        this.#begin$ = val(begin);
        this.#end$ = val(end);
        this.#text$ = val(text);
        this.$ = Object.freeze({
            selected: derive(this.#selected$),
            begin: derive(this.#begin$),
            end: derive(this.#end$),
            text: derive(this.#text$),
        });
    }

    public static get(node: Node): Segment | null {
        const instance = (node as any as Record<string, unknown>).ins;
        if (instance instanceof Segment) {
            return instance;
        }
        return null;
    }

    public static splitText(source: Text, position: number): [Text, Text] {
        const segment = Segment.get(source);
        const leftContext = source.text.slice(0, position);
        const rightContent = source.text.slice(position);

        let left: Text | SegmentLeaf;
        let right: Text | SegmentLeaf;

        if (segment) {
            const begin = segment.#begin$.value;
            const end = segment.#end$.value;
            const rate = position / source.text.length;
            const duration = end - begin;
            const middle = begin + Math.round(duration * rate);
            const leftSegment = new Segment(begin, middle, leftContext);
            const rightSegment = new Segment(middle, end, rightContent);
            left = {
                ...source,
                ins: leftSegment,
                text: leftContext,
            };
            right = {
                ...source,
                ins: rightSegment,
                text: rightContent,
            };
        } else {
            left = { ...source, text: leftContext };
            right = { ...source, text: rightContent };
        }
        return [left, right];
    }

    public setSelected(selected: boolean): void {
        this.#selected$.set(selected);
    }

    public fireMaybeChanged(leaf: SegmentLeaf): void {
        if (this.#lastLeaf !== leaf) {
            this.#text$.set(leaf.text);
        }
    }
}