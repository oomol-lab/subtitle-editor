import recordSRT from "../../data/record.srt.json";
import React from "react";
import cls from "classnames";
import styles from "./Editor.module.css";

import { Slate, Editable, ReactEditor, RenderElementProps, RenderLeafProps } from "slate-react";
import { toElement } from "../data";
import { State } from "../state";
import { ElementView } from "./Element";
import { LeafView } from "./Leaf";

export type EditorProps = React.HTMLAttributes<HTMLDivElement> & {
    readonly editor: ReactEditor;
    readonly state: State;
};

const Editor = (props: EditorProps) => {
    const { editor } = props;
    const renderElement = React.useCallback(
        (props: RenderElementProps) => <ElementView {...props}/>,
        [],
    );
    const renderLeaf = React.useCallback(
        (props: RenderLeafProps) => <LeafView {...props} />,
        [],
    );
    return (
        <div {...props}
            className={cls(styles.container, props.className)}>
            <Slate
                editor={editor}
                initialValue={recordSRT.map(toElement)}>
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder="Enter some plain text..." />
            </Slate>
        </div>
    )
};

export default Editor;
