import type { AssessmentRubricCriterionDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Stack, Typography, IconButton } from '@mui/material';

export function RubricCriterionHelp({ criterion, compact }: { criterion: AssessmentRubricCriterionDto; compact: boolean }) {
  return <>{compact && (criterion.description || criterion.teacherGuidance) ? (
    <CustomTooltip title={
      <Stack spacing={0.5} sx={{ p: 1.5, maxWidth: 320 }}>
        {criterion.description ? <Typography variant="body2">{criterion.description}</Typography> : null}
        {criterion.teacherGuidance ? <Typography variant="body2">Teacher guidance: {criterion.teacherGuidance}</Typography> : null}
      </Stack>
    } placement="right" arrow>
      <IconButton size="small" aria-label={`About ${criterion.title}`}>
        <Iconify icon="lucide:info" width={18} color="info.main" />
      </IconButton>
    </CustomTooltip>
  ) : null}</>;
}
