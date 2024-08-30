import React from "react";
import Editor from "./Editor";
import WavesurferView, { WavesurferInstances } from "./WavesurferView";

import { useVal } from "use-value-enhancer";
import { InnerFieldsKey, SrtEditor } from "../srt_editor";
import { bindRegions, bindWavesurfer } from "../wave";

export type SrtAudioProps = {
  readonly srtEditor: SrtEditor;
  readonly onDecoded?: () => void;
};

export const SrtAudioView: React.FC<SrtAudioProps> = props => {
  const { srtEditor, onDecoded } = props;
  const inner = srtEditor[InnerFieldsKey]();
  const audioURL = useVal(inner.$.audioURL);

  const onFirstDecode = React.useCallback(({ wavesurfer, regions }: WavesurferInstances) => {
    const { state, player } = inner;
    player.bindWaveSurfer(wavesurfer);
    bindWavesurfer(state, player, wavesurfer);
    bindRegions(state, regions);
    onDecoded?.();
  }, [inner, onDecoded]);

  return (
    <WavesurferView
      url={audioURL}
      firstDecode={onFirstDecode} />
  );
};

export type SrtEditorProps = React.HTMLAttributes<HTMLDivElement> & {
  readonly srtEditor: SrtEditor;
  readonly placeholder?: string;
};

export const SrtEditorView: React.FC<SrtEditorProps> = props => {
  const { srtEditor, placeholder, ...restProps } = props;
  const inner = srtEditor[InnerFieldsKey]();
  return (
    <Editor
      {...restProps}
      inner={inner}
      placeholder={placeholder} />
  );
};