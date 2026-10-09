import type { InitialSetup } from 'src/redux/initial-setup/types';

import { Iconify } from 'src/components/iconify';
import { formatDateOnly } from 'src/utils/date-only';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Alert, Button, Typography } from '@mui/material';

export default function ReviewStep({
  progress,
  onEdit,
}: {
  progress: InitialSetup;
  onEdit: (step: number) => void;
}) {
  const { draft } = progress;
  const sections = [
    {
      step: 1,
      title: 'Institute profile',
      icon: 'mdi:school-outline',
      lines: [
        draft.profile.instituteName,
        `${draft.profile.email} · ${draft.profile.contactNumber}`,
        [
          draft.profile.address1,
          draft.profile.address2,
          draft.profile.address3,
          draft.profile.city,
          draft.profile.state,
          draft.profile.country,
          draft.profile.postalCode,
        ]
          .filter(Boolean)
          .join(', '),
      ],
    },
    {
      step: 2,
      title: 'Academic year',
      icon: 'mdi:calendar-outline',
      lines: [
        draft.yearName,
        `${formatDateOnly(draft.startDate, 'DD/MM/YYYY')} to ${formatDateOnly(draft.endDate, 'DD/MM/YYYY')}`,
      ],
    },
    {
      step: 3,
      title: 'Academic structure',
      icon: 'mdi:book-open-outline',
      lines: [
        [
          draft.boardType === 0 ? 'CBSE' : draft.boardType === 1 ? 'GSEB' : 'Missing board',
          draft.medium,
          draft.stage,
          draft.className,
          `Division ${draft.divisionName}`,
        ]
          .filter(Boolean)
          .join(' / '),
        `Capacity: ${draft.strength ?? 'Not set'} · Minimum age: ${draft.ageLowerLimit ?? 'Not set'}`,
      ],
    },
    {
      step: 4,
      title: 'Users and access',
      icon: 'mdi:account-group-outline',
      lines: [
        'Initial administrator account is already available.',
        ...progress.createdUsers.map((user) => `${user.userName} · ${user.email}`),
      ],
    },
  ];
  return (
    <Stack spacing={2}>
      {(progress.pendingSteps?.length ?? 0) > 0 && (
        <Alert severity="warning">
          Some steps have changed drafts. Open those steps and save their configuration before
          finishing.
        </Alert>
      )}
      {sections.map((section) => (
        <FormSectionCard
          key={section.step}
          title={section.title}
          icon={section.icon}
          action={
            <Button
              size="small"
              startIcon={<Iconify icon="mdi:pencil-outline" width={16} />}
              onClick={() => onEdit(section.step)}
              aria-label={`Edit ${section.title}`}
            >
              Edit
            </Button>
          }
        >
          <Box>
            {section.lines.map((line, index) => (
              <Typography
                key={index}
                variant="body2"
                color={index ? 'text.secondary' : 'text.primary'}
                sx={{ overflowWrap: 'anywhere', mb: 0.5 }}
              >
                {line}
              </Typography>
            ))}
          </Box>
        </FormSectionCard>
      ))}
    </Stack>
  );
}
