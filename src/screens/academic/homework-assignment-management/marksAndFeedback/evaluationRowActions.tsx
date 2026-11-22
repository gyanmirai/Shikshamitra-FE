import type { IData } from 'src/components/customizabaleTable/types';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { GlobalIcons } from 'src/utils/icons';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { notificationRecordId } from 'src/redux/academic-notifications/delivery-adapters';

import { isRowEvaluationDisabled } from './evaluationWorkspaceUi';

type Props = {
  row: IData;
  canAdd: boolean;
  taskSubmissionType?: number | string | null;
  onView: (row: IData) => void;
  onEdit: (row: IData) => void;
  onNotify?: (row: IData) => void;
};

export default function EvaluationRowActions({
  row,
  canAdd,
  taskSubmissionType,
  onView,
  onEdit,
  onNotify,
}: Props) {
  const name = String(row.studentName || 'student');
  const disabled = isRowEvaluationDisabled(row, taskSubmissionType);
  const actions: AdaptiveThreeDotsAction[] = [
    {
      id: 'view',
      label: `View submission for ${name}`,
      icon: GlobalIcons.eye,
      onClick: () => onView(row),
    },
  ];
  if (canAdd) {
    actions.push({
      id: 'evaluate',
      label: `${Number(row.status) === 4 ? 'Edit feedback' : 'Evaluate submission'} for ${name}`,
      icon: Number(row.status) === 4 ? GlobalIcons.edit : 'solar:clipboard-check-bold',
      disabled,
      tooltip: disabled
        ? 'Evaluation is available after the student submits their work.'
        : undefined,
      onClick: () => {
        if (!disabled) onEdit(row);
      },
    });
  }
  if (onNotify && (row.status === 0 || row.status === '0') && notificationRecordId(String(row.studentId ?? ''))) {
    actions.push({
      id: 'notify',
      label: `Send reminder for ${name}`,
      icon: GlobalIcons.bell,
      onClick: () => onNotify(row),
    });
  }
  return (
    <AdaptiveThreeDotsActions
      actions={actions}
      moreLabel={`More actions for ${name}`}
      directActionLimit={2}
      collapseOnOverflow={false}
      sx={{ justifyContent: 'flex-end' }}
    />
  );
}
