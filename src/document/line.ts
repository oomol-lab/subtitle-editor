import { val, derive, combine, Val, ReadonlyVal } from "value-enhancer";
import { Descendant, Element, Node } from "slate";
import { Segment, SegmentLeaf } from "./segment";
import { Player } from "../wave";
import { DocumentState } from "./documentState";

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

    readonly #state: DocumentState;
    readonly #selected$: Val<boolean>;
    readonly #removed$: Val<boolean>;
    readonly #begin$: Val<number>;
    readonly #end$: Val<number>;
    readonly #children$: Val<Descendant[]>;

    #refElement: HTMLDivElement | null = null;
    #index: number = -1;

    public constructor(state: DocumentState, begin: number, end: number, children: Descendant[]) {
        this.#state = state;
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

    public static empty(state: DocumentState): Line {
        return new Line(state, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, []);
    }

    public static splitElement(state: DocumentState, source: Element, position: number): [Element, Element] {
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
            ins: new Line(state, leftBegin, leftEnd, leftChildren),
            children: leftChildren,
        };
        const right: LineElement = {
            ins: new Line(state, rightBegin, rightEnd, rightChildren),
            children: rightChildren,
        };
        return [left, right];
    }

    public get player(): Player {
        return this.#state.player;
    }

    public setRef = (refElement: HTMLDivElement | null): void => {
        this.#refElement = refElement;
    };

    public getBoundingClientRect(): DOMRect | null {
        if (!this.#refElement) {
            return null;
        }
        return this.#refElement.getBoundingClientRect();
    }

    public setSelected(selected: boolean): void {
        this.#selected$.set(selected);
    }

    public fireRemoved(): void {
        this.#removed$.set(true);
    }

    public clickCreateTimestamp(): void {
        const [begin, end] = this.#getRangeOfCreated();
        const editor = this.#state.editor;
        const path = [this.#index];
        const node: LineElement = {
            ins: this,
            children: this.#children$.value.map(child => {
                if (!("text" in child) || Segment.get(child)) {
                    return child;
                }
                const text = child.text;
                const segment = new Segment(begin, end, text);

                return { text, ins: segment };
            }),
        };
        editor.removeNodes({ at: path });
        editor.insertNode(node, { at: path });

        this.#begin$.set(begin);
        this.#end$.set(end);
        this.#state.selectWholeLine(this);
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

    public markIndex(index: number): void {
        this.#index = index;
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

    #getRangeOfCreated(): [number, number] {
        const defaultDuration = 1500;
        const defaultOffset = 500;
        const audioDuration = this.#state.player.duration;
        const minDuration = Math.min(100, audioDuration);
        const previousLine = this.#getBrotherLine(-1);
        const nextLine = this.#getBrotherLine(+1);

        let leftBorder = 0;
        let rightBorder = audioDuration;

        if (previousLine) {
            leftBorder = previousLine.#end$.value;
        }
        if (nextLine) {
            rightBorder = nextLine.#begin$.value;
        }
        rightBorder = Math.max(leftBorder, rightBorder);

        const gapDuration = rightBorder - leftBorder;

        let begin, end: number;

        if (gapDuration >= defaultDuration + 2.0 * defaultOffset) {
            begin = leftBorder + defaultOffset;
            end = begin + defaultDuration;
        } else if (gapDuration >= defaultDuration) {
            begin = (gapDuration - defaultDuration) * 0.5;
            end = begin + defaultDuration;
        } else if (gapDuration >= minDuration) {
            begin = leftBorder;
            end = rightBorder;
        } else {
            const center = (leftBorder + rightBorder) / 2.0;
            begin = center - minDuration / 2.0;
            end = center + minDuration / 2.0;

            if (begin < 0) {
                begin = 0;
                end = minDuration;
            } else if (end > audioDuration) {
                begin = audioDuration - minDuration;
                end = audioDuration;
            }
        }
        return [begin, end];
    }

    #getBrotherLine(increaseIndex: number): Line | null {
        const lines = this.#state.$.lines.value;
        let targetLine: Line | null = null;
        let index = this.#index + increaseIndex;

        while (true) {
            targetLine = lines[index];
            if (!targetLine) {
                break;
            }
            if (targetLine.$.displayTimestamp.value) {
                break;
            }
            index += increaseIndex;
        }
        return targetLine;
    }
}