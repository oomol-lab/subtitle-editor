declare const electronAPI: {
  getContentOfFile(filePath: string): Promise<string>;
  setFileContent(filePath: string, fileContent: string): Promise<void>;
  getPathOfFile(file: File): string;
};