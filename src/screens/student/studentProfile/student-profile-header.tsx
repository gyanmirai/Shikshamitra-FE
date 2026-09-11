import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import { Fragment } from 'react';
import { Box, Paper, Avatar, Divider, Typography } from '@mui/material';

export function StudentProfileHeader({
  student,
  compact,
}: {
  student: StudentRecordProfile;
  compact: boolean;
}) {
  const name =
    [student.lastName, student.firstName, student.middleName].filter(Boolean).join(' ') || '-';
  const fields = [
    { label: 'Name', value: name },
    { label: 'Gr No.', value: student.grNumber || (student.grNo ?? '-') },
    { label: 'Roll No.', value: student.rollNo ?? '-' },
    { label: 'Class', value: `${student.standardName || '-'}-${student.divisionName || '-'}` },
    { label: 'Medium', value: student.academicMediumName || '-' },
  ];
  return (
    <Paper
      sx={{ mb: 1, borderTopLeftRadius: 0, borderTopRightRadius: 0, boxShadow: 'var(--shadows-4)' }}
    >
      <Paper
        sx={{
          py: compact ? 0.5 : 0.75,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeft: (theme) => `4px solid ${theme.vars.palette.success.main}`,
          borderRadius: 1,
          minWidth: 0,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Box
          display="flex"
          gap={compact ? 1.5 : 2}
          alignItems="center"
          sx={{ width: 1, minWidth: 0, flexWrap: 'wrap', transition: 'gap 0.3s ease-in-out' }}
        >
          {!compact && (
            <Avatar alt={name} sx={{ width: 40, height: 40 }}>
              {student.firstName?.[0]}
            </Avatar>
          )}
          {fields.map((field, index) => (
            <Fragment key={field.label}>
              {index > 0 && (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    my: compact ? '6px' : '8px',
                    transition: 'margin 0.3s ease-in-out',
                  }}
                />
              )}
              <Box
                sx={{
                  minWidth: 0,
                  flex: index === 0 ? '1 1 180px' : '0 1 auto',
                  maxWidth: 1,
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: compact ? '10px' : '12px',
                    transition: 'font-size 0.3s ease-in-out',
                  }}
                >
                  {field.label}
                </Typography>
                <Typography
                  fontWeight={500}
                  variant="body2"
                  sx={{
                    fontSize: compact ? '12px' : '14px',
                    overflowWrap: 'anywhere',
                    transition: 'font-size 0.3s ease-in-out',
                  }}
                >
                  {field.value}
                </Typography>
              </Box>
            </Fragment>
          ))}
        </Box>
      </Paper>
    </Paper>
  );
}
