import { Element, Text } from "slate";
import { Segment, SegmentLeaf } from "./segment";
import { Line, LineElement } from "./line";
import { DocumentState } from "./documentState";

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

export function initElement(state: DocumentState): Element {
    const children: Text[] = [{ text: "" }];
    const line = new Line(state, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, children);
    const element: LineElement = {
        ins: line,
        children,
    };
    return element;
}

export function toElement(state: DocumentState, { begin, end, text, words }: FileSegment): Element {
    let textIndex = 0;
    const children: Text[] = [];
    const plainText: string[] = [];

    for (const { begin, end, word } of words) {
        let wordIndex = 0;
        let wordMatches = false;

        while (text[textIndex] === word[wordIndex]) {
            textIndex += 1;
            wordIndex += 1;
            if (wordIndex >= word.length) {
                wordMatches = true;
                break;
            }
        }
        if (wordMatches) {
            if (plainText.length > 0) {
                children.push({ text: plainText.splice(0).join("") });
            }
            const leaf: SegmentLeaf = {
                ins: new Segment(begin, end, word),
                text: word,
            };
            children.push(leaf);
        } else {
            plainText.push(text[textIndex]);
            wordIndex += 1;
        }
    }
    if (plainText.length > 0) {
        children.push({ text: plainText.splice(0).join("") });
    }
    const line = new Line(state, begin, end, children);
    const element: LineElement = {
        ins: line,
        children,
    };
    return element;
}