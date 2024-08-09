import styles from "./Leaf.module.css";
import React from "react";
import cls from "classnames";

import { Val } from "value-enhancer";
import { useVal } from "use-value-enhancer";
import { RenderLeafProps } from "slate-react";
import { isTsLeaf, Leaf } from "../data";

export const LeafView = (props: RenderLeafProps): React.ReactNode => {
    const { attributes, children } = props;
    const leaf = props.leaf;
    if (isTsLeaf(leaf)) {
        return (
            <MarkLeafView
                attributes={attributes}
                selected$={leaf.selected$}>
                {children}
            </MarkLeafView>
        );
    }
    return (
        <span {...attributes}>
            {children}
        </span>
    );
};

type MarkLeafViewProps = {
    readonly attributes: RenderLeafProps["attributes"];
    readonly children: RenderLeafProps["children"];
    readonly selected$: Val<boolean>;
};

const MarkLeafView = ({ attributes, children, selected$ }: MarkLeafViewProps): React.ReactNode => {
    const selected = useVal(selected$);
    return (
        <span {...attributes}
            className={cls([styles.mark, selected && styles.mark_selected])}>
            {children}
        </span>
    );
}