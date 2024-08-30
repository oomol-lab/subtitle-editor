import React from "react";
import styles from "./FileSelector.module.less";

export type FileSelectorProps = {
  readonly onCollectedFiles: (files: {
    readonly audioFilePath: string;
    readonly srtFilePath: string;
  }) => void;
};

export const FileSelector = ({ onCollectedFiles }: FileSelectorProps): React.ReactNode => {
  const fileCollector = React.useMemo(() => new FileCollector(2), []);
  const [onAudioFileChange, onSrtFileChange] = fileCollector.listeners();
  fileCollector.onCollectedFiles = React.useCallback(
    (filePaths) => {
      const [audioFilePath, srtFilePath] = filePaths;
      onCollectedFiles({ audioFilePath, srtFilePath });
    },
    [onCollectedFiles],
  );
  return (
    <div className={styles.container}>
      <div>
        <label>Audio File:</label>
        <input
          type="file"
          accept="audio/*"
          onChange={onAudioFileChange} />
      </div>
      <div>
        <label>SRT JSON File:</label>
        <input
          type="file"
          accept=".json"
          onChange={onSrtFileChange} />
      </div>
    </div>
  );
};

class FileCollector {
  public onCollectedFiles: (filePaths: (string)[]) => void = () => void 0;

  readonly #listeners: readonly React.ChangeEventHandler<HTMLInputElement>[];
  readonly #filePaths: (string | undefined)[] = [];

  #collectedCount: number = 0;

  public constructor(count: number) {
    const listeners: React.ChangeEventHandler<HTMLInputElement>[] = [];
    for (let i = 0; i < count; i++) {
      listeners.push(this.#createOnChange(i));
    }
    this.#listeners = Object.freeze(listeners);
  }

  public listeners(): readonly React.ChangeEventHandler<HTMLInputElement>[] {
    return this.#listeners.map(l => React.useCallback(l, []));
  }

  #createOnChange(index: number): React.ChangeEventHandler<HTMLInputElement> {
    return (event) => {
      const file = event.target.files?.item(0);
      if (file) {
        const filePath = electronAPI.getPathOfFile(file);
        const originFilePath = this.#filePaths[index];
        this.#filePaths[index] = filePath;
        if (originFilePath === undefined) {
          this.#collectedCount += 1;
          if (this.#collectedCount === this.#listeners.length) {
            this.onCollectedFiles([...this.#filePaths] as string[]);
          }
        }
      }
    };
  }
}