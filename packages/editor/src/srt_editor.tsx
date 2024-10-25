import type { Element } from "slate";
import type { ReactEditor } from "slate-react";
import type { ReadonlyVal, Val } from "value-enhancer";
import type { SrtLine } from "./document";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { derive, val } from "value-enhancer";
import { DocumentState, isSrtLines, toSrtLine } from "./document";
import { Player } from "./wave";

export const InnerFieldsKey = Symbol("InnerFieldsKey");
export interface InnerSrtEditor$ {
  readonly audioURL: ReadonlyVal<string>;
}

export interface InnerSrtEditor {
  readonly $: InnerSrtEditor$;
  readonly editor: ReactEditor;
  readonly state: DocumentState;
  readonly player: Player;
  getInitialElements: () => Element[];
}

export interface SrtEditor$ {
  readonly zoom: Val<number>;
  readonly volume: Val<number>;
  readonly willAlwaysPlay: Val<boolean>;
  readonly isPlaying: ReadonlyVal<boolean>;
  readonly panelPlayState: ReadonlyVal<PlayerState>;
}

// eslint-disable-next-line react-refresh/only-export-components
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

  public get onEdited(): (() => void) | null {
    return this.#state.onUpdated;
  }

  public set onEdited(onEdited: (() => void) | null) {
    this.#state.onUpdated = onEdited;
  }

  public play(): void {
    this.#player.clickPanelPlay();
  }

  public pause(): void {
    this.#player.clickPause();
  }

  public get srtLines(): SrtLine[] {
    const lines: SrtLine[] = [];
    this.#editor.children.forEach((element) => {
      const line = toSrtLine(element as Element);
      if (line) {
        lines.push(line);
      }
    });
    return lines;
  }
}
