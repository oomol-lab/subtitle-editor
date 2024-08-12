import { val, derive, combine, Val, ReadonlyVal } from "value-enhancer";
import { Descendant, Element, Node } from "slate";
import { Segment, SegmentLeaf } from "./segment";
import { Player } from "../wave";

export type Line$ = {
    readonly text: ReadonlyVal<string>;
    readonly selected: ReadonlyVal<boolean>;
    readonly removed: ReadonlyVal<boolean>;
    readonly begin: ReadonlyVal<number>;
    readonly end: ReadonlyVal<number>;
    readonly displayTimestamp: ReadonlyVal<boolean>;
};

export type LineElement = Element & {
    readonly ins: Line;
}

export class Line {

    public readonly $: Line$;

    readonly #player: Player;
    readonly #selected$: Val<boolean>;
    readonly #removed$: Val<boolean>;
    readonly #begin$: Val<number>;
    readonly #end$: Val<number>;
    readonly #children$: Val<Descendant[]>;

    public constructor(player: Player, begin: number, end: number, children: Descendant[]) {
        this.#player = player;
        this.#children$ = val(children);
        this.#selected$ = val(false);
        this.#removed$ = val(false);
        this.#begin$ = val(begin);
        this.#end$ = val(end);
        this.$ = Object.freeze({
            selected: derive(this.#selected$),
            removed: derive(this.#removed$),
            begin: derive(this.#begin$),
            end: derive(this.#end$),
            text: derive(this.#children$, children => Line.#getTextOfChildren(children)),
            displayTimestamp: combine(
                [this.#begin$, this.#end$],
                ([begin, end]) => (
                    begin !== Number.MAX_SAFE_INTEGER &&
                    end !== Number.MIN_SAFE_INTEGER
                ),
            ),
        });
    }

    public static get(node: Node): Line | null {
        const instance = (node as any as Record<string, unknown>).ins;
        if (instance instanceof Line) {
            return instance;
        }
        return null;
    }

    public static empty(player: Player): Line {
        return new Line(player, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, []);
    }

    public static splitElement(player: Player, source: Element, position: number): [Element, Element] {
        const line = Line.get(source);
        if (!line) {
            throw new Error("element is not a line");
        }
        const leftChildren = source.children.slice(0, position);
        const rightChildren = source.children.slice(position);

        let [leftBegin, leftEnd] = Line.#getBorders(leftChildren);
        let [rightBegin, rightEnd] = Line.#getBorders(rightChildren);

        if (leftBegin !== Number.MAX_SAFE_INTEGER) {
            leftBegin = Math.min(leftBegin, line.$.begin.value);
        }
        if (rightEnd !== Number.MIN_SAFE_INTEGER) {
            rightEnd = Math.max(rightEnd, line.$.end.value);
        }
        if (leftBegin >= leftEnd) {
            leftBegin = Math.min(leftEnd, Line.#getBorders(leftChildren)[0]);
        }
        if (rightEnd <= rightBegin) {
            rightEnd = Math.max(rightBegin, Line.#getBorders(rightChildren)[1]);
        }
        const left: LineElement = {
            ins: new Line(player, leftBegin, leftEnd, leftChildren),
            children: leftChildren,
        };
        const right: LineElement = {
            ins: new Line(player, rightBegin, rightEnd, rightChildren),
            children: rightChildren,
        };
        return [left, right];
    }

    public get player(): Player {
        return this.#player;
    }

    public setSelected(selected: boolean): void {
        this.#selected$.set(selected);
    }

    public fireRemoved(): void {
        this.#removed$.set(true);
    }

    public checkIsLastWord(word: string): boolean {
        const children = this.#children$.value;
        if (children.length > 1) {
            return false;
        }
        if (children.length === 0) {
            return true;
        }
        const child = children[0];

        if (!("text" in child)) {
            return true;
        }
        return child.text.length === word.length;
    }

    public updateRange(begin: number, end: number): void {
        this.#begin$.set(begin);
        this.#end$.set(end);
    }

    public fireChildrenMaybeChanged(children: Descendant[]): void {
        if (this.#children$.value === children) {
            return;
        }
        let begin = Number.MAX_SAFE_INTEGER;
        let end = Number.MIN_SAFE_INTEGER;

        for (const child of children) {
            const segment = Segment.get(child);
            if (segment) {
                segment.fireMaybeChanged(child as SegmentLeaf);
                begin = Math.min(begin, segment.$.begin.value);
                end = Math.max(end, segment.$.end.value);
            }
        }
        this.#begin$.set(begin);
        this.#end$.set(end);
        this.#children$.set(children);
    }

    static #getTextOfChildren(children: Descendant[]): string {
        const strings: string[] = [];
        for (const child of children) {
            if ("text" in child) {
                strings.push(child.text);
            }
        }
        return strings.join("");
    }

    static #getBorders(children: Descendant[]): [number, number] {
        let begin = Number.MAX_SAFE_INTEGER;
        let end = Number.MIN_SAFE_INTEGER;

        for (const child of children) {
            const segment = Segment.get(child);
            if (segment) {
                begin = Math.min(begin, segment.$.begin.value);
                end = Math.max(end, segment.$.end.value);
            }
        }
        return [begin, end];
    }
}