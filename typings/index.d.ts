declare module "wavesurfer.js/dist/plugins/minimap.esm.js" {
    const content: any;
    export = content;
}

declare module "wavesurfer.js/dist/plugins/regions.esm.js" {
    export type RegionParams = {
        /** The id of the region, any string */
        id?: string
        /** The start position of the region (in seconds) */
        start: number
        /** The end position of the region (in seconds) */
        end?: number
        /** Allow/dissallow dragging the region */
        drag?: boolean
        /** Allow/dissallow resizing the region */
        resize?: boolean
        /** The color of the region (CSS color) */
        color?: string
        /** Content string or HTML element */
        content?: string | HTMLElement
        /** Min length when resizing (in seconds) */
        minLength?: number
        /** Max length when resizing (in seconds) */
        maxLength?: number
        /** The index of the channel */
        channelIdx?: number
        /** Allow/Disallow contenteditable property for content */
        contentEditable?: boolean
    }

    interface Region {
        readonly start: number;
        readonly end: number;
        setOptions(options: Omit<RegionParams, "minLength" | "maxLength">);
        remove();
    }

    interface Regions {
        addRegion(region: RegionParams): Region;
    }
    export function create(): Regions;
}