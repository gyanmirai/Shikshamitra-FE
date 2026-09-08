import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Typography, ListItemText } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { SubjectType } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';

import type { ISubject } from '../type';

interface SubjectNameCellProps {
  value: unknown;
  row: ISubject;
}

export function SubjectNameCell({ value, row }: SubjectNameCellProps) {
  const subjects = row.subjects || row.electiveGroupSubjects || [];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SubjectColorIndicator color={row.subjectColor || row.electiveGroupColor} />
            <Typography variant="caption" fontSize="13px" fontWeight={600}>
              {value as string}
            </Typography>
            {subjects.length > 0 && (
              <CustomTooltip
                title={
                  <Box display="flex" flexDirection="column" gap={1} p={1}>
                    {subjects.map((subject) => (
                      <Typography key={subject.subjectId} variant="caption">
                        {subject.subjectName || subject.name}{' '}
                        {subject.subjectCode && `(${subject.subjectCode})`}
                      </Typography>
                    ))}
                  </Box>
                }
              >
                <Typography
                  variant="caption"
                  fontSize="13px"
                  sx={{ cursor: 'pointer' }}
                  color="primary"
                >
                  ({subjects.length})
                </Typography>
              </CustomTooltip>
            )}
          </Box>
        }
        secondary={
          <Typography variant="caption" fontSize="11px" color="text.disabled">
            {SubjectType[row.subjectType ?? 0]}
          </Typography>
        }
        disableTypography={false}
        sx={{ my: 0 }}
      />
    </Box>
  );
}
