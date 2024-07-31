import { Text, Element as SlateElement } from "slate"
import { val, Val } from "value-enhancer";

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

export type Leaf = Text & ({} | {
    readonly selected$: Val<boolean>;
    readonly begin: number;
    readonly end: number;
});

export function toElement({ begin, end, text, words }: FileSegment): Element {
    let textIndex = 0;
    const leaves: Leaf[] = [];
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
                leaves.push({ text: plainText.splice(0).join("") });
            }
            leaves.push({ begin, end, text: word, selected$: val(false) });
        } else {
            plainText.push(text[textIndex]);
            wordIndex += 1;
        }
    }
    if (plainText.length > 0) {
        leaves.push({ text: plainText.splice(0).join("") });
    }
    return {
        begin,
        end,
        children: leaves,
    };
}