import { useEffect } from 'react';
import { Box, TextField, Typography, Autocomplete } from '@mui/material';
import { useGetSubjectAssignmentByIdQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { buildTeacherOptions } from './teacherOptions';

import type { SlotSubject } from './types';
import type { TeacherOption } from './teacherOptions';

type Props = {
  sub: SlotSubject;
  selectedId: string | undefined;
  subjectAssignmentId: string;
  onChange: (subjectId: string, value: TeacherOption | null) => void;
  onValidityChange: (subjectId: string, valid: boolean) => void;
  error?: string;
};

export function SubjectTeacherRow({
  sub,
  selectedId,
  subjectAssignmentId,
  onChange,
  onValidityChange,
  error,
}: Props) {
  const hasAssignment =
    Boolean(subjectAssignmentId) && subjectAssignmentId !== '00000000-0000-0000-0000-000000000000';
  const { currentData, isFetching, isError } = useGetSubjectAssignmentByIdQuery(
    { assignmentId: subjectAssignmentId },
    { skip: !hasAssignment, refetchOnMountOrArgChange: true }
  );
  const options =
    buildTeacherOptions(currentData?.data?.subjects ?? currentData?.subjects ?? [])[
      sub.subjectId.split('_part_')[0]
    ] ?? [];
  const selected = options.find((teacher) => teacher.id === selectedId);
  const unavailable = Boolean(selectedId && !selected);
  const ready = hasAssignment && Boolean(currentData) && !isFetching && !isError;
  const valid = ready && !unavailable;
  useEffect(() => {
    onValidityChange(sub.subjectId, valid);
  }, [onValidityChange, sub.subjectId, valid]);

  const message = !hasAssignment
    ? 'Subject allocation is unavailable. Refresh the timetable and try again.'
    : isError
      ? 'Unable to load the current teachers. Reopen this dialog to retry.'
      : ready && unavailable
        ? 'This teacher is no longer allocated to this subject. Select a current teacher.'
        : error;
  const value: TeacherOption | null =
    selected ??
    (selectedId
      ? { id: selectedId, name: sub.teacherName || 'Previously assigned teacher', role: 'Primary' }
      : null);

  return (
    <Box>
      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
        For {sub.name} :
      </Typography>
      <Autocomplete
        fullWidth
        size="small"
        options={options}
        loading={isFetching}
        disabled={!ready}
        getOptionLabel={(option) => option.name}
        groupBy={(option) => option.role}
        value={value}
        isOptionEqualToValue={(option, selectedValue) => option.id === selectedValue.id}
        onChange={(_, next) => onChange(sub.subjectId, next)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={`Teacher for ${sub.name}`}
            error={Boolean(message)}
            helperText={isFetching ? 'Loading current allocated teachers…' : message}
          />
        )}
      />
    </Box>
  );
}
