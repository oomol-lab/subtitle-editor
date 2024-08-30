import { Element, Text } from "slate";
import { Validator, Schema } from "jsonschema";
import { Segment, SegmentLeaf } from "./segment";
import { Line, LineElement } from "./line";
import { DocumentState } from "./documentState";

export type SrtLine = {
    readonly begin: number;
    readonly end: number;
    readonly text: string;
    readonly words?: readonly SrtWord[];
};

export type SrtWord = {
    readonly begin: number;
    readonly end: number;
    readonly word: string;
};

export const isSrtLines: (value: unknown) => value is SrtLine[] = (() => {
    const validator = new Validator();
    const wordSchema: Schema = {
        type: "object",
        required: [
            "begin",
            "end",
            "word",
        ],
        properties: {
            begin: {
                type: "integer",
                minimum: 0,
            },
            end: {
                type: "integer",
                minimum: 0,
            },
            word: {
                type: "string",
            },
        },
    };
    const schema: Schema = {
        type: "array",
        items: {
            type: "object",
            required: [
                "begin",
                "end",
                "text",
            ],
            properties: {
                begin: {
                    type: "integer",
                    minimum: 0,
                },
                end: {
                    type: "integer",
                    minimum: 0,
                },
                text: {
                    type: "string",
                },
                words: {
                    type: "array",
                    items: wordSchema,
                },
            },
        },
    };
    return (value: unknown): value is SrtLine[] => (
        validator.validate(value, schema).valid
    );
})();

export function initElement(state: DocumentState): Element {
    const children: Text[] = [{ text: "" }];
    const line = new Line(
        state,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        children,
    );
    const element: LineElement = {
        ins: line,
        children,
    };
    return element;
}

export function toElement(state: DocumentState, { begin, end, text, words }: SrtLine): Element {
    let textIndex = 0;
    const children: Text[] = [];

    if (words) {
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
    }
    const line = new Line(state, begin, end, children);
    const element: LineElement = {
        ins: line,
        children,
    };
    return element;
}

export function toSrtLine(element: Element): SrtLine | null {
    const line = Line.get(element);
    if (!line) {
        return null;
    }
    const begin = line.$.begin.value;
    const end = line.$.end.value;
    const text = line.$.text.value;
    const words: SrtWord[] = [];

    for (const leaf of element.children) {
        const segment = Segment.get(leaf);
        if (segment) {
            words.push({
                begin: segment.$.begin.value,
                end: segment.$.end.value,
                word: (leaf as SegmentLeaf).text,
            });
        }
    }
    if (words.length > 0) {
        return { begin, end, text, words };
    } else {
        return { begin, end, text };
    }
}