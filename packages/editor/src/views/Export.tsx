import React from "react";
import Header from "./Header";
import Editor from "./Editor";

import { useVal } from "use-value-enhancer";
import { InnerFieldsKey, SrtEditor } from "../srt_editor";

export type SrtProps = React.HTMLAttributes<HTMLDivElement> & {
  readonly srtEditor: SrtEditor;
};

export const SrtAudioView: React.FC<SrtProps> = props => {
  const { srtEditor, children, ...restProps } = props;
  const inner = srtEditor[InnerFieldsKey]();
  const audioURL = useVal(inner.$.audioURL);
  return (
    <Header
      {...restProps}
      audioURL={audioURL}
      state={inner.state}
      player={inner.player}>
      {children}
    </Header>
  );
};

export const SrtEditorView: React.FC<SrtProps> = props => {
  const { srtEditor, ...restProps } = props;
  const inner = srtEditor[InnerFieldsKey]();
  return (
    <Editor
      {...restProps}
      inner={inner} />
  );
};