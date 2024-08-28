import { createEditor } from "slate";
import { withReact, ReactEditor } from "slate-react";
import { DocumentState } from "./document";
import { Player } from "./wave";

export const InnerFieldsKey = Symbol("InnerFieldsKey");

export interface InnerSrtEditor {
  readonly editor: ReactEditor;
  readonly state: DocumentState;
  readonly player: Player;
}

export class SrtEditor {
  readonly #editor: ReactEditor;
  readonly #state: DocumentState;
  readonly #player: Player;

  public constructor() {
    this.#editor = withReact(createEditor());
    this.#state = new DocumentState(this.#editor);
    this.#player = this.#state.bindPlayer(new Player(this.#state));
  }

  [InnerFieldsKey](): InnerSrtEditor {
    return {
      editor: this.#editor,
      state: this.#state,
      player: this.#player,
    }
  }
}