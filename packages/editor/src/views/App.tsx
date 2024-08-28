import styles from "./App.module.css";
import React from "react";
import Header from "./Header";
import Editor from "./Editor";

import { createEditor } from "slate";
import { withReact } from "slate-react";
import { DocumentState } from "../document";
import { Player } from "../wave";

export const App = () => {
  const editor = React.useMemo(() => withReact(createEditor()), []);
  const state = React.useMemo(() => new DocumentState(editor), [editor]);
  const player = React.useMemo(() => state.bindPlayer(new Player(state)), [state]);

  return (
    <div className={styles.container}>
      <Header
        className={styles.header}
        state={state}
        player={player}/>
      <Editor
        className={styles.content}
        editor={editor}
        state={state}/>
    </div>
  );
};
