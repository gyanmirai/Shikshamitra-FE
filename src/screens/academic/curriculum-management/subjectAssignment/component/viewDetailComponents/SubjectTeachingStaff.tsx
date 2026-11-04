import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Avatar, ButtonBase, Typography } from '@mui/material';

import TeacherHoverProfile from './TeacherHoverProfile';
import { getUnifiedTeachers } from '../subjectAssignmentForm/teacherOptions';

import type { ISubjectDetail } from '../type';

export function SubjectTeachingStaff({ subject }: { subject: ISubjectDetail | null }) {
  const teachers = getUnifiedTeachers(subject ?? {});

  return (
    <FormSectionCard
      title="Teaching Staff"
      icon={GlobalIcons.assigned}
      descriptionTooltip="Teachers assigned to this subject. Focus or hover over a teacher to view available profile details."
      titleTypographyProps={{ fontWeight: 600 }}
      sx={{ minWidth: 0 }}
    >
      {teachers.length ? (
        <Stack spacing={1}>
          {teachers.map((teacher) => (
            <TeacherHoverProfile
              key={teacher.id}
              teacher={teacher}
              avatarComp={
                <ButtonBase
                  aria-label={`Profile details for ${teacher.name}`}
                  sx={{
                    p: 1.25,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: 1.25,
                    textAlign: 'left',
                    width: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                    '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'info.main' },
                  }}
                >
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'info.main' }}>
                    {teacher.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}>
                    <Typography variant="body2">{teacher.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {teacher.employeeCode || 'Teacher code unavailable'}
                    </Typography>
                  </Box>
                </ButtonBase>
              }
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No teachers assigned.
        </Typography>
      )}
    </FormSectionCard>
  );
}
