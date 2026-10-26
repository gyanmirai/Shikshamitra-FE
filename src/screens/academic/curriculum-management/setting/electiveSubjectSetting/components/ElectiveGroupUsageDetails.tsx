import { useState } from 'react';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Chip, Stack, Button, Typography } from '@mui/material';

import type { IElectiveSubject } from '../type';
import type { ElectiveGroupSubject } from './electiveGroupUsageTypes';

export function ElectiveGroupUsageDetails({
  group,
  subjects,
}: {
  group: IElectiveSubject | null;
  subjects: ElectiveGroupSubject[];
}) {
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const displayedSubjects = showAllSubjects ? subjects : subjects.slice(0, 6);
  const hiddenSubjectsCount = subjects.length - displayedSubjects.length;
  const details = [
    { label: 'Elective group name', value: group?.name || 'Not available' },
    { label: 'Group type', value: group?.groupType || 'Not available' },
  ];

  return (
    <>
      <FormSectionCard
        icon="mdi:shape-outline"
        title="Group Details"
        descriptionTooltip="Saved elective group identity, color and description."
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {details.map(({ label, value }) => (
            <Box key={label} sx={{ minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {label}
              </Typography>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                {value}
              </Typography>
            </Box>
          ))}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Elective group color
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {group?.color && (
                <Box
                  aria-hidden
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 0.5,
                    bgcolor: group.color,
                    border: 1,
                    borderColor: 'divider',
                  }}
                />
              )}
              <Typography variant="body2">{group?.color || 'Not available'}</Typography>
            </Stack>
          </Box>
          <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Description
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {group?.description || 'Not provided'}
            </Typography>
          </Box>
        </Box>
      </FormSectionCard>

      <FormSectionCard
        icon="mdi:book-multiple-outline"
        title="Subject Selection"
        descriptionTooltip="Subjects saved as members of this elective group."
        action={
          subjects.length > 6 && (
            <Button
              size="small"
              variant="text"
              onClick={() => setShowAllSubjects(!showAllSubjects)}
            >
              {showAllSubjects ? 'Show less' : `View all (${subjects.length})`}
            </Button>
          )
        }
      >
        {subjects.length > 0 ? (
          <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
            {displayedSubjects.map((subject, index) => (
              <Chip
                key={`${subject.name}-${index}`}
                size="small"
                label={subject.name}
                variant="outlined"
              />
            ))}
            {!showAllSubjects && hiddenSubjectsCount > 0 && (
              <Chip
                size="small"
                label={`+${hiddenSubjectsCount} more`}
                clickable
                onClick={() => setShowAllSubjects(true)}
              />
            )}
          </Stack>
        ) : (
          <EmptyContent
            title="No subjects mapped to this group"
            sx={{ py: 2, height: 'auto' }}
            slotProps={{ img: { maxWidth: 120 } }}
          />
        )}
      </FormSectionCard>
    </>
  );
}
