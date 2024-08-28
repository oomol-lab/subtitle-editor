import React from "react";
import styles from "./FileSelector.module.css";

export default (): React.ReactNode => {
  const onAudioChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
    (event) => {
      const file = event.target.files!.item(0);
      const filePath = electronAPI.getPathOfFile(file!);
      console.log("filePath", filePath);
    },
    [],
  );
  return (
    <div className={styles.container}>
      <div>
        <label>Audio File:</label>
        <input
          type="file"
          accept="audio/*"
          onChange={onAudioChange} />
      </div>
      <div>
        <label>SRT JSON File:</label>
        <input
          type="file"
          accept=".json"
          onChange={onAudioChange} />
      </div>
    </div>
  );
};