declare const electronAPI: {
  getContentOfFile(filePath: string): Promise<string>;
  getPathOfFile(file: File): string;
};