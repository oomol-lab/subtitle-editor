import WaveSurfer from "wavesurfer.js";

import { val, derive, combine, flatten, Val, ReadonlyVal } from "value-enhancer";
import { DocumentState, Line } from "../document";
import { toSeconds } from "./utils";

export type PlayerParams = {
    readonly playingLine$: ReadonlyVal<Line | null>;
};

export type Player$ = {
    readonly willAlwaysPlay: Val<boolean>;
};

export enum LinePlayState {
    MarkPlay,
    Ban, // because another line is focused
    Free,
}

export class Player {

    public readonly $: Player$;

    readonly #state: DocumentState;
    readonly #willAlwaysPlay$ = val(false);
    readonly #markPlaying = val(false);
    readonly #focusedLine$: ReadonlyVal<Line | null>;

    #wavesurfer: WaveSurfer | null = null;
    #stopTime: number = Number.POSITIVE_INFINITY;

    public constructor(state: DocumentState) {
        this.#state = state;
        this.$ = Object.freeze({
            willAlwaysPlay: this.#willAlwaysPlay$,
        });
        state.$.playingLine.reaction(playingLine => {
            if (playingLine) {
                const from = playingLine.$.begin.value;
                const to = playingLine.$.end.value;
                this.#play(from ,to);
            } else {
                this.#pause();
            }
        });
        this.#focusedLine$ = this.#createFocusedLine$();

        const playingLine$ = combine(
            [this.#markPlaying, this.#focusedLine$],
            ([markPlaying, focusedLine]) => markPlaying ? focusedLine : null,
        );
        playingLine$.reaction(playingLine => {
            if (playingLine) {
                const begin = playingLine.$.begin.value;
                const end = playingLine.$.end.value;
                this.#play(begin, end);
            } else {
                this.#pause();
            }
        });
    }

    #createFocusedLine$(): ReadonlyVal<Line | null> {
        const falseVal$ = val(false);
        const onlySelectedLine = derive(this.#state.$.selectedLines, selectedLines => {
            if (selectedLines.length !== 1) {
                return null;
            }
            return selectedLines[0];
        });
        const onlySelectedLineDisplayTimestamp = flatten(onlySelectedLine, line => {
            if (line) {
                return line.$.displayTimestamp;
            } else {
                return falseVal$;
            }
        });
        return combine([onlySelectedLine, onlySelectedLineDisplayTimestamp], ([line, displayTimestamp]) => {
            if (!line) {
                return null;
            }
            if (!displayTimestamp) {
                return null;
            }
            return line;
        });
    }

    public clickPlay(line: Line): void {
        if (this.#focusedLine$.value != line) {
            this.#state.selectFirstPositionOfLine(line);
        }
        this.#markPlaying.set(true);
    }

    public clickStop(_: Line): void {
        this.#pause();
        this.#markPlaying.set(false);
    }

    public lineState$(line: Line): ReadonlyVal<LinePlayState> {
        return combine(
            [this.#markPlaying, this.#focusedLine$],
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
                    this.#markPlaying.set(false);
                }
            }
        });
    }

    #isPlaying: boolean = false;

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

        if (!this.#isPlaying) {
            wavesurfer.play();
            this.#isPlaying = true;
        }
        wavesurfer.setTime(beginTime);
    }

    #pause(): void {
        if (this.#isPlaying) {
            this.#wavesurfer!.pause();
            this.#isPlaying = false;
        }
    }
}