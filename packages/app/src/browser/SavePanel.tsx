import React from "react";
import styles from "./SavePanel.module.less";

import { message, Button } from "antd";
import { val, derive } from "value-enhancer";
import { useVal } from "use-value-enhancer";
import { SrtEditor } from "srt-editor";
import { saveToFilePath } from "./fileParser";

export type SavePanelProps = React.HTMLAttributes<HTMLDivElement> & {
  readonly initialPath: string;
  readonly srtEditor: SrtEditor;
};

const SavePanel: React.FC<SavePanelProps> = props => {
  const { initialPath, srtEditor, ...restProps } = props;
  const $ = React.useMemo(() => createSavePanel$(initialPath, srtEditor), []);
  const isEditedMark = useVal($.isEditedMark);
  const onSave = React.useCallback(() => $.save(), [$]);

  return (
    <div {...restProps}>
      <Button
        className={styles["left-button"]}
        disabled={!isEditedMark}
        onClick={onSave}>
        save
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
      saveToFilePath(path, srtEditor.srtLines)
        .then(() => {
          message.success("saved successfully");
        })
        .catch(error => {
          console.error(error);
          message.error(error.message);
        });
    }
  };
}

export default SavePanel;