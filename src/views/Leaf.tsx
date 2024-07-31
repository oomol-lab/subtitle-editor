import styles from "./Leaf.module.css";
import React from "react";

import { RenderLeafProps } from "slate-react";
import { Leaf } from "../data";

export const LeafView = (props: RenderLeafProps): React.ReactNode => {
    const { attributes, children } = props;
    const leaf = props.leaf as Leaf;
    let className: string | undefined;
    if ("begin" in leaf) {
        className = styles.mark;
    }
    return (
        <span {...attributes}
            className={className}>
            {children}
        </span>
    );
};