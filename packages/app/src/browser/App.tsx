import React from "react";

import { SrtEditor, SrtEditorView } from "srt-editor";

export default () => {
  const srtEditor = React.useMemo(() => new SrtEditor(), []);
  return <SrtEditorView srtEditor={srtEditor}/>;
};