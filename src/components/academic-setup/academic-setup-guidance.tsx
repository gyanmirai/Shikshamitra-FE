import { Iconify } from 'src/components/iconify';
import { Box, Paper, Typography } from '@mui/material';

import { NODE_TYPE_META, type AcademicSetupNodeType } from './academic-setup-model';

const LEVEL_EXPLANATIONS: Record<AcademicSetupNodeType, string> = {
  'Academic Year': 'Boards connect this year to the curriculum authority followed by the school.',
  'Education Board': 'Mediums define the language used to teach the board curriculum.',
  Medium: 'Stages group standards into meaningful school sections such as Primary or Secondary.',
  Organization: 'Standards define the grade levels available inside this stage.',
  Standard: 'Divisions split a standard into manageable class sections such as A, B, or C.',
  Division:
    'This is the final teaching group used for students, attendance, timetables, and exams.',
};

export const AcademicSetupGuidance = ({ type }: { type: AcademicSetupNodeType }) => {
  const meta = NODE_TYPE_META[type];
  const isFinalLevel = type === 'Division';

  return (
    <Paper
      component="aside"
      aria-label="Hierarchy guidance"
      variant="outlined"
      sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', height: 'fit-content' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Iconify
          icon="solar:question-circle-bold-duotone"
          width={22}
          color="info.main"
          aria-hidden
        />
        <Typography variant="subtitle2">How this level works</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {LEVEL_EXPLANATIONS[type]}
      </Typography>

      <Box sx={{ my: 2, borderTop: '1px dashed', borderColor: 'divider' }} />

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {isFinalLevel ? 'Hierarchy outcome' : 'Your next action'}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {isFinalLevel
          ? 'Assign students and operational records to this division.'
          : `${meta.addLabel} to continue building the structure.`}
      </Typography>

      <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Example hierarchy
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          CBSE → English → Primary → Standard 1 → A
        </Typography>
      </Box>
    </Paper>
  );
};
