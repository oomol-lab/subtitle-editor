import slate, { Editor, Element, Point, Node, Range, Span, Text, Path } from "slate";

import { Remitter, EventReceiver } from "remitter";
import { compute, derive, ReadonlyVal, val, Val } from "value-enhancer";
import { Segment } from "./segment";
import { Line, LineElement } from "./line";
import { FileSegment, toElement } from "./file";
import { Player } from "../wave";

export type DocumentState$ = {
    readonly lines: ReadonlyVal<readonly Line[]>;
    readonly highlightSegment: ReadonlyVal<Segment | null>;
    readonly selectedLines: ReadonlyVal<readonly Line[]>;
    readonly firstSelectedTsLine: ReadonlyVal<Line | null>;
};

export type DocumentEvents = {
    readonly addedLine: Line;
    readonly removedLine: Line;
};

export class DocumentState {

    public readonly $: DocumentState$;

    readonly #editor: Editor;
    readonly #remitter: Remitter<DocumentEvents>;
    readonly #highlightSegment$: Val<Segment | null>;
    readonly #lines$: Val<readonly Line[]>;
    readonly #selectedLines$: Val<readonly Line[]>;

    #player: Player | null = null;
    #editorElement: HTMLDivElement | null = null;

    public constructor(editor: Editor) {
        const protoApply = editor.apply;
        this.#editor = editor;
        this.#remitter = new Remitter();
        this.#lines$ = val<readonly Line[]>([]);
        this.#selectedLines$ = val<readonly Line[]>([]);
        this.#highlightSegment$ = val<Segment | null>(null);
        this.$ = Object.freeze({
            lines: derive(this.#lines$),
            selectedLines: derive(this.#selectedLines$),
            highlightSegment: derive(this.#highlightSegment$),
            firstSelectedTsLine: this.#getFirstSelectedTsLine$(),
        });
        editor.apply = operation => this.#injectApply(protoApply, operation);
        Promise.resolve().then(() => this.fireEditorValueUpdating(editor.children));
    }

    #getFirstSelectedTsLine$(): ReadonlyVal<Line | null> {
        return compute(get => {
            let displayLine: Line | null = null;
            for (const line of get(this.#selectedLines$)) {
                if (get(line.$.displayTimestamp)) {
                    displayLine = line;
                }
            }
            return displayLine;
        });
    }

    public get events(): EventReceiver<DocumentEvents> {
        return this.#remitter;
    }

    public get player(): Player {
        return this.#player!;
    }

    public get editor(): Editor {
        return this.#editor;
    }

    public setEditorRef = (editorElement: HTMLDivElement | null): void => {
        this.#editorElement = editorElement;
    };

    public toElement(fileSegment: FileSegment): Element {
        return toElement(this, fileSegment);
    }

    public bindPlayer(player: Player): Player {
        return this.#player = player;
    }

    public selectWholeLine(line: Line): void {
        const rowIndex = this.#lines$.value.indexOf(line);
        const container = this.#editorElement;

        if (rowIndex === -1) {
            return;
        }
        this.#editor.select([rowIndex]);

        if (!container) {
            return;
        }
        const lineReact = line.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (!lineReact) {
            return;
        }
        const viewTop = lineReact.top - containerRect.top;
        const viewBottom = viewTop + lineReact.height;

        if (viewBottom <= 0 || viewTop >= containerRect.height) {
            container.scrollTo({
                top: container.scrollTop + viewTop,
                behavior: "smooth",
            });
        }
    }

    public fireEditorValueUpdating(children: slate.Descendant[]): void {
        const previousLines = new Set(this.#lines$.value);
        const lines: Line[] = [];
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const line = Line.get(child);
            if (line) {
                lines.push(line);
                line.markIndex(i);
                if (previousLines.has(line)) {
                    const subChildren = (child as slate.Element).children;
                    line.fireChildrenMaybeChanged(subChildren);
                    previousLines.delete(line);
                } else {
                    this.#remitter.emit("addedLine", line);
                }
            }
        }
        for (const removedLine of previousLines) {
            removedLine.fireRemoved();
            this.#remitter.emit("removedLine", removedLine);
        }
        this.#lines$.set(lines);
    }

    #injectApply(protoApply: Editor["apply"], operation: slate.Operation): void {
        switch (operation.type) {
            case "split_node": {
                this.#splitNode(operation);
                break;
            }
            case "set_selection": {
                protoApply(operation);
                this.#onSelectionChange(operation);
                break;
            }
            case "remove_text": {
                protoApply(operation);
                this.#onRemoveText(operation);
                break;
            }
            default: {
                protoApply(operation);
                break;
            }
        }
    }

    #lastTextPosition: number = -1;
    #waitSplitTexts: [Text, Text] | null = null;
    #selectedLinesSet: Set<Val<boolean>> = new Set();

    #splitNode({ path, position }: slate.SplitNodeOperation): void {
        if (path.length === 0) {
            return;
        }
        const editor = this.#editor;
        const node = Node.get(editor, path);

        if ("text" in node) {
            this.#lastTextPosition = position;
            if (position > 0 && position < node.text.length) {
                // cannot split on this tick or fail.
                // I don't know why, but it works.
                this.#waitSplitTexts = Segment.splitText(node, position);
                setTimeout(() => this.#waitSplitTexts = null, 0);
            }
        } else if (Line.get(node)) {
            if (position === 1 && this.#lastTextPosition === 0) {
                // to fix cannot press enter at the beginning of the line.
                // I don't know why, but it works.
                position = 0;
            }
            const [left, right] = Line.splitElement(this, node, position);
            const nextPath = this.#nextPath(path);

            if (this.#waitSplitTexts) {
                const [leftLeaf, rightLeaf] = this.#waitSplitTexts;
                left.children[left.children.length - 1] = leftLeaf;
                right.children.unshift(rightLeaf);
            }
            for (const selected$ of this.#selectedLinesSet) {
                selected$.set(false);
            }
            this.#selectedLinesSet.clear();

            Promise.resolve().then(() => {
                editor.removeNodes({ at: path });
                editor.insertNodes(left, { at: path });
                editor.insertNodes(right, { at: nextPath });
                editor.select({
                    path: editor.first(nextPath)[1],
                    offset: 0,
                });
            });
        }
    }

    #nextPath(path: Path): Path {
        const nextPath = [...path];
        nextPath[nextPath.length - 1] += 1;
        return nextPath;
    }

    #onSelectionChange({ newProperties }: slate.SetSelectionOperation): void {
        let nextHighlightSegment: Segment | null = this.#highlightSegment$.value;

        if (newProperties) {
            const [begin, end] = this.#updateAndGetPoints(newProperties as Range);
            const highlightSegment = this.#findClosedToCursor(begin, end);

            if (highlightSegment !== undefined) {
                nextHighlightSegment = highlightSegment;
            }
            this.#updateSelectedLines(begin, end);
        }
        if (this.#highlightSegment$.value !== nextHighlightSegment) {
            this.#highlightSegment$.value?.setSelected(false);
            this.#highlightSegment$.set(nextHighlightSegment);
            nextHighlightSegment?.setSelected(true);
        }
    }

