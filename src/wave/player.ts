import { val, Val } from "value-enhancer";

export type Player$ = {
    readonly willAlwaysPlay: Val<boolean>;
};

export class Player {

    public readonly $: Player$;

    readonly #willAlwaysPlay$ = val(false);

    public constructor() {
        this.$ = Object.freeze({
            willAlwaysPlay: this.#willAlwaysPlay$,
        });
    }
}