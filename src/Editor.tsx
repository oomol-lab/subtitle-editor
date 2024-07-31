import React from "react";
import styles from "./Editor.module.css"

import { createEditor } from "slate"
import { Slate, Editable, withReact, RenderElementProps } from "slate-react"
import { ElementView } from "./Element";

const Editor = () => {
    const editor = React.useMemo(() => withReact(createEditor()), []);
    const renderElement = React.useCallback(
        (props: RenderElementProps) => <ElementView {...props}/>,
        [],
);
    const initialValue = [
        {
            type: "paragraph",
            children: [
                { text: "This is editable plain text, just like a <textarea>!" },
            ],
        },
    ]
    return (
        <div className={styles.container}>
            <Slate
                editor={editor}
                initialValue={initialValue}>
                <Editable
                    renderElement={renderElement}
                    placeholder="Enter some plain text..." />
            </Slate>
        </div>
    )
};

export default Editor;
