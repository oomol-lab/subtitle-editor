import type { ReadonlyVal } from "value-enhancer";
import type { WaveSurferOptions } from "wavesurfer.js";

import type WaveSurfer from "wavesurfer.js";
import type { DocumentState } from "../document";
import type { Player } from "./player";
import { combine } from "value-enhancer";
import { toSeconds } from "./utils";

export function bindWavesurfer(state: DocumentState, player: Player, wavesurfer: WaveSurfer): void {
  const options$: ReadonlyVal<Partial<WaveSurferOptions>> = combine(
    [player.$.volume],
    ([volume]) => ({
      barHeight: volume,
    }),
  );
  player.$.zoom.subscribe((zoom) => {
    wavesurfer.zoom(zoom);
  });
  state.$.firstSelectedTsLine.subscribe((firstSelectedLine) => {
    if (!firstSelectedLine) {
      return;
    }
    const $ = firstSelectedLine.$;
    const zoom = player.$.zoom.value;
    const selectedBegin = toSeconds($.begin.value);
    const selectedEnd = toSeconds($.end.value);
    const selectedWidth = selectedEnd - selectedBegin;
    const scrollBegin = wavesurfer.getScroll() / zoom;
    const scrollWidth = wavesurfer.getWidth() / zoom;
    const scrollEnd = scrollBegin + scrollWidth;

    if (selectedWidth >= scrollWidth) {
      if (scrollEnd < selectedBegin || scrollBegin > selectedEnd) { // not touch
        wavesurfer.setScrollTime(selectedBegin);
      }
    }
    else if (selectedBegin < scrollBegin || selectedEnd > scrollEnd) { // not include
      const time = selectedBegin - (scrollWidth - selectedWidth) * 0.15;
      wavesurfer.setScrollTime(time);
    }
  });
  options$.subscribe(options => wavesurfer.setOptions(options));
}
