import styles from "./Leaf.module.less";
import React from "react";
import cls from "classnames";

import { ReadonlyVal } from "value-enhancer";
import { useVal } from "use-value-enhancer";
import { RenderLeafProps } from "slate-react";
import { Segment } from "../document";

export const LeafView = (props: RenderLeafProps): React.ReactNode => {
    const { leaf, attributes, children } = props;
    const segment = Segment.get(leaf);
    if (segment) {
        return (
            <MarkLeafView
                attributes={attributes}
                selected$={segment.$.selected}>
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
    readonly selected$: ReadonlyVal<boolean>;
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