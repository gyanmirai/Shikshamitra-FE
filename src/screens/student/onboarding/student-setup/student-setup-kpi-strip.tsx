import type { StudentOnboardingAnalytics } from 'src/redux/student/onboarding/student-onboarding-types';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography } from '@mui/material';

import type { OnboardingStage, StudentOnboardingItem } from './student-onboarding-model';

type StudentSetupKpiStripProps = {
  students: StudentOnboardingItem[];
  activeStage: OnboardingStage;
  analytics?: StudentOnboardingAnalytics;
  onCardClick?: (stage: OnboardingStage) => void;
};

type StatColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

export default function StudentSetupKpiStrip({
  students,
  activeStage,
  analytics,
  onCardClick,
}: StudentSetupKpiStripProps) {
  const cards = [
    {
      label: 'Active cases',
      stage: 'all' as OnboardingStage,
      value: analytics?.activeCases ?? students.length,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'primary' as StatColor,
    },
    {
      label: 'Pending',
      stage: 'to-prepare' as OnboardingStage,
      value:
        analytics?.pending ?? students.filter((student) => student.status === 'to-prepare').length,
      icon: 'solar:document-text-bold-duotone',
      color: 'warning' as StatColor,
    },
    {
      label: 'In progress',
      stage: 'awaiting-approval' as OnboardingStage,
      value:
        analytics?.inProgress ??
        students.filter((student) => student.status === 'awaiting-approval').length,
      icon: 'solar:cloud-upload-bold-duotone',
      color: 'info' as StatColor,
    },
    {
      label: 'Ready to activate',
      stage: 'ready-to-activate' as OnboardingStage,
      value:
        analytics?.readyForActivation ??
        students.filter((student) => student.status === 'ready-to-activate').length,
      icon: 'solar:user-check-rounded-bold-duotone',
      color: 'success' as StatColor,
    },
    {
      label: 'Needs attention',
      stage: 'action-required' as OnboardingStage,
      value:
        analytics?.needsAttention ??
        students.filter((student) => student.status === 'action-required').length,
      icon: 'solar:danger-triangle-bold-duotone',
      color: 'error' as StatColor,
    },
    {
      label: 'Completed',
      stage: 'completed' as OnboardingStage,
      value:
        analytics?.completed ?? students.filter((student) => student.status === 'completed').length,
      icon: 'solar:verified-check-bold-duotone',
      color: 'success' as StatColor,
    },
    {
      label: 'Cancelled',
      stage: 'cancelled' as OnboardingStage,
      value:
        analytics?.cancelled ?? students.filter((student) => student.status === 'cancelled').length,
      icon: 'solar:close-circle-bold-duotone',
      color: 'secondary' as StatColor,
    },
  ];

  return (
    <Box
      component="section"
      aria-label="Onboarding summary"
      sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pb: 0.5, flexShrink: 0 }}
    >
      {cards.map((card) => {
        const isActive = activeStage === card.stage;

        return (
          <Card
            key={card.label}
            component={onCardClick ? 'button' : 'div'}
            type={onCardClick ? 'button' : undefined}
            onClick={onCardClick ? () => onCardClick(isActive ? 'all' : card.stage) : undefined}
            sx={{
              flex: '1 1 180px',
              minWidth: { xs: 160, md: 0 },
              p: 1.5,
              border: '1px solid',
              borderColor: isActive ? `${card.color}.main` : 'divider',
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: isActive
                ? (theme) => `0 0 0 1px ${theme.vars.palette[card.color].main}`
                : 'none',
              textAlign: 'left',
              font: 'inherit',
              cursor: onCardClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              ...(onCardClick && {
                '&:hover': {
                  borderColor: `${card.color}.main`,
                  transform: 'translateY(-1px)',
                },
              }),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.25,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => varAlpha(theme.vars.palette[card.color].mainChannel, 0.12),
                  color: (theme) => theme.vars.palette[card.color].main,
                  flexShrink: 0,
                }}
              >
                <Iconify icon={card.icon} width={20} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ lineHeight: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {card.label}
                </Typography>
              </Box>
            </Stack>
          </Card>
        );
      })}
    </Box>
  );
}
