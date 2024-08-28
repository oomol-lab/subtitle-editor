import React from "react";
import cls from "classnames";
import styles from "./Editor.module.css";
import recordJSON from "../../../../data/record.srt.json";

import { Slate, Editable, RenderElementProps, RenderLeafProps } from "slate-react";
import { ElementView } from "./Element";
import { LeafView } from "./Leaf";
import { Descendant } from "slate";
import { InnerSrtEditor } from "../srt_editor";
import { initElement } from "../document";

export type EditorProps = React.HTMLAttributes<HTMLDivElement> & {
    readonly inner: InnerSrtEditor;
};

const Editor = (props: EditorProps) => {
    const { editor, state } = props.inner;
    // const initialValue = React.useMemo(() => [initElement(state)], [state]);
    const initialValue = React.useMemo(() => recordJSON.map(s => state.toElement(s)), [state]);

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
            ref={state.setEditorRef}
            className={cls(styles.container, props.className)}>
            <Slate
                editor={editor}
                onValueChange={onValueChange}
                initialValue={initialValue}>
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder="Enter some plain text..." />
            </Slate>
        </div>
    )
};

export default Editor;
