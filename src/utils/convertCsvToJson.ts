// utils/csvToJson.ts
import * as XLSX from 'xlsx';

/**
 * Converts a CSV file to JSON.
 * @param file - A File object (CSV format).
 * @returns A promise that resolves to an array of objects (JSON).
 */
export const convertCsvToJson = (file: File): Promise<Record<string, any>[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const binaryStr = event.target?.result as string;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { raw: false });
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };

    reader.readAsBinaryString(file);
  });
