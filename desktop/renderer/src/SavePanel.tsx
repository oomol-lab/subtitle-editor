import type { SrtEditor } from "@subtitle/editor";
import { Button, message } from "antd";

import React from "react";
import { useVal } from "use-value-enhancer";
import { derive, val } from "value-enhancer";
import { saveToFilePath } from "./fileParser";
import styles from "./SavePanel.module.scss";

export type SavePanelProps = React.HTMLAttributes<HTMLDivElement> & {
  readonly initialPath: string;
  readonly srtEditor: SrtEditor;
};

const SavePanel: React.FC<SavePanelProps> = (props) => {
  const { initialPath, srtEditor, ...restProps } = props;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const $ = React.useMemo(() => createSavePanel$(initialPath, srtEditor), []);
  const isEditedMark = useVal($.isEditedMark);
  const onSave = React.useCallback(() => $.save(), [$]);

  return (
    <div {...restProps}>
      <Button
        className={styles["left-button"]}
        disabled={!isEditedMark}
        onClick={onSave}
      >
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
        .catch((error) => {
          console.error(error);
          message.error(error.message);
        });
    },
  };
}

export default SavePanel;
