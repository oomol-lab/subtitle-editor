import { Val } from "value-enhancer";
import { BaseSetSelectionOperation, Editor, Operation } from "slate";
import { Leaf } from "./data";

export class State {

    readonly #editor: Editor;
    #lastSelected$: Val<boolean> | null = null;

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

    #onSelectionChange(operation: BaseSetSelectionOperation): void {
        let didChangeSuccess = false;
        const anchor = operation.newProperties?.anchor;
        if (anchor) {
            const result = this.#editor.nodes({
                at: anchor,
            });
            let node: Leaf | undefined
            for (const [_node, _path] of result) {
                node = _node as Leaf;
            }
            if ((node as any)?.selected$) {
                const selected$: Val<boolean> = (node as any).selected$;
                if (this.#lastSelected$ !== selected$) {
                    selected$.set(true);
                    this.#lastSelected$?.set(false);
                    this.#lastSelected$ = selected$;
                    didChangeSuccess = true;
                }
            }
        }
        if (this.#lastSelected$ && !didChangeSuccess) {
            this.#lastSelected$.set(false);
            this.#lastSelected$ = null;
        }
    }
}