import React from "react";
import PlayerPanel from "./PlayerPanel";
import styles from "./App.module.less";

import { FileSelector, FileSelectorProps } from "./FileSelector";
import { SrtEditor, SrtEditorView, SrtAudioView } from "srt-editor";

export default () => {
  const [srtEditor, setSrtEditor] = React.useState<SrtEditor | null>(null);
  const [srtFilePath, setSrtFilePath] = React.useState<string>("");
  const onCollectedFiles: FileSelectorProps["onCollectedFiles"] = React.useCallback(
    async ({ audioFilePath, srtFilePath }) => {
      try {
        const srtContent = await electronAPI.getContentOfFile(srtFilePath);
        const srtJSON = JSON.parse(srtContent);
        const srtEditor = new SrtEditor(audioFilePath, srtJSON);
        setSrtEditor(srtEditor);
        setSrtFilePath(srtFilePath);
      } catch (error) {
        console.error(error);
      }
    },
    [setSrtEditor, setSrtFilePath],
  );
  if (srtEditor === null) {
    return <FileSelector onCollectedFiles={onCollectedFiles} />;
  } else {
    return (
      <div className={styles.main}>
        <header className={styles.header}>
          <SrtAudioView srtEditor={srtEditor} />
          <PlayerPanel
            srtEditor={srtEditor}
            srtFilePath={srtFilePath} />
        </header>
        <SrtEditorView
          className={styles.editor}
          srtEditor={srtEditor}
          placeholder="Enter some plain text..." />
      </div>
    );
  }
};