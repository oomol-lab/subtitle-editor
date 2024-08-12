import recordSRT from "../../data/record.srt.json";
import React from "react";
import cls from "classnames";
import styles from "./Editor.module.css";

import { Slate, Editable, ReactEditor, RenderElementProps, RenderLeafProps } from "slate-react";
import { ElementView } from "./Element";
import { LeafView } from "./Leaf";
import { Descendant } from "slate";
import { DocumentState } from "../document";

export type EditorProps = React.HTMLAttributes<HTMLDivElement> & {
    readonly editor: ReactEditor;
    readonly state: DocumentState;
};

const Editor = (props: EditorProps) => {
    const { editor, state } = props;
    const renderElement = React.useCallback(
        (props: RenderElementProps) => <ElementView {...props}/>,
        [],
    );
    const renderLeaf = React.useCallback(
        (props: RenderLeafProps) => <LeafView {...props} />,
        [],
    );
    const onValueChange = React.useCallback(
        (value: Descendant[]) => state.fireEditorValueUpdating(value),
        [state],
    );
    return (
        <div {...props}
            className={cls(styles.container, props.className)}>
            <Slate
                editor={editor}
                onValueChange={onValueChange}
                initialValue={recordSRT.map(s => state.toElement(s))}>
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder="Enter some plain text..." />
            </Slate>
        </div>
    )
};

export default Editor;
