import { Val } from "value-enhancer";
import { Point, Location, Range, Editor, Operation, Span, SelectionMode, SetSelectionOperation } from "slate";
import { Leaf } from "./data";

export class State {

    readonly #editor: Editor;

    #lastAnchor: Point | null = null;
    #lastSelected$: Val<boolean> | null = null;
    #lastSelectedNode: Leaf | null = null;

    public constructor(editor: Editor) {
        const protoApply = editor.apply;
        this.#editor = editor;
        editor.apply = operation => this.#injectApply(protoApply, operation);
    }

    #injectApply(protoApply: Editor["apply"], operation: Operation): void {
        protoApply(operation);
        switch (operation.type) {
            case "set_selection": {
                this.#onSelectionChange(operation);
                break;
            }
        }
    }

    #onSelectionChange(operation: SetSelectionOperation): void {
        let selectNothing = true;
        if (operation.newProperties) {
            const [begin, end] = this.#updateAndGetPoints(operation.newProperties as Range);
            let chooseNode: Leaf | null = null;

            if (Point.equals(begin, end)) {
                const node = this.#searchNode(begin);
                chooseNode = node || null;
                selectNothing = false;

                if (chooseNode && begin.offset === 0 && begin.path[1] !== 0) {
                    // offset 为 0 时，实际上打字会插入上一个节点。
                    // 调整行为，让高亮选择的节点永远是打字输入的节点。
                    const beforePath = this.#editor.before(begin);
                    if (beforePath) {
                        const beforeNode = this.#searchNode(beforePath!, "lowest");
                        if (beforeNode) {
                            chooseNode = beforeNode;
                        }
                    }
                }
            } else {
                const nodeBegin = this.#searchNode(begin, "lowest");
                const nodeEnd = this.#searchNode(end, "lowest");
                const selectedBegin$ = (nodeBegin as any)?.selected$;
                const selectedEnd$ = (nodeEnd as any)?.selected$;
                if (selectedBegin$ && selectedEnd$ && selectedBegin$ === selectedEnd$) {
                    chooseNode = nodeBegin || null;
                    selectNothing = false;
                }
            }
            if (chooseNode) {
                this.#chooseSelectedNode(chooseNode);
            }
        }
        if (selectNothing) {
            this.#chooseSelectedNode(null);
        }
    }

    #chooseSelectedNode(node: Leaf | null): void {
        if (node) {
            const selected$ = (node as any).selected$;
            if (!selected$) {
                throw new Error("node is invalid leaf");
            }
            if (selected$ !== this.#lastSelected$) {
                selected$.set(true);
                this.#lastSelected$?.set(false);
                this.#lastSelected$ = selected$;
                this.#lastSelectedNode = node;
            }
        } else if (this.#lastSelected$) {
            this.#lastSelected$.set(false);
            this.#lastSelected$ = null;
            this.#lastSelectedNode = null;
        }
    }

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

    #searchNode(at: Location | Span, mode?: SelectionMode): Leaf | undefined {
        const result = this.#editor.nodes({ at, mode });
        let node: Leaf | undefined;
        for (const [_node, _path] of result) {
            node = _node as Leaf;
        }
        return node;
    }
}