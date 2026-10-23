import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { getRubricConfigTableActions } from './rubricConfigTableActions';

import type { RubricConfigTableProps } from './types';

export const getRubricActionColumn = ({
  canAdd,
  canDelete,
  onPreview,
  onEdit,
  onDuplicate,
  onPublish,
  onUsage,
  onArchive,
}: RubricConfigTableProps): IColumn => ({
  id: 'action',
  label: 'Actions',
  minWidth: 82,
  width: 82,
  sticky: true,
  isSort: false,
  isFilter: false,
  excludeFromExport: true,
  render: (_value, row) => {
    const rubric = row as AssessmentRubricDto;
    const actions = getRubricConfigTableActions(rubric, {
      canAdd,
      canDelete,
      onPreview,
      onEdit,
      onDuplicate,
      onPublish,
      onUsage,
      onArchive,
    });

    return (
      <AdaptiveThreeDotsActions
        directActionLimit={2}
        actions={actions}
        placement="right-top"
        moreLabel={`More actions for ${rubric.title}`}
      />
    );
  },
});
