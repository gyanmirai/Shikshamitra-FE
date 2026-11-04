import type { ClassTeacherEligibleTeacher } from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import { Label } from 'src/components/label';
import { Box, Stack, Avatar, TextField, Typography, Autocomplete } from '@mui/material';

import type { AssignmentTableRow } from './classTeacherAssignmentModel';

export const TeacherAssignmentCell = ({
  row,
  teachers,
  onChange,
  disabled,
}: {
  row: AssignmentTableRow;
  teachers: ClassTeacherEligibleTeacher[];
  onChange: (teacher: ClassTeacherEligibleTeacher | null) => void;
  disabled: boolean;
}) => {
  const selectedTeacher =
    teachers.find((teacher) => teacher.teacherId === row.classTeacher) ??
    (row.classTeacher
      ? {
          teacherId: row.classTeacher,
          teacherName: row.classTeacherName,
          currentClassTeacherCount: row.assignedTeacher?.currentClassTeacherCount ?? 0,
          maximumClassTeacherCount: row.assignedTeacher?.maximumClassTeacherCount ?? 2,
          isEligible: row.assignedTeacher?.isActive ?? true,
          isActive: row.assignedTeacher?.isActive ?? true,
          availabilityStatus: row.assignedTeacher?.availabilityStatus ?? 'Available',
          workloadStatus: row.assignedTeacher?.workloadStatus ?? 'Normal',
          conflictStatus: row.assignedTeacher?.conflictStatus ?? 'None',
          recommendationScore: row.assignedTeacher?.recommendationScore ?? 0,
          currentWorkload: row.assignedTeacher?.currentClassTeacherCount ?? 0,
          maximumWorkload: 30,
          hasTimetableConflict: false,
          isOnLeave: false,
          employeeCode: row.assignedTeacher?.employeeCode,
          department: row.assignedTeacher?.department,
          ineligibilityReasons: [],
        }
      : null);

  return (
    <Autocomplete
      size="small"
      fullWidth
      options={teachers}
      value={selectedTeacher}
      disabled={disabled}
      onChange={(_, value) => onChange(value)}
      getOptionLabel={(option) => option.teacherName || ''}
      getOptionKey={(option) => option.teacherId}
      isOptionEqualToValue={(option, value) => option.teacherId === value.teacherId}
      getOptionDisabled={(option) => !option.isEligible && option.teacherId !== row.classTeacher}
      renderInput={(params) => (
        <TextField {...params} label={`Class teacher for ${row.className} ${row.divisionName}`} />
      )}
      renderOption={({ key, ...optionProps }, option) => (
        <Box component="li" {...optionProps} key={key} sx={{ alignItems: 'flex-start' }}>
          <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: 12 }}>
            {option.teacherName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700}>
              {option.teacherName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.employeeCode || 'No code'} · {option.department || 'No department'}
            </Typography>
            <Stack direction="row" spacing={0.75} mt={0.5} flexWrap="wrap">
              <Label variant="soft">
                {`${option.currentClassTeacherCount}/${option.maximumClassTeacherCount} classes`}
              </Label>
              <Label variant="soft">{option.workloadStatus}</Label>
              <Label variant="soft" color={option.isActive ? 'success' : 'error'}>
                {option.availabilityStatus}
              </Label>
              <Label variant="soft" color="info">{`${option.recommendationScore}% match`}</Label>
            </Stack>
            {!option.isEligible && (
              <Typography variant="caption" color="error">
                {option.ineligibilityReasons.join(' ')}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      sx={{ minWidth: 0 }}
    />
  );
};
