import { Element as SlateElement } from "slate"

export type FileSegment = {
    readonly begin: number;
    readonly end: number;
    readonly text: string;
    readonly words: readonly {
        readonly begin: number;
        readonly end: number;
        readonly word: string;
    }[];
};

export type Element = SlateElement & {
    readonly begin: number;
    readonly end: number;
};

export function toElement(segment: FileSegment): Element {
    return {
        begin: segment.begin,
        end: segment.end,
        children: [{
            text: segment.text,
        }],
    };
}