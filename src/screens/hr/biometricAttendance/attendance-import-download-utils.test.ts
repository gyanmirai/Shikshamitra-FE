import type { AttendanceImportItem } from 'src/redux/hr/attendanceImportApi';

import { it, vi, expect, describe, afterEach } from 'vitest';

import {
  downloadBlob,
  downloadAttendanceImportBlob,
  buildAttendanceImportDownloadFileName,
  buildAttendanceImportErrorReportFileName,
} from './attendance-import-download-utils';

const row = {
  id: 'import-1',
  fileName: 'Attendance_June.csv',
} as AttendanceImportItem;

describe('attendance import download utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('builds row download filenames', () => {
    expect(buildAttendanceImportDownloadFileName(row)).toBe('Attendance_June.csv');
    expect(buildAttendanceImportErrorReportFileName(row)).toBe('Attendance_June-error-report.xlsx');
  });

  it('downloads a blob and cleans up the object URL', () => {
    const anchor = document.createElement('a');
    const click = vi.spyOn(anchor, 'click').mockImplementation(() => {});
    const createObjectURL = vi
      .spyOn(window.URL, 'createObjectURL')
      .mockReturnValue('blob:attendance-import');
    const revokeObjectURL = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    const blob = new Blob(['attendance']);
    downloadBlob(blob, 'attendance.csv');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:attendance-import');
  });

  it('surfaces download failures through the error callback', async () => {
    const onError = vi.fn();

    await downloadAttendanceImportBlob({
      row,
      download: vi.fn().mockRejectedValue(new Error('download failed')),
      getFileName: buildAttendanceImportDownloadFileName,
      onError,
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });
});
