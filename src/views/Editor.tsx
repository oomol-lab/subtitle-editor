import recordSRT from "../../data/record.srt.json";
import React from "react";
import cls from "classnames";
import styles from "./Editor.module.css";

import { createEditor } from "slate";
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from "slate-react";
import { toElement } from "../data";
import { ElementView } from "./Element";
import { LeafView } from "./Leaf";

const Editor = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const editor = React.useMemo(() => withReact(createEditor()), []);
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