    #lastAnchor: Point | null = null;

    #updateAndGetPoints({ anchor, focus }: Range): [Point, Point] {
        if (anchor) {
            this.#lastAnchor = anchor;
        } else if (this.#lastAnchor) {
            anchor = this.#lastAnchor;
        }
        if (!anchor && !focus) {
            throw new Error("invalid state");
        }
        if (!anchor || !focus) {
            const point = anchor || focus;
            return [point, point];
        }
        if (Point.isBefore(anchor, focus)) {
            return [anchor, focus];
        } else {
            return [focus, anchor];
        }
    }

    /** @return Segment means new closed to cursor; undefined means keeping last; null means replace with nothing */
    #findClosedToCursor(begin: Point, end: Point): Segment | null | undefined {
        let segment: Segment | undefined | null = undefined;
        if (Point.equals(begin, end)) {
            segment = this.#searchSegment(begin);
            if (segment && begin.offset === 0 && begin.path[1] !== 0) {
                // When offset is 0, typing will actually insert the previous node.
                // Adjust the behavior so that the highlighted node is always the node being typed.
                const beforePath = this.#editor.before(begin);
                if (beforePath) {
                    segment = this.#searchSegment(beforePath!, "lowest");
                }
            }
        } else {
            const segmentBegin = this.#searchSegment(begin, "lowest");
            const segmentEnd = this.#searchSegment(end, "lowest");
            if (segmentBegin && segmentEnd && segmentBegin === segmentEnd) {
                segment = segmentBegin;
            } else {
                // select more than one segments, cancel them all
                segment = null;
            }
        }
        return segment;
    }

    #searchSegment(at: slate.Location | Span, mode?: slate.SelectionMode): Segment | undefined {
        const result = this.#editor.nodes({ at, mode });
        let segment: Segment | undefined;
        for (const [node, _path] of result) {
            const found = Segment.get(node);
            if (found) {
                segment = found;
            }
        }
        return segment;
    }

    #updateSelectedLines(begin: Point, end: Point): void {
        const previousSelectedLines = new Set(this.#selectedLines$.value);
        const selectedLines: Line[] = [];

        for (let i = begin.path[0]; i <= end.path[0]; i++) {
            const node = Node.get(this.#editor, [i]);
            const line = Line.get(node);
            if (line) {
                selectedLines.push(line);
                previousSelectedLines.delete(line);
                line.setSelected(true);
            }
        }
        for (const line of previousSelectedLines) {
            line.setSelected(false);
        }
        this.#selectedLines$.set(selectedLines);
    }

    #onRemoveText({ path, text }: slate.RemoveTextOperation): void {
        if (path.length !== 2) {
            return;
        }
        const lineIndex = path[0];
        const node = Node.get(this.#editor, [lineIndex]);
        const line = Line.get(node);
        if (!line) {
            return;
        }
        if (line.checkIsLastWord(text)) {
            const lineElement: LineElement = {
                ins: Line.empty(this),
                children: [],
            };
            Promise.resolve().then(() => {
                this.#editor.insertNodes(lineElement, { at: [lineIndex] });
                this.#editor.removeNodes({ at: [lineIndex + 1] });
                this.#editor.select([lineIndex]);
            });
        }
    }
}