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

    export export type RegionsEvents = {
        /** When a region is created */
        "region-created": [region: Region]
        /** When a region is being updated */
        "region-update": [region: Region, side?: "start" | "end"]
        /** When a region is done updating */
        "region-updated": [region: Region]
        /** When a region is removed */
        "region-removed": [region: Region]
        /** When a region is clicked */
        "region-clicked": [region: Region, e: MouseEvent]
        /** When a region is double-clicked */
        "region-double-clicked": [region: Region, e: MouseEvent]
        /** When playback enters a region */
        "region-in": [region: Region]
        /** When playback leaves a region */
        "region-out": [region: Region]
    }

    interface Region {
        readonly start: number;
        readonly end: number;
        setOptions(options: Omit<RegionParams, "minLength" | "maxLength">);
        remove();
    }

    interface Regions {
        addRegion(region: RegionParams): Region;
        on<E, P extends RegionsEvents[E]>(event: E, listener: (...args: P) => void): void;
    }
    export function create(): Regions;
}