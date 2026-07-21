import { GlobalIcons } from 'src/utils/icons';
import React, { useState, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetSubjectAssignmentByIdQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  Box,
  Alert,
  Button,
  Checkbox,
  Divider,
  TextField,
  Typography,
  Autocomplete,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';

import type { TimeSlot, DayOfWeek, SlotSubject } from './types';
import type { TimetableValidationIssue } from './timetableValidationIssues';

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
  timetableStatus?: number | null;
  onClose: () => void;
  onSave: (
    day: DayOfWeek,
    slotIndex: number,
    updatedSubjects: SlotSubject[],
    bulkOptions?: {
      applyTeacherToAllSubjectSlots: Record<string, boolean>;
    }
  ) => Promise<TimetableValidationIssue[]> | TimetableValidationIssue[] | void;
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
  timetableStatus,
  onClose,
  onSave,
}) => {
  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const [selectedNames, setSelectedNames] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictIssues, setConflictIssues] = useState<TimetableValidationIssue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyTeacherToAllSubjectSlots, setApplyTeacherToAllSubjectSlots] = useState<
    Record<string, boolean>
  >({});
  // Reset selections when a new assignment is opened
  const prevRef = React.useRef<TeacherAssignment | null>(null);
  if (open !== prevRef.current) {
    prevRef.current = open;
    if (open) {
      const initialIds: Record<string, string> = {};
      const initialNames: Record<string, string> = {};
      splitPipeSubjects(open.subjects).forEach((sub) => {
        if (sub.teacherId) {
          initialIds[sub.subjectId] = sub.teacherId;
          initialNames[sub.subjectId] = sub.teacherName ?? '';
        }
      });
      setSelectedIds(initialIds);
      setSelectedNames(initialNames);
      setErrors({});
      setConflictIssues([]);
      setApplyTeacherToAllSubjectSlots({});
    }
  }

  const splitSubjects = open ? splitPipeSubjects(open.subjects) : [];

  const handleChange = useCallback((subjectId: string, value: TeacherOption | null) => {
    setSelectedIds((prev) => ({ ...prev, [subjectId]: value?.id ?? '' }));
    setSelectedNames((prev) => ({ ...prev, [subjectId]: value?.name ?? '' }));
  }, []);

  const handleSave = async () => {
    if (!open) return;

    const newErrors: Record<string, string> = {};

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
      setConflictIssues([]);
      return;
    }
    setErrors({});
    setConflictIssues([]);

    const { day, slotIndex } = open;
    const updatedSubjects: SlotSubject[] = splitSubjects.map((sub) => ({
      ...sub,
      teacherId: selectedIds[sub.subjectId] || undefined,
      teacherName: selectedNames[sub.subjectId] || undefined,
    }));

    setIsSubmitting(true);
    try {
      const issues =
        (await onSave(day, slotIndex, updatedSubjects, {
          applyTeacherToAllSubjectSlots,
        })) ?? [];

      if (issues.length > 0) {
        setConflictIssues(issues);
        return;
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
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
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {conflictIssues.length > 0 && (
            <Alert severity="error" icon={<Iconify icon="mdi:account-alert-outline" />}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Teacher is not available for this time slot
              </Typography>
              {conflictIssues.map((issue, index) => (
                <Box key={`${issue.title}-${index}`} sx={{ mt: index === 0 ? 0 : 1 }}>
                  {index > 0 && <Divider sx={{ my: 1 }} />}
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {issue.title}
                  </Typography>
                  <Typography variant="body2">{issue.description}</Typography>
                </Box>
              ))}
            </Alert>
          )}
          {splitSubjects.length > 0 ? (
            splitSubjects.map((sub) => (
              <Box
                key={sub.subjectId}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 2,
                  '&:last-child': { borderBottom: 'none', pb: 0 },
                }}
              >
                <SubjectTeacherRow
                  sub={sub}
                  selectedId={selectedIds[sub.subjectId]}
                  subjectAssignmentId={sub.subjectAssignmentId ?? ''}
                  onChange={(subjectId, value) => {
                    handleChange(subjectId, value);
                    setErrors((prev) => {
                      const e = { ...prev };
                      delete e[subjectId];
                      return e;
                    });
                  }}
                  error={errors[sub.subjectId]}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={!!applyTeacherToAllSubjectSlots[sub.subjectId]}
                      onChange={(e) => {
                        setApplyTeacherToAllSubjectSlots((prev) => ({
                          ...prev,
                          [sub.subjectId]: e.target.checked,
                        }));
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>
                      Apply teacher to all slots of this subject
                    </Typography>
                  }
                  sx={{ mt: 1.5 }}
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
          disabled={isSubmitting}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          {isSubmitting ? 'Checking...' : 'Submit'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default AssignTeacherDialog;
