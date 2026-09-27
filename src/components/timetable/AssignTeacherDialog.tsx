import { useDispatch } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import React, { useState, useCallback } from 'react';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  Box,
  Alert,
  Button,
  Divider,
  Checkbox,
  IconButton,
  Typography,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';
import CustomTooltip from '../custom-tooltip';
import { SubjectTeacherRow } from './SubjectTeacherRow';

import type { TeacherOption } from './teacherOptions';
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
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const [selectedNames, setSelectedNames] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictIssues, setConflictIssues] = useState<TimetableValidationIssue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rowValidity, setRowValidity] = useState<Record<string, boolean>>({});
  // Stable because each row reports readiness from an effect after its allocation query changes.
  const handleValidityChange = useCallback((subjectId: string, valid: boolean) => {
    setRowValidity((prev) => (prev[subjectId] === valid ? prev : { ...prev, [subjectId]: valid }));
  }, []);
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
      dispatch(setIsChanges(false));
    }
  }

  const handleCloseDialog = useCallback(() => {
    dispatch(setIsChanges(false));
    onClose();
  }, [dispatch, onClose]);

  const splitSubjects = open ? splitPipeSubjects(open.subjects) : [];

  const handleChange = useCallback(
    (subjectId: string, value: TeacherOption | null) => {
      dispatch(setIsChanges(true));
      setSelectedIds((prev) => ({ ...prev, [subjectId]: value?.id ?? '' }));
      setSelectedNames((prev) => ({ ...prev, [subjectId]: value?.name ?? '' }));
    },
    [dispatch]
  );

  const hasUnavailableTeacher = splitSubjects.some((sub) => rowValidity[sub.subjectId] !== true);

  const handleSave = async () => {
    if (!open || isSubmitting || hasUnavailableTeacher) return;

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

      dispatch(setIsChanges(false));
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomDialog
      open={!!open}
      handleClose={handleCloseDialog}
      maxWidth="xs"
      fullWidth
      hasForm
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Assign Teacher
          </Typography>
          <CustomTooltip
            arrow
            placement="right"
            title="Assign a primary or secondary teacher to this timetable slot. You can optionally apply the teacher selection to all slots of this subject."
          >
            <IconButton size="small" color="info" sx={{ p: 0.5 }}>
              <Iconify icon="lucide:info" width={18} />
            </IconButton>
          </CustomTooltip>
        </Box>
      }
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
                  onValidityChange={handleValidityChange}
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
          disabled={isSubmitting || hasUnavailableTeacher}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          {isSubmitting ? 'Checking...' : 'Submit'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default AssignTeacherDialog;
