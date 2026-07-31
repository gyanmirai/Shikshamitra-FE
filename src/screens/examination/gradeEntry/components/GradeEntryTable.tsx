import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Select, Checkbox, MenuItem, TextField, Typography, FormControl } from '@mui/material';
import {
  useGetExamMarksQuery,
} from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';
import {
  ExamGradeStatusType,
  ExamGradeStatusColor,
  ExamGradeStatusOptions,
  AttendanceStatusOptions,
} from 'src/enums/grade-entry-status';

import type { IExamMarkItem, IGradeEntryTableProps, IExamMarksWorkflowFlags } from '../type';

const GRADE_PLACEHOLDER = '-';

interface ExtendedGradeEntryTableProps extends IGradeEntryTableProps {
  onRowsChange?: (rows: IExamMarkItem[]) => void;
  bulkEditRequest?: {
    id: number;
    studentIds: string[];
    action: 'attendance' | 'marks' | 'remark' | 'clear';
    value?: number | string;
  } | null;
}

const GradeEntryTable = ({
  selectedStudents,
  handleSelectStudent,
  actions,
  classId,
  divisionId,
  subjectId,
  examId,
  isLocked = false,
  onAllAssignedChange,
  onStatsChange,
  onWorkflowFlagsChange,
  onRowsChange,
  bulkEditRequest,
}: ExtendedGradeEntryTableProps) => {
  const allParamsReady = !!(examId && classId && divisionId && subjectId);

  const [query, setQuery] = useState<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: 100, // Show all or larger chunk for fast inline entry
  });

  const {
    data: gradingData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamMarksQuery,
    params: {
      ExamId: examId,
      SubjectId: subjectId,
      DivisionId: divisionId,
      StandardId: classId,
      ...query,
    },
    options: {
      skip: !allParamsReady,
    },
  });

  const targetData = useMemo(() => {
    if (!gradingData) return null;
    return (gradingData as any).data && 'items' in (gradingData as any).data
      ? (gradingData as any).data
      : gradingData;
  }, [gradingData]);

  const apiRows = useMemo<IExamMarkItem[]>(() => {
    const raw: any[] = targetData?.items ?? [];
    return raw.map((item: any) => ({
      ...item,
      id: item.id ?? item.studentId ?? '',
      studentId: item.studentId ?? item.id ?? '',
      marks: item.obtainedMarks ?? item.marks ?? null,
      passingMarks: item.passingMarks ?? null,
    }));
  }, [targetData]);

  const savedRowsByStudentId = useMemo(() => {
    const rowsById = new Map<string, IExamMarkItem>();
    apiRows.forEach((row) => rowsById.set(row.studentId, row));
    return rowsById;
  }, [apiRows]);

  // Local state for inline edits
  const [localRows, setLocalRows] = useState<IExamMarkItem[]>([]);

  useEffect(() => {
    setLocalRows(apiRows);
  }, [apiRows]);

  /**
   * Memoization Justification:
   * - Keeps the saved-row comparison stable for the all-assigned effect dependency list.
   * - Prevents the effect from re-running solely because the helper function was recreated.
   * - The helper is also reused by several table render callbacks in this frequently edited grid.
   */
  const isRowModified = useCallback((row: IExamMarkItem) => {
    const savedRow = savedRowsByStudentId.get(row.studentId);
    if (!savedRow) return false;

    return (
      (row.marks ?? null) !== (savedRow.marks ?? null) ||
      (row.attendanceStatus ?? null) !== (savedRow.attendanceStatus ?? null) ||
      (row.feedback ?? '') !== (savedRow.feedback ?? '')
    );
  }, [savedRowsByStudentId]);

  useEffect(() => {
    if (onRowsChange) {
      onRowsChange(localRows);
    }
  }, [localRows, onRowsChange]);

  useEffect(() => {
    if (!bulkEditRequest) return;
    const selectedIds = new Set(bulkEditRequest.studentIds);
    setLocalRows((prev) => {
      const nextRows = prev.map((row) => {
        if (!selectedIds.has(row.studentId)) return row;
        const next = { ...row };

        if (bulkEditRequest.action === 'attendance') {
          const attendanceStatus = Number(bulkEditRequest.value ?? 0);
          next.attendanceStatus = attendanceStatus;
          next.marks = attendanceStatus === 0 ? (row.marks !== null ? row.marks : null) : null;
          next.feedback = '';
          next.grade = attendanceStatus === 0 ? next.grade : '—';
          next.status = (attendanceStatus !== 0 || next.marks !== null) ? 1 : 0;
        }

        if (bulkEditRequest.action === 'marks') {
          const rawMarks = Number(bulkEditRequest.value ?? 0);
          const marks =
            row.totalMarks != null
              ? Math.min(Math.max(0, rawMarks), row.totalMarks)
              : Math.max(0, rawMarks);
          next.attendanceStatus = 0;
          next.marks = marks;
          next.status = 1;
          const total = row.totalMarks || 100;
          const pct = (marks / total) * 100;
          next.grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : 'C';
        }

        if (bulkEditRequest.action === 'remark') {
          next.feedback = String(bulkEditRequest.value ?? '');
        }

        if (bulkEditRequest.action === 'clear') {
          next.attendanceStatus = 0;
          next.marks = null;
          next.feedback = '';
          next.grade = '—';
          next.status = 0;
        }

        return next;
      });
      return nextRows;
    });
  }, [bulkEditRequest, onRowsChange]);

  // Handle cell edit
  const handleCellEdit = (studentId: string, field: 'marks' | 'feedback' | 'attendanceStatus', value: any) => {
    setLocalRows((prev) => {
      const nextRows = prev.map((row) => {
        if (row.studentId !== studentId) return row;

        const updatedRow = { ...row, [field]: value };

        // If marks are edited, automatically calculate grade and status preview
        if (field === 'marks' || field === 'attendanceStatus') {
          if (field === 'marks' && value !== null) {
            const rawVal = Number(value);
            updatedRow.marks =
              updatedRow.totalMarks != null
                ? Math.min(Math.max(0, rawVal), updatedRow.totalMarks)
                : Math.max(0, rawVal);
            if (updatedRow.attendanceStatus == null) {
              updatedRow.attendanceStatus = 0; // Default to Present when marks are entered
            }
          }
          const isPresent = updatedRow.attendanceStatus === 0;
          if (isPresent && updatedRow.marks !== null) {
            const pct = (updatedRow.marks / updatedRow.totalMarks) * 100;
            updatedRow.grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : 'C';
            updatedRow.status = 1; // Assigned
          } else if (!isPresent) {
            updatedRow.marks = null;
            updatedRow.grade = '—';
            updatedRow.status = 1; // Attendance status saved counts as assigned
          } else {
            updatedRow.status = 0; // Pending
          }
        }

        return updatedRow;
      });
      return nextRows;
    });
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, studentId: string, colType: 'marks' | 'remarks') => {
    const studentIds = localRows.map((r) => r.studentId);
    const currentIndex = studentIds.indexOf(studentId);

    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      if (nextIndex < studentIds.length) {
        const nextId = studentIds[nextIndex];
        const selector = `input[data-student-id="${nextId}"][data-col-type="${colType}"]`;
        const el = document.querySelector(selector) as HTMLInputElement;
        el?.focus();
        el?.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        const prevId = studentIds[prevIndex];
        const selector = `input[data-student-id="${prevId}"][data-col-type="${colType}"]`;
        const el = document.querySelector(selector) as HTMLInputElement;
        el?.focus();
        el?.select();
      }
    } else if (e.key === 'ArrowRight' && colType === 'marks') {
      const el = document.querySelector(`input[data-student-id="${studentId}"][data-col-type="remarks"]`) as HTMLInputElement;
      el?.focus();
    } else if (e.key === 'ArrowLeft' && colType === 'remarks') {
      const el = document.querySelector(`input[data-student-id="${studentId}"][data-col-type="marks"]`) as HTMLInputElement;
      el?.focus();
    }
  };

  // Notify parent whether all students have marks assigned
  useEffect(() => {
    if (!onAllAssignedChange) return;
    const allAssigned =
      localRows.length > 0 &&
      localRows.every((item) => item.status === 1);
    onAllAssignedChange(allAssigned);
  }, [localRows, onAllAssignedChange]);

  // Emit workflow flags to parent
  useEffect(() => {
    if (!onWorkflowFlagsChange) return;
    if (!targetData) {
      onWorkflowFlagsChange({
        workflowStatus: 0,
        isDraft: true,
        isSubmitted: false,
        isVerified: false,
        isPublished: false,
        isMarksPublish: false,
      });
      return;
    }
    const flags: IExamMarksWorkflowFlags = {
      workflowStatus: targetData.workflowStatus ?? 0,
      isDraft: targetData.isDraft ?? true,
      isSubmitted: targetData.isSubmitted ?? false,
      isVerified: targetData.isVerified ?? false,
      isPublished: targetData.isPublished ?? false,
      isMarksPublish: targetData.isMarksPublish ?? false,
    };
    onWorkflowFlagsChange(flags);
  }, [targetData, onWorkflowFlagsChange]);

  // Compute and emit analytics stats
  useEffect(() => {
    if (!onStatsChange) return;
    const assigned = localRows.filter((item) => item.status === 1 && item.marks != null);
    const totalCount = targetData?.totalCount ?? localRows.length;
    const pendingCount = totalCount - assigned.length;

    if (assigned.length === 0) {
      onStatsChange({
        highestMarks: 0,
        lowestMarks: 0,
        averageMarks: 0,
        passCount: 0,
        failCount: 0,
        passPercentage: 0,
        failPercentage: 0,
        pendingCount,
        totalCount,
      });
      return;
    }

    const markValues = assigned.map((item) => item.marks as number);
    const highest = Math.max(...markValues);
    const lowest = Math.min(...markValues);
    const average = markValues.reduce((a, b) => a + b, 0) / markValues.length;

    const passItems = assigned.filter((item) => {
      const total = item.totalMarks || 100;
      const threshold = item.passingMarks != null ? item.passingMarks : total * 0.33;
      return (item.marks as number) >= threshold;
    });
    const passCount = passItems.length;
    const failCount = assigned.length - passCount;

    onStatsChange({
      highestMarks: highest,
      lowestMarks: lowest,
      averageMarks: Math.round(average * 100) / 100,
      passCount,
      failCount,
      passPercentage: Math.round((passCount / assigned.length) * 100),
      failPercentage: Math.round((failCount / assigned.length) * 100),
      pendingCount,
      totalCount,
    });
  }, [localRows, targetData, onStatsChange]);

  return (
    <CustomizableTable
      tableId="grade-entry-table"
      noDataText={<>Students Data Not Found For Grading</>}
      totalCount={gradingData?.totalCount}
      isLoading={isLoading || isFetching}
      columns={[
        {
          id: 'select',
          sticky: true,
          stickyPosition: 'left',
          label: (
            <Checkbox
              size="small"
              disabled={isLocked}
              checked={selectedStudents.length === localRows.length && localRows.length > 0}
              indeterminate={selectedStudents.length > 0 && selectedStudents.length < localRows.length}
              onChange={(e) => {
                if (isLocked) {
                  return;
                }
                localRows.forEach((row) => {
                  const isSelected = selectedStudents.includes(row.studentId);
                  if (e.target.checked && !isSelected) {
                    handleSelectStudent(row.studentId);
                  } else if (!e.target.checked && isSelected) {
                    handleSelectStudent(row.studentId);
                  }
                });
              }}
            />
          ),
          minWidth: 50,
          render: (value, row) => (
            <Checkbox
              size="small"
              disabled={isLocked}
              checked={selectedStudents.includes(row.studentId)}
              onChange={() => {
                if (!isLocked) {
                  handleSelectStudent(row.studentId);
                }
              }}
            />
          ),
        },
        {
          id: 'studentName',
          label: 'Student Name/Gr No.',
          sticky: true,
          stickyPosition: 'left',
          minWidth: 180,
          align: 'left',
          render: (value, row) => (
            <Box>
              <Typography variant="body2" fontWeight={600}>{value}</Typography>
              <Typography variant="caption" color="text.secondary">({row.grNo})</Typography>
            </Box>
          ),
        },
        { id: 'rollNo', label: 'Roll No.', minWidth: 90, align: 'left' },
        {
          id: 'attendanceStatus',
          label: 'Attendance',
          align: 'left',
          minWidth: 140,
          render: (value, row) => (
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select
                value={value ?? 0}
                disabled={isLocked}
                onChange={(e) => handleCellEdit(row.studentId, 'attendanceStatus', Number(e.target.value))}
                sx={{ height: 32, fontSize: '13px' }}
              >
                {AttendanceStatusOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '13px' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ),
        },
        {
          id: 'totalMarks',
          label: 'Total Marks',
          align: 'left',
          minWidth: 100,
        },
        {
          id: 'marks',
          label: 'Obtained Marks',
          align: 'left',
          minWidth: 130,
          render: (value, row) => {
            const isAbsent = row.attendanceStatus !== 0;
            return (
              <TextField
                size="small"
                type="number"
                disabled={isLocked || isAbsent}
                value={value === null ? '' : value}
                inputProps={{
                  min: 0,
                  max: row.totalMarks,
                  style: { padding: '4px 8px', fontSize: '13px' },
                  'data-student-id': row.studentId,
                  'data-col-type': 'marks',
                }}
                onChange={(e) => {
                  const rawVal = e.target.value === '' ? null : Number(e.target.value);
                  const clampedVal =
                    rawVal !== null && row.totalMarks != null
                      ? Math.min(Math.max(0, rawVal), row.totalMarks)
                      : rawVal;
                  handleCellEdit(row.studentId, 'marks', clampedVal);
                }}
                onKeyDown={(e) => handleKeyDown(e, row.studentId, 'marks')}
                error={value !== null && (value < 0 || value > row.totalMarks)}
                sx={{
                  width: '90px',
                  '& .MuiInputBase-root': {
                    height: 32,
                  },
                }}
              />
            );
          },
        },
        {
          id: 'grade',
          label: 'Grade',
          minWidth: 80,
          render: (value, row) => {
            const gradeRow = row as IExamMarkItem;
            const shouldShowSavedGrade = !isRowModified(gradeRow) && value && value !== '—';
            return shouldShowSavedGrade ? (
              <Label color={value === 'F' ? 'error' : 'success'} variant="soft">
                {value}
              </Label>
            ) : (
              <Typography variant="body2" color="text.disabled" fontWeight={600}>
                {GRADE_PLACEHOLDER}
              </Typography>
            );
          },
        },
        {
          id: 'feedback',
          label: 'Remarks / Feedback',
          minWidth: 220,
          render: (value, row) => {
            const isAbsent = row.attendanceStatus !== 0;
            return (
              <TextField
                size="small"
                disabled={isLocked || isAbsent}
                placeholder="Feedback remarks..."
                value={value || ''}
                inputProps={{
                  style: { padding: '4px 8px', fontSize: '13px' },
                  'data-student-id': row.studentId,
                  'data-col-type': 'remarks',
                }}
                onChange={(e) => handleCellEdit(row.studentId, 'feedback', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, row.studentId, 'remarks')}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-root': {
                    height: 32,
                  },
                }}
              />
            );
          },
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: 90,
          sticky: true,
          stickyPosition: 'right',
          filterType: 'enum',
          enumOptions: ExamGradeStatusOptions,
          render(value: ExamGradeStatusType, row) {
            if (isRowModified(row as IExamMarkItem)) {
              return (
                <Label color="warning" variant="soft">
                  Unsaved Changes
                </Label>
              );
            }
            const color = ExamGradeStatusColor[value as ExamGradeStatusType] as LabelColor;
            return <Label color={color}>{ExamGradeStatusType[value]}</Label>;
          },
        },
        {
          id: 'actions',
          label: 'Action',
          minWidth: 50,
          sticky: true,
          stickyPosition: 'right',
          align: 'left',
          isFilter: false,
          isSort: false,
          render(value, row) {
            return actions({ row, isLocked });
          },
        },
      ]}
      data={localRows}
      serverSidePagination
      onServerPagination={(page, rowPerPage) => {
        setQuery({
          page,
          pageSize: rowPerPage,
        });
      }}
    />
  );
};

export default GradeEntryTable;
