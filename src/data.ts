import { Text, Element as SlateElement, Descendant } from "slate"
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
    readonly type: "element";
    readonly begin: number;
    readonly end: number;
};

export type Leaf = Text & ({} | {
    readonly selected$: Val<boolean>;
    readonly begin: number;
    readonly end: number;
});

export function isElement(element: Descendant): element is Element {
    return (element as any).type === "element";
}

export function isLeaf(element: Descendant): element is Leaf {
    return "text" in element;
}

export function isElementHasTimestamp(element: Element): boolean {
    return (
        element.begin !== Number.MAX_SAFE_INTEGER &&
        element.end !== Number.MIN_SAFE_INTEGER
    );
}

export function beginAndEnd(children: readonly Descendant[]): [number, number] {
    let begin = Number.MAX_SAFE_INTEGER;
    let end = Number.MIN_SAFE_INTEGER;
    for (const child of children) {
        if (isLeaf(child) && "selected$" in child) {
            begin = Math.min(begin, child.begin);
            end = Math.max(end, child.end);
        }
    }
    return [begin, end];
}

export function splitElement(source: Element, position: number): [Element, Element] {
    const leftChildren = source.children.slice(0, position);
    const rightChildren = source.children.slice(position);
    let rightBegin = source.begin;
    let leftEnd = source.end;

    for (let i = leftChildren.length - 1; i >=0; i--) {
        const child = leftChildren[i];
        if (isLeaf(child) && "selected$" in child) {
            leftEnd = child.end;
            break;
        }
    }
    for (let i = 0; i < rightChildren.length; i++) {
        const child = rightChildren[i];
        if (isLeaf(child) && "selected$" in child) {
            rightBegin = child.begin;
            break;
        }
    }
    const left: Element = {
        ...source,
        children: leftChildren,
        end: leftEnd,
    };
    const right: Element = {
        ...source,
        children: rightChildren,
        begin: rightBegin,
    };
    return [left, right];
}

export function splitLeaf(source: Leaf, position: number): [Leaf, Leaf] {
    const leftText = source.text.slice(0, position);
    const rightText = source.text.slice(position);

    let left: Leaf;
    let right: Leaf;

    if ("selected$" in source) {
        const rate = position / source.text.length;
        const duration = source.end - source.begin;
        const middle = source.begin + Math.round(duration * rate);
        left = {
            ...source,
            text: leftText,
            selected$: val(false),
            end: middle,
        };
        right = {
            ...source,
            text: rightText,
            selected$: val(false),
            begin: middle,
        };
    } else {
        left = { ...source, text: leftText };
        right = { ...source, text: rightText };
    }
    return [left, right];
}

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
    return { type: "element", begin, end, children: leaves };
}