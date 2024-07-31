import React from "react";

import { RenderElementProps } from "slate-react";

export const ElementView = (props: RenderElementProps): React.ReactNode => {
    const { attributes, children } = props;
    return (
        <p {...attributes}>
            {children}
        </p>
    );
};