import recordSRT from "../../data/record.srt.json";
import React, { useState } from "react";
import styles from "./Editor.module.css";

import { createEditor } from "slate";
import { Slate, Editable, withReact, RenderElementProps } from "slate-react";
import { toElement } from "../data";
import { ElementView } from "./Element";

const Editor = () => {
    const editor = React.useMemo(() => withReact(createEditor()), []);
    const renderElement = React.useCallback(
        (props: RenderElementProps) => <ElementView {...props}/>,
        [],
    );
    return (
        <div className={styles.container}>
            <Slate
                editor={editor}
                initialValue={recordSRT.map(toElement)}>
                <Editable
                    renderElement={renderElement}
                    placeholder="Enter some plain text..." />
            </Slate>
        </div>
    )
};

export default Editor;
