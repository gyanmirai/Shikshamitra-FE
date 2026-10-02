import type { ExaminationSeatingIssueDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CustomAccordion from 'src/components/custom-accordian';

export function PublicationWarnings({ warnings }: { warnings: ExaminationSeatingIssueDto[] }) {
  const [expanded, setExpanded] = useState(false);
  if (warnings.length === 0) return null;

  return (
    <CustomAccordion
      title={`Review ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`}
      expanded={expanded}
      onChange={() => setExpanded((current) => !current)}
      content={
        <Stack
          component="ul"
          spacing={1}
          divider={<Divider />}
          sx={{ m: 0, p: 0, listStyle: 'none' }}
        >
          {warnings.map((warning, index) => (
            <Typography
              component="li"
              variant="body2"
              color="text.primary"
              key={`${warning.code}-${warning.seatingPlanId ?? ''}-${index}`}
            >
              {warning.message}
            </Typography>
          ))}
        </Stack>
      }
    />
  );
}
