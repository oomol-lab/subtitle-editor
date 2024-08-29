import React from "react";

import { FileSelector, FileSelectorProps } from "./FileSelector";
import { SrtEditor, SrtEditorView } from "srt-editor";

export default () => {
  const [srtEditor, setSrtEditor] = React.useState<SrtEditor | null>(null);
  const onCollectedFiles: FileSelectorProps["onCollectedFiles"] = React.useCallback(
    async ({ audioFilePath, srtFilePath }) => {
      try {
        const srtContent = await electronAPI.getContentOfFile(srtFilePath);
        const srtJSON = JSON.parse(srtContent);
        const srtEditor = new SrtEditor(audioFilePath, srtJSON);
        setSrtEditor(srtEditor);
      } catch (error) {
        console.error(error);
      }
    },
    [setSrtEditor],
  );
  if (srtEditor === null) {
    return <FileSelector onCollectedFiles={onCollectedFiles} />;
  } else {
    return <SrtEditorView srtEditor={srtEditor} />;
  }
};