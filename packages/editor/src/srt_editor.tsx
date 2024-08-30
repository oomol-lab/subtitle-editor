import { createEditor, Element } from "slate";
import { withReact, ReactEditor } from "slate-react";
import { ReadonlyVal, Val, val, derive } from "value-enhancer";
import { toSrtLine, isSrtLines, SrtLine, DocumentState } from "./document";
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
  getInitialElements(): Element[];
}

export type SrtEditor$ = {
  readonly zoom: Val<number>;
  readonly volume: Val<number>;
  readonly willAlwaysPlay: Val<boolean>;
  readonly isPlaying: ReadonlyVal<boolean>;
  readonly panelPlayState: ReadonlyVal<PlayerState>;
};

export enum PlayerState {
  Disable,
  Playing,
  Paused,
}

export class SrtEditor {
  public static readonly zoomInitValue = 50;
  public static readonly volumeInitValue = 1.0;

  readonly #editor: ReactEditor;
  readonly #state: DocumentState;
  readonly #player: Player;
  readonly #audioURL$: Val<string>;
  readonly #inner: InnerSrtEditor;

  #initialElements: Element[] | null;

  public constructor(audioURL: string, srtLines: readonly SrtLine[]) {
    if (!isSrtLines(srtLines)) {
      throw new Error("Invalid srtLines");
    }
    this.#editor = withReact(createEditor());
    this.#state = new DocumentState(this.#editor);
    this.#player = this.#state.bindPlayer(new Player(this.#state));
    this.#audioURL$ = val(audioURL);
    this.#initialElements = this.#state.loadInitialFileSegments(srtLines);
    this.#inner = {
      $: { audioURL: derive(this.#audioURL$) },
      editor: this.#editor,
      state: this.#state,
      player: this.#player,
      getInitialElements: () => {
        if (this.#initialElements === null) {
          return [];
        }
        const elements = this.#initialElements;
        this.#initialElements = null;
        return elements;
      },
    };
  }

  [InnerFieldsKey](): InnerSrtEditor {
    return this.#inner;
  }

  public get $(): SrtEditor$ {
    return this.#player.$;
  }

  public play(): void {
    this.#player.clickPanelPlay();
  }

  public pause(): void {
    this.#player.clickPause();
  }

  public get srtLines(): SrtLine[] {
    const lines: SrtLine[] = [];
    this.#editor.children.map((element) => {
      const line = toSrtLine(element as Element);
      if (line) {
        lines.push(line);
      }
    });
    return lines;
  }
}