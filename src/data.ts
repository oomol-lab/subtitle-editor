import { ReactNode } from "react";
import { Element as SlateElement } from "slate"
import { RenderElementProps } from "slate-react";

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

export function toParagraph(segment: FileSegment): SlateElement {
    return null as any;
}