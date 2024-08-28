import styles from "./SrtEditor.module.css";
import React from "react";
import Header from "./Header";
import Editor from "./Editor";

import { InnerFieldsKey, SrtEditor } from "../srt_editor";

export type SrtEditorViewProps = {
  readonly srtEditor: SrtEditor;
};

export const SrtEditorView: React.FC<SrtEditorViewProps> = ({ srtEditor }) => {
  const inner = srtEditor[InnerFieldsKey]();
  const { editor, state, player } = inner;
  return (
    <div className={styles.container}>
      <Header
        className={styles.header}
        state={state}
        player={player} />
      <Editor
        className={styles.content}
        inner={inner} />
    </div>
  );
};