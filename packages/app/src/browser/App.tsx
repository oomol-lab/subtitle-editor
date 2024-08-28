import React from "react";
import FileSelector from "./FileSelector";

import { SrtEditor, SrtEditorView } from "srt-editor";

export default () => {
  return <FileSelector />;
  // const srtEditor = React.useMemo(() => new SrtEditor(
  //   "file:///Users/taozeyu/codes/github.com/oomol-lab/subtitle-editor/data/record.mp3"
  // ), []);
  // return <SrtEditorView srtEditor={srtEditor}/>;
};