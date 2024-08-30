import React from "react";
import cls from "classnames";
import styles from "./Editor.module.less";

import { Slate, Editable, RenderElementProps, RenderLeafProps } from "slate-react";
import { ElementView } from "./Element";
import { LeafView } from "./Leaf";
import { Descendant } from "slate";
import { InnerSrtEditor } from "../srt_editor";

export type EditorProps = React.HTMLAttributes<HTMLDivElement> & {
    readonly inner: InnerSrtEditor;
    readonly placeholder?: string;
};

const Editor = (props: EditorProps) => {
    const { inner, placeholder, ...restProps } = props;
    const { editor, state } = inner;
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
        <div {...restProps}
            ref={state.setEditorRef}
            className={cls(styles.container, restProps.className)}>
            <Slate
                editor={editor}
                onValueChange={onValueChange}
                initialValue={inner.getInitialElements}>
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder={placeholder} />
            </Slate>
        </div>
    )
};

export default Editor;
