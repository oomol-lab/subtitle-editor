import WaveSurfer from "wavesurfer.js";

import { val, combine, derive, Val, ReadonlyVal, compute } from "value-enhancer";
import { DocumentState, Line } from "../document";
import { toMilliseconds, toSeconds } from "./utils";
import { PlayerState, SrtEditor, SrtEditor$ } from "../srt_editor";

export type PlayerParams = {
    readonly playingLine$: ReadonlyVal<Line | null>;
    readonly panelPlayState$: ReadonlyVal<PlayerState>;
};

export enum LinePlayState {
    MarkPlay,
    Ban, // because another line is focused
    Free,
}

export class Player {

    public readonly $: SrtEditor$;

    readonly #state: DocumentState;
    readonly #zoom$: Val<number> = val(SrtEditor.zoomInitValue);
    readonly #volume$: Val<number> = val(SrtEditor.volumeInitValue);
    readonly #willAlwaysPlay$ = val<boolean>(false);
    readonly #markPlaying$ = val<boolean>(false);
    readonly #isPlaying$ = val<boolean>(false);
    readonly #focusedLine$: ReadonlyVal<Line | null>;
    readonly #playingLine$: ReadonlyVal<Line | null>;

    #wavesurfer: WaveSurfer | null = null;
    #stopTime: number = Number.POSITIVE_INFINITY;

    public constructor(state: DocumentState) {
        this.#state = state;
        this.#focusedLine$ = this.#createFocusedLine$();
        this.#playingLine$ = combine(
            [this.#markPlaying$, this.#focusedLine$],
            ([markPlaying, focusedLine]) => markPlaying ? focusedLine : null,
        );
        this.#listenValAndOperate();
        this.$ = Object.freeze({
            zoom: this.#zoom$,
            volume: this.#volume$,
            willAlwaysPlay: this.#willAlwaysPlay$,
            isPlaying: derive(this.#isPlaying$),
            panelPlayState: combine(
                [this.#focusedLine$, this.#isPlaying$],
                ([focusedLine, isPlaying]) => {
                    if (!focusedLine) {
                        return PlayerState.Disable;
                    } else if (isPlaying) {
                        return PlayerState.Playing
                    } else {
                        return PlayerState.Paused;
                    }
                },
            ),
        });
    }

    #createFocusedLine$(): ReadonlyVal<Line | null> {
        return compute(get => {
            const selectedLines = get(this.#state.$.selectedLines);
            if (selectedLines.length !== 1) {
                return null;
            }
            const selectedLine = selectedLines[0];
            if (!get(selectedLine.$.displayTimestamp)) {
                return null;
            }
            return selectedLine;
        });
    }

    #listenValAndOperate(): void {
        this.#playingLine$.reaction(playingLine => {
            if (playingLine) {
                const begin = playingLine.$.begin.value;
                const end = playingLine.$.end.value;
                this.#play(begin, end);
            } else {
                this.#pause();
            }
        });
        this.#state.$.firstSelectedTsLine.reaction(toSeekLine => {
            if (toSeekLine) {
                const time = toSeconds(toSeekLine.$.begin.value);
                this.#wavesurfer?.setTime(time);
            }
        });
    }

    public get duration(): number {
        if (!this.#wavesurfer) {
            return 0;
        }
        return toMilliseconds(this.#wavesurfer.getDuration());
    }

    public clickPlay(line: Line): void {
        if (this.#focusedLine$.value != line) {
            this.#state.selectWholeLine(line);
        }
        this.#markPlaying$.set(true);
    }

    public clickPanelPlay(): void {
        const focusedLine = this.#focusedLine$.value;
        if (!focusedLine) {
            return;
        }
        this.#markPlaying$.set(true);

        const isPlaying = this.#isPlaying$.value;
        const playingLine = this.#playingLine$.value;

        if (!isPlaying && playingLine) {
            const from = playingLine.$.begin.value;
            const to = playingLine.$.end.value;
            this.#play(from, to);
        }
    }

    public clickPause(): void {
        this.#pause();
        this.#markPlaying$.set(false);
    }

    public lineState$(line: Line): ReadonlyVal<LinePlayState> {
        return combine(
            [this.#markPlaying$, this.#focusedLine$],
            ([markPlaying, focusedLine]) => {
                if (!markPlaying) {
                    return LinePlayState.Free;
                } else if (focusedLine === line) {
                    return LinePlayState.MarkPlay;
                } else {
                    return LinePlayState.Ban;
                }
            },
        );
    }

    public bindWaveSurfer(wavesurfer: WaveSurfer): void {
        if (this.#wavesurfer) {
            throw new Error("WaveSurfer is already bound");
        }
        this.#wavesurfer = wavesurfer;
        this.#wavesurfer.on("timeupdate", currentTime => {
            if (currentTime >= this.#stopTime) {
                this.#pause();
                if (!this.#willAlwaysPlay$.value) {
                    this.#markPlaying$.set(false);
                }
            }
        });
    }

    #play(from: number, to: number): void {
        const wavesurfer = this.#wavesurfer!;
        const beginTime = toSeconds(from);
        const endTime = Math.min(toSeconds(to), wavesurfer.getDuration());

        if (beginTime > endTime) {
            return;
        }
        // must set this line first.
        // "timeupdate" event will be fired immediately after wavesurfer.setTime().
        this.#stopTime = Math.min(endTime, wavesurfer.getDuration());
        wavesurfer.setTime(beginTime);

        if (!this.#isPlaying$.value) {
            wavesurfer.play();
            this.#isPlaying$.set(true);
        }
    }

    #pause(): void {
        if (this.#isPlaying$.value) {
            this.#wavesurfer!.pause();
            this.#isPlaying$.set(false);
        }
    }
}