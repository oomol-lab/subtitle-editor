import styles from "./App.module.css";
import React from "react";
import Header from "./Header";
import Editor from "./Editor";

import { createEditor } from "slate";
import { withReact } from "slate-react";
import { State } from "../state";

export const App = () => {
  const editor = React.useMemo(() => withReact(createEditor()), []);
  const state = React.useMemo(() => new State(editor), [editor]);
  return (
    <div className={styles.container}>
      <Header
        className={styles.header}
        state={state}/>
      <Editor
        className={styles.content}
        editor={editor}
        state={state}/>
    </div>
  );
};
