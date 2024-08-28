import { createEditor, Descendant } from "slate";
import { withReact, ReactEditor } from "slate-react";
import { ReadonlyVal, Val, val, derive } from "value-enhancer";
import { FileSegment, DocumentState } from "./document";
import { Player } from "./wave";

export const InnerFieldsKey = Symbol("InnerFieldsKey");
export type InnerSrtEditor$ = {
  readonly audioURL: ReadonlyVal<string>;
};

export interface InnerSrtEditor {
  readonly $: InnerSrtEditor$;
  readonly editor: ReactEditor;
  readonly state: DocumentState;
  readonly player: Player;
  getInitElements(): Descendant[];
}

export class SrtEditor {
  readonly #editor: ReactEditor;
  readonly #state: DocumentState;
  readonly #player: Player;
  readonly #audioURL$: Val<string>;

  public constructor(audioURL: string) {
    this.#editor = withReact(createEditor());
    this.#state = new DocumentState(this.#editor);
    this.#player = this.#state.bindPlayer(new Player(this.#state));
    this.#audioURL$ = val(audioURL);
  }

  public get fileSegments(): readonly FileSegment[] {
    return [];
  }

  public set fileSegments(segments: readonly FileSegment[]) {
    this.#editor.insertFragment(segments.map(s => this.#state.toElement(s)));
  }

  [InnerFieldsKey](): InnerSrtEditor {
    return {
      $: {
        audioURL: derive(this.#audioURL$),
      },
      editor: this.#editor,
      state: this.#state,
      player: this.#player,
      getInitElements: () => this.fileSegments.map(s => this.#state.toElement(s)),
    }
  }
}