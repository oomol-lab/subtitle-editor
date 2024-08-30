export function getExtName(path: string): string {
  const pathCells = path.split(".");
  if (pathCells.length > 0) {
    return pathCells[pathCells.length - 1];
  } else {
    return "";
  }
}