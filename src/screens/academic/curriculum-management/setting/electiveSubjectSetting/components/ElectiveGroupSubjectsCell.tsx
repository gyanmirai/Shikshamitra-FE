import { Box, Chip, Stack } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';

import type { IElectiveSubject } from '../type';

export default function ElectiveGroupSubjectsCell({
  subjects,
}: {
  subjects: IElectiveSubject['subjects'];
}) {
  const visibleSubjects = subjects.slice(0, 3);
  const hiddenCount = subjects.length - visibleSubjects.length;

  return (
    <CustomTooltip arrow placement="top" title={subjects.map((subject) => subject.name).join(', ')}>
      <Stack
        direction="row"
        spacing={0.75}
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        tabIndex={subjects.length ? 0 : undefined}
        sx={{ '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' } }}
      >
        {visibleSubjects.map((subject) => (
          <Chip
            key={subject.id || subject.name}
            size="small"
            label={
              <Box
                component="span"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
              >
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{
                    width: 3,
                    height: 14,
                    flexShrink: 0,
                    borderRadius: 0.5,
                    bgcolor: subject.color || subject.subjectColor || 'primary.main',
                  }}
                />
                {subject.name}
              </Box>
            }
            variant="outlined"
            sx={{ height: 24, fontSize: '11.5px', fontWeight: 500 }}
          />
        ))}
        {hiddenCount > 0 && (
          <Chip
            size="small"
            label={`+${hiddenCount} more`}
            sx={{ height: 24, fontSize: '11.5px', fontWeight: 600 }}
          />
        )}
      </Stack>
    </CustomTooltip>
  );
}
