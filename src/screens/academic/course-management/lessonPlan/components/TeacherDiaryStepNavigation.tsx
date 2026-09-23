import { Iconify } from 'src/components/iconify';
import { Box, Stack, ButtonBase, Typography } from '@mui/material';

export type TeacherDiaryStep = 'Teaching' | 'Reflection' | 'Evidence';

const STEPS: Array<{
  key: TeacherDiaryStep;
  description: string;
}> = [
  { key: 'Teaching', description: 'Coverage & method' },
  { key: 'Reflection', description: 'Notes & feedback' },
  { key: 'Evidence', description: 'Photos & files' },
];

type Props = {
  activeStep: TeacherDiaryStep;
  completedSteps: Record<TeacherDiaryStep, boolean>;
  onChange: (step: TeacherDiaryStep) => void;
};

export function TeacherDiaryStepNavigation({ activeStep, completedSteps, onChange }: Props) {
  return (
    <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} role="tablist" aria-label="Teacher diary steps">
        {STEPS.map(({ key, description }, index) => {
          const isActive = activeStep === key;
          const isCompleted = completedSteps[key];

          return (
            <ButtonBase
              key={key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(key)}
              sx={{
                flex: 1,
                justifyContent: 'flex-start',
                gap: 1.25,
                minWidth: 0,
                p: 1.25,
                border: '1px solid',
                borderColor: isActive ? 'text.primary' : 'divider',
                borderRadius: 1.5,
                bgcolor: isActive ? 'action.selected' : 'background.paper',
                textAlign: 'left',
                transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
                '&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' },
              }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: '1px solid',
                  borderColor: isActive || isCompleted ? 'text.primary' : 'divider',
                  bgcolor: isActive ? 'text.primary' : 'transparent',
                  color: isActive ? 'background.paper' : 'text.secondary',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {isCompleted ? <Iconify icon="mdi:check" width={15} /> : index + 1}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: isActive ? 700 : 600 }}>
                  {key}
                </Typography>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
                >
                  {description}
                </Typography>
              </Box>
            </ButtonBase>
          );
        })}
      </Stack>
    </Box>
  );
}
