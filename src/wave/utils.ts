export function toSeconds(milliseconds: number): number {
    return milliseconds / 1000.0;
}

export function toMilliseconds(seconds: number): number {
    return Math.round(seconds * 1000.0);
}