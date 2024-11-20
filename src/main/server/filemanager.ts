import * as fs from 'fs/promises';
import * as path from 'path';

class FileManager {
  private directoryPath: string;

  constructor(directoryPath: string) {
    this.directoryPath = directoryPath;
  }

  /**
   * 특정 디렉토리에 있는 모든 파일 목록을 가져옴
   * @returns 디렉토리 내 모든 파일의 경로 목록
   */
  async listFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.directoryPath);
      //const filePaths = files.map((file) => path.join(this.directoryPath, file));
      return files;
    } catch (error) {
      console.error(`Failed to list files in directory: ${this.directoryPath}`, error);
      throw error;
    }
  }

  /**
   * 파일이 존재하는지 확인
   * @param fileName - 확인할 파일 이름
   * @returns 파일 존재 여부
   */
  async fileExists(fileName: string): Promise<boolean> {
    const filePath = path.join(this.directoryPath, fileName);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 파일을 저장
   * @param fileName - 파일 이름
   * @param data - 저장할 데이터 (JSON 객체)
   */
  async saveFile(fileName: string, data: object): Promise<void> {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const filePath = path.join(this.directoryPath, fileName);
      await fs.writeFile(filePath, jsonData, 'utf8');
      console.log(`File saved: ${filePath}`);
    } catch (error) {
      console.error(`Failed to save file: ${fileName}`, error);
      throw error;
    }
  }

  /**
   * 파일을 읽기
   * @param fileName - 읽을 파일 이름
   * @returns 파일의 JSON 데이터
   */
  async readFile<T = object>(fileName: string): Promise<T> {
    try {
      const filePath = path.join(this.directoryPath, fileName);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const obj = JSON.parse(fileContent) as T;
      return obj
    } catch (error) {
      console.error(`Failed to read file: ${fileName}`, error);
      throw error;
    }
  }

  /**
   * 파일 삭제
   * @param fileName - 삭제할 파일 이름
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.directoryPath, fileName);
      await fs.unlink(filePath);
      console.log(`File deleted: ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete file: ${fileName}`, error);
      throw error;
    }
  }
}

export default FileManager;

