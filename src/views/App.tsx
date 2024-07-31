import styles from "./App.module.css";
import React from "react";
import Editor from "./Editor";

export const App = () => {
  return (
    <div className={styles.container}>
      <Editor />
    </div>
  );
};
