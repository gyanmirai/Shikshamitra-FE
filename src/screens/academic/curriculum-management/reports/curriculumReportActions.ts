import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';
import type { AcademicReportExportJobResponse } from 'src/redux/academicAPI/AcademicReportApi';

import { GlobalIcons } from 'src/utils/icons';

type CurriculumReportActionOptions = {
  downloadingJobId: string | null;
  onView: (row: AcademicReportExportJobResponse) => void;
  onDownload: (jobId: string, status: string) => void;
};

export function getCurriculumReportActions(
  row: AcademicReportExportJobResponse,
  options: CurriculumReportActionOptions
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [];
  const isThisDownloading = options.downloadingJobId === row.id;
  const canDownload = ['Completed', 'Queued', 'Processing'].includes(row.status);

  if (!row.isDynamic) {
    actions.push({
      id: 'view',
      label: 'View report',
      icon: GlobalIcons.eye,
      onClick: () => options.onView(row),
    });
  }

  actions.push({
    id: 'download',
    label: 'Download report',
    icon: isThisDownloading
      ? 'eos-icons:loading'
      : row.status === 'Failed'
        ? 'mdi:alert-circle-outline'
        : GlobalIcons.report,
    disabled: !canDownload || Boolean(options.downloadingJobId),
    tooltip:
      row.status === 'Failed'
        ? (row.errorMessage ?? 'Export failed')
        : isThisDownloading
          ? 'Downloading...'
          : 'Download',
    onClick: () => options.onDownload(row.id, row.status),
  });

  return actions;
}
