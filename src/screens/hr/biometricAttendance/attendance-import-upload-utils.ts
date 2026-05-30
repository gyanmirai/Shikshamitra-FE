import type { AttendanceImportItem } from 'src/redux/hr/attendanceImportApi';

const SUPPORTED_ATTENDANCE_IMPORT_EXTENSIONS = new Set(['csv', 'xls', 'xlsx']);
const SUPPORTED_ATTENDANCE_IMPORT_MIME_TYPES = new Set([
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export const normalizeAttendanceImportFileName = (fileName?: string | null) =>
  (fileName || '').trim().toLowerCase();

export const getAttendanceImportFileExtension = (fileName?: string | null) => {
  const normalized = normalizeAttendanceImportFileName(fileName);
  const extension = normalized.split('.').pop();
  return extension && extension !== normalized ? extension : '';
};

export const isSupportedAttendanceImportFile = (file: Pick<File, 'name' | 'type'>) => {
  const extension = getAttendanceImportFileExtension(file.name);
  const mimeType = (file.type || '').trim().toLowerCase();

  return (
    SUPPORTED_ATTENDANCE_IMPORT_EXTENSIONS.has(extension) &&
    (mimeType === '' || SUPPORTED_ATTENDANCE_IMPORT_MIME_TYPES.has(mimeType))
  );
};

export const hasDuplicateAttendanceImportFileName = (
  fileName: string,
  imports: Pick<AttendanceImportItem, 'fileName'>[]
) => {
  const normalizedFileName = normalizeAttendanceImportFileName(fileName);

  return imports.some(
    (item) => normalizeAttendanceImportFileName(item.fileName) === normalizedFileName
  );
};
