import type { RecordsReportJob } from 'src/redux/student/records/student-record-reports-api';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions/types';

import { GlobalIcons } from 'src/utils/icons';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { studentReportTitle } from '../utils/compliance-report-model';

import type { useStudentReportHistory } from '../hooks/use-student-report-history';

export default function StudentReportHistoryActions({
  job,
  history,
}: {
  job: RecordsReportJob;
  history: ReturnType<typeof useStudentReportHistory>;
}) {
  const allowed = history.actions(job);
  const title = studentReportTitle(job.reportType);
  const actions: AdaptiveThreeDotsAction[] = [
    {
      id: 'scope',
      icon: GlobalIcons.eye,
      label: `View request scope for ${title}`,
      onClick: () => history.setScopeJob(job),
    },
  ];
  if (allowed.download)
    actions.push({
      id: 'download',
      icon: GlobalIcons.download,
      label: `Download ${title}`,
      disabled: history.busy,
      onClick: () => history.downloadFile(job),
    });
  if (allowed.regenerate)
    actions.push({
      id: 'generate',
      icon: GlobalIcons.generateReport,
      label: `Generate ${title} again`,
      disabled: history.busy,
      onClick: () => history.setDecision({ kind: 'generate', job, clientKey: crypto.randomUUID() }),
    });
  if (allowed.cancel)
    actions.push({
      id: 'cancel',
      icon: GlobalIcons.cancel,
      label: `Cancel generation of ${title}`,
      disabled: history.busy,
      onClick: () => history.setDecision({ kind: 'cancel', job, clientKey: '' }),
    });
  return (
    <AdaptiveThreeDotsActions
      actions={actions}
      directActionLimit={2}
      collapseOnOverflow={false}
      moreLabel={`More actions for ${title}`}
    />
  );
}
