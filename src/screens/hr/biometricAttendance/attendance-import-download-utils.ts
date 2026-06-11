import type { AttendanceImportItem } from 'src/redux/hr/attendanceImportApi';

export const buildAttendanceImportDownloadFileName = (
  row: Pick<AttendanceImportItem, 'fileName'>
) => row.fileName?.trim() || 'attendance-import.xlsx';

export const buildAttendanceImportErrorReportFileName = (
  row: Pick<AttendanceImportItem, 'fileName'>
) => {
  const fileName = row.fileName?.trim() || 'attendance-import.xlsx';
  const extensionIndex = fileName.lastIndexOf('.');
  const baseName = extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;

  return `${baseName}-error-report.xlsx`;
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadAttendanceImportBlob = async ({
  row,
  download,
  getFileName,
  onError,
}: {
  row: AttendanceImportItem;
  download: (row: AttendanceImportItem) => Promise<Blob>;
  getFileName: (row: AttendanceImportItem) => string;
  onError: () => void;
}) => {
  try {
    const blob = await download(row);
    downloadBlob(blob, getFileName(row));
  } catch {
    onError();
  }
};
