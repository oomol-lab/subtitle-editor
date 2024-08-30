import React from "react";
import styles from "./SavePanel.module.less";

import { dump } from "js-yaml";
import { message, Button } from "antd";
import { val, derive } from "value-enhancer";
import { useVal } from "use-value-enhancer";
import { toSrtFileContent, SrtEditor, SrtLine } from "srt-editor";
import { getExtName } from "./utils";

export type SavePanelProps = React.HTMLAttributes<HTMLDivElement> & {
  readonly initialPath: string;
  readonly srtEditor: SrtEditor;
};

const SavePanel: React.FC<SavePanelProps> = props => {
  const { initialPath, srtEditor, ...restProps } = props;
  const $ = React.useMemo(() => createSavePanel$(initialPath, srtEditor), []);
  const isEditedMark = useVal($.isEditedMark);
  const onSave = React.useCallback(() => $.save(), [$]);
  const onSaveAs = React.useCallback(() => $.saveAs(), [$]);

  return (
    <div {...restProps}>
      <Button
        className={styles["left-button"]}
        disabled={!isEditedMark}
        onClick={onSave}>
        save
      </Button>
      <Button
        disabled={!isEditedMark}
        onClick={onSaveAs}>
        save as
      </Button>
    </div>
  );
};

function createSavePanel$(initialPath: string, srtEditor: SrtEditor) {
  const isEditedMark$ = val(false);
  const currentPath$ = val(initialPath);

  srtEditor.onEdited = () => isEditedMark$.set(true);

  return {
    isEditedMark: derive(isEditedMark$),
    currentPath: derive(currentPath$),

    save(): void {
      const path = currentPath$.value;
      currentPath$.set(path);
      isEditedMark$.set(false);
      saveFile(path, srtEditor.srtLines).catch(error => {
        console.error(error);
        message.error(error.message);
      });
    },
    saveAs(): void {
      // TODO:
    }
  };
}

async function saveFile(path: string, srtLines: SrtLine[]) {
  let fileContent = "";
  switch (getExtName(path).toLocaleLowerCase()) {
    case "srt": {
      fileContent = toSrtFileContent(srtLines);
      break;
    }
    case "json": {
      fileContent = JSON.stringify(srtLines, null, 2);
      break;
    }
    case "yaml":
    case "yml": {
      fileContent = dump(srtLines, { indent: 2 });
      break;
    }
    default: {
      throw new Error(`Unsupported file extension: ${path}`);
    }
  }
  await electronAPI.setFileContent(path, fileContent);
  message.success("saved successfully");
}

export default SavePanel;