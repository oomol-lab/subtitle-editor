import React from "react";
import styles from "./SrtEditor.module.css";
import Header from "./Header";
import Editor from "./Editor";

import { useVal } from "use-value-enhancer";
import { InnerFieldsKey, SrtEditor } from "../srt_editor";

export type SrtEditorViewProps = {
  readonly srtEditor: SrtEditor;
};

export const SrtEditorView: React.FC<SrtEditorViewProps> = ({ srtEditor }) => {
  const inner = srtEditor[InnerFieldsKey]();
  const { state, player } = inner;
  const audioURL = useVal(inner.$.audioURL);
  return (
    <div className={styles.container}>
      <Header
        className={styles.header}
        audioURL={audioURL}
        state={state}
        player={player} />
      <Editor
        className={styles.content}
        inner={inner} />
    </div>
  );
};