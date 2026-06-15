import { GlobalIcons } from 'src/utils/icons';
import React, { useState, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useAssignTeachersMutation } from 'src/redux/academicAPI/timetableApi/timetableManagementApi';
import { useGetSubjectAssignmentByIdQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  Box,
  Button,
  TextField,
  Typography,
  Autocomplete,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';

import type { TimeSlot, DayOfWeek, SlotSubject } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TeacherAssignment {
  day: DayOfWeek;
  slotIndex: number;
  subjects: SlotSubject[];
}

interface AssignTeacherDialogProps {
  open: TeacherAssignment | null;
  slots: Record<DayOfWeek, TimeSlot[]>;
  standardId: string;
  divisionId: string;
  onClose: () => void;
  onSave: (day: DayOfWeek, slotIndex: number, updatedSubjects: SlotSubject[]) => void;
}

// ---------------------------------------------------------------------------
// Teacher option type
// ---------------------------------------------------------------------------

export interface TeacherOption {
  id: string;
  name: string;
  role: 'Primary' | 'Secondary';
}

// ---------------------------------------------------------------------------
// Helper: build merged teacher options from a subject assignment API response subject
// ---------------------------------------------------------------------------

export function buildTeacherOptions(
  subjects: Array<{
    subjectId: string;
    primaryTeacher?: { id: string; name: string } | null;
    secondaryTeachers?: Array<{ id: string; name: string }>;
  }>
): Record<string, TeacherOption[]> {
  const result: Record<string, TeacherOption[]> = {};

  subjects.forEach((sub) => {
    const options: TeacherOption[] = [];

    if (sub.primaryTeacher) {
      options.push({ ...sub.primaryTeacher, role: 'Primary' });
    }

    (sub.secondaryTeachers ?? []).forEach((t) => {
      options.push({ ...t, role: 'Secondary' });
    });

    result[sub.subjectId] = options;
  });

  return result;
}

// ---------------------------------------------------------------------------
// Helper: lazily split pipe-separated subject names into individual rows
// ---------------------------------------------------------------------------
function splitPipeSubjects(subjects: SlotSubject[]): SlotSubject[] {
  const result: SlotSubject[] = [];
  subjects.forEach((sub) => {
    if (sub.name.includes('|')) {
      sub.name.split('|').forEach((partName, idx) => {
        const isAlreadySplit = sub.subjectId.includes('_part_');
        result.push({
          ...sub,
          subjectId: isAlreadySplit ? sub.subjectId : `${sub.subjectId}_part_${idx}`,
          name: partName.trim(),
          teacherId: idx === 0 ? sub.teacherId : undefined,
          teacherName: idx === 0 ? sub.teacherName : undefined,
          roomId: idx === 0 ? sub.roomId : undefined,
          roomName: idx === 0 ? sub.roomName : undefined,
        });
      });
    } else {
      result.push(sub);
    }
  });
  return result;
}

// ---------------------------------------------------------------------------
// Sub-component: renders teacher dropdown for a single split subject row
// ---------------------------------------------------------------------------

interface SubjectTeacherRowProps {
  sub: SlotSubject;
  selectedId: string | undefined;
  subjectAssignmentId: string;
  onChange: (subjectId: string, value: TeacherOption | null) => void;
  error?: string;
}

const SubjectTeacherRow: React.FC<SubjectTeacherRowProps> = ({
  sub,
  selectedId,
  subjectAssignmentId,
  onChange,
  error,
}) => {
  const {
    data: subjectAssignmentData,
    isLoading: subjectAssignmentLoading,
    isFetching: subjectAssignmentFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentByIdQuery,
    params: { assignmentId: subjectAssignmentId },
    options: { skip: !subjectAssignmentId },
  });

  const teacherOptionsBySubject: Record<string, TeacherOption[]> = React.useMemo(() => {
    if (!subjectAssignmentData?.data?.subjects) return {};
    return buildTeacherOptions(subjectAssignmentData.data.subjects);
  }, [subjectAssignmentData]);

  // Derive the base subjectId (strip _part_ suffix if present)
  const baseSubjectId = sub.subjectId.includes('_part_')
    ? sub.subjectId.split('_part_')[0]
    : sub.subjectId;

  const options: TeacherOption[] = teacherOptionsBySubject[baseSubjectId] ?? [];
  const selectedValue = options.find((t) => t.id === selectedId) ?? null;

  return (
    <Box key={sub.subjectId}>
      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
        For {sub.name} :
      </Typography>
      <Autocomplete
        fullWidth
        size="small"
        options={options}
        loading={subjectAssignmentLoading || subjectAssignmentFetching}
        getOptionLabel={(option) => option.name}
        groupBy={(option) => option.role}
        value={selectedValue}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_, value) => onChange(sub.subjectId, value)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Teacher"
            error={!!error}
            helperText={error}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {subjectAssignmentLoading || subjectAssignmentFetching ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DAY_NAME_MAP: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
};

const AssignTeacherDialog: React.FC<AssignTeacherDialogProps> = ({
  open,
  slots,
  standardId,
  divisionId,
  onClose,
  onSave,
}) => {
  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [assignTeachers, { isLoading: isAssigningTeachers }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignTeachersMutation,
  });

  // Reset selections when a new assignment is opened
  const prevRef = React.useRef<TeacherAssignment | null>(null);
  if (open !== prevRef.current) {
    prevRef.current = open;
    if (open) {
      const initial: Record<string, string> = {};
      splitPipeSubjects(open.subjects).forEach((sub) => {
        if (sub.teacherId) initial[sub.subjectId] = sub.teacherId;
      });
      setSelectedIds(initial);
    }
  }

  const splitSubjects = open ? splitPipeSubjects(open.subjects) : [];

  const handleChange = useCallback((subjectId: string, value: TeacherOption | null) => {
    setSelectedIds((prev) => ({ ...prev, [subjectId]: value?.id ?? '' }));
  }, []);

  const handleSave = async () => {
    if (!open) return;

    // Validate: each subject must have a teacher selected
    const newErrors: Record<string, string> = {};
    splitSubjects.forEach((sub) => {
      if (!selectedIds[sub.subjectId]) {
        newErrors[sub.subjectId] = 'Teacher is required';
      }
    });

    // Validate: prevent same teacher assigned to multiple subjects at same time
    // (teacher cannot be in two different rooms simultaneously)
    const teacherAssignments: Record<string, string[]> = {};
    splitSubjects.forEach((sub) => {
      const teacherId = selectedIds[sub.subjectId];
      if (teacherId) {
        if (!teacherAssignments[teacherId]) {
          teacherAssignments[teacherId] = [];
        }
        teacherAssignments[teacherId].push(sub.subjectId);
      }
    });

    // Find duplicate teacher assignments
    Object.entries(teacherAssignments).forEach(([teacherId, subjectIds]) => {
      if (subjectIds.length > 1) {
        // Same teacher assigned to multiple subjects - mark all as errors
        subjectIds.forEach((subjectId) => {
          newErrors[subjectId] =
            'Same teacher cannot be assigned to multiple subjects at the same time';
        });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const { day, slotIndex } = open;
    const updatedSubjects: SlotSubject[] = splitSubjects.map((sub) => ({
      ...sub,
      teacherId: selectedIds[sub.subjectId] || undefined,
      teacherName: undefined,
    }));

    if (standardId && divisionId) {
      const currentSlot = slots[day]?.[slotIndex];
      if (currentSlot) {
        const subjectsPayload = splitSubjects
          .map((sub) => {
            const selectedTeacherId = selectedIds[sub.subjectId];
            const rawSubjectId = sub.subjectId.includes('_part_')
              ? sub.subjectId.split('_part_')[0]
              : sub.subjectId;
            return selectedTeacherId
              ? { subjectId: rawSubjectId, teacherId: selectedTeacherId }
              : null;
          })
          .filter(Boolean) as { subjectId: string; teacherId: string }[];

        if (subjectsPayload.length > 0) {
          try {
            await assignTeachers({
              standardId,
              divisionId,
              day: DAY_NAME_MAP[day],
              startTime: currentSlot.startTime,
              endTime: currentSlot.endTime,
              subjectType: currentSlot.subjectType ?? 0,
              electiveGroupId: currentSlot.electiveGroupId ?? null,
              subjects: subjectsPayload,
            }).unwrap();
          } catch {
            // API errors handled globally
          }
        }
      }
    }

    onSave(day, slotIndex, updatedSubjects);
    onClose();
  };

  return (
    <CustomDialog
      open={!!open}
      handleClose={onClose}
      maxWidth="xs"
      fullWidth
      title="Assign Teacher"
    >
      <DialogContent sx={{ pb: 2 }}>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {splitSubjects.length > 0 ? (
            splitSubjects.map((sub) => (
              <Box key={sub.subjectId}>
                <SubjectTeacherRow
                  sub={sub}
                  selectedId={selectedIds[sub.subjectId]}
                  subjectAssignmentId={sub.subjectAssignmentId ?? ''}
                  onChange={(subjectId, value) => {
                    handleChange(subjectId, value);
                    if (value)
                      setErrors((prev) => {
                        const e = { ...prev };
                        delete e[subjectId];
                        return e;
                      });
                  }}
                  error={errors[sub.subjectId]}
                />
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No subjects found in this slot.
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          disabled={isAssigningTeachers}
          loading={isAssigningTeachers}
        >
          Submit
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default AssignTeacherDialog;
