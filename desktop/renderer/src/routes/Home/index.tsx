import { SrtAudioView, SrtEditor, SrtEditorView } from "@subtitle/editor";
import React, { useCallback, useState } from "react";
import { parseSrtFilePath } from "../../fileParser";
import { FileSelector, type FileSelectorProps } from "../../FileSelector";
import PlayerPanel from "../../PlayerPanel";

import styles from "./index.module.less";

export const Home = () => {
  const [srtEditor, setSrtEditor] = useState<SrtEditor | null>(null);
  const [srtFilePath, setSrtFilePath] = useState<string>("");

  const onCollectedFiles: FileSelectorProps["onCollectedFiles"] = useCallback(
    async ({ audioFilePath, srtFilePath }) => {
      try {
        const srtLines = await parseSrtFilePath(srtFilePath);
        const srtEditor = new SrtEditor(audioFilePath, srtLines);
        setSrtEditor(srtEditor);
        setSrtFilePath(srtFilePath);
      }
      catch (error) {
        console.error(error);
      }
    },
    [setSrtEditor, setSrtFilePath],
  );

  return (
    <>
      {
        srtEditor === null
          ? (
              <FileSelector onCollectedFiles={onCollectedFiles} />
            )
          : (
              <div className={styles.main}>
                <header className={styles.header}>
                  <SrtAudioView srtEditor={srtEditor} />
                  <PlayerPanel
                    srtEditor={srtEditor}
                    srtFilePath={srtFilePath}
                  />
                </header>
                <SrtEditorView
                  className={styles.editor}
                  srtEditor={srtEditor}
                  placeholder="Enter some plain text..."
                />
              </div>
            )
      }
    </>
  );
};
