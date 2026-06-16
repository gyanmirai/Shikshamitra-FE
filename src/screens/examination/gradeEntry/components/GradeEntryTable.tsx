import type { LabelColor } from 'src/components/label';
import type { AttendanceStatus } from 'src/enums/grade-entry-status';

import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetExamMarksQuery } from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';
import {
  ExamGradeStatusType,
  ExamGradeStatusColor,
  AttendanceStatusColor,
  AttendanceStatusLabel,
  ExamGradeStatusOptions,
} from 'src/enums/grade-entry-status';

import type { IExamMarkItem, IGradeEntryTableProps, IExamMarksWorkflowFlags } from '../type';

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
}: IGradeEntryTableProps) => {
  const allParamsReady = !!(examId && classId && divisionId && subjectId);

  const [query, setQuery] = useState<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: 10,
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

  const tableData = useMemo<IExamMarkItem[]>(() => {
    const raw: any[] = gradingData?.items ?? [];
    return raw.map((item: any) => ({
      ...item,
      id: item.id ?? item.studentId ?? '',
      // Normalise field name: the API returns `obtainedMarks`, analytics code reads `marks`
      marks: item.obtainedMarks ?? item.marks ?? null,
      passingMarks: item.passingMarks ?? null,
    }));
  }, [gradingData]);

  // Notify parent whether all students have marks assigned (status === 1)
  useEffect(() => {
    if (!onAllAssignedChange) return;
    const allAssigned = tableData.length > 0 && tableData.every((item) => item.status === 1);
    onAllAssignedChange(allAssigned);
  }, [tableData, onAllAssignedChange]);

  // Emit workflow flags to parent whenever the API response changes
  useEffect(() => {
    if (!onWorkflowFlagsChange || !gradingData) return;
    const flags: IExamMarksWorkflowFlags = {
      workflowStatus: gradingData.workflowStatus ?? 0,
      isDraft: gradingData.isDraft ?? true,
      isSubmitted: gradingData.isSubmitted ?? false,
      isVerified: gradingData.isVerified ?? false,
      isPublished: gradingData.isPublished ?? false,
      isMarksPublish: gradingData.isMarksPublish ?? false,
    };
    onWorkflowFlagsChange(flags);
  }, [gradingData, onWorkflowFlagsChange]);

  // Compute and emit analytics stats to parent
  useEffect(() => {
    if (!onStatsChange) return;
    const assigned = tableData.filter((item) => item.status === 1 && item.marks != null);
    const totalCount = gradingData?.totalCount ?? tableData.length;
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
    // Pass = marks >= passingMarks (if available) or >= 33% of totalMarks
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
  }, [tableData, gradingData, onStatsChange]);

  return (
    <CustomizableTable
      tableId="grade-entry-table"
      noDataText={<>Students Data Not Found For Grading</>}
      totalCount={gradingData?.totalCount}
      isLoading={isLoading || isFetching}
      columns={[
        {
          id: 'studentName',
          label: 'Student Name/Gr No.',
          sticky: true,
          minWidth: 180,
          align: 'left',
          render: (value, row) => (
            <Box>
              <Typography variant="body2">{value}</Typography>
              <Typography variant="caption">({row.grNo})</Typography>
            </Box>
          ),
        },
        { id: 'rollNo', label: 'Roll No.', minWidth: 90, align: 'left' },
        {
          id: 'attendanceStatus',
          label: 'Attendance',
          align: 'left',
          minWidth: 130,
          filterType: 'enum',
          enumOptions: Object.entries(AttendanceStatusLabel).map(([value, label]) => ({
            label,
            value: Number(value),
          })),
          render: (value: AttendanceStatus) => {
            if (value == null)
              return (
                <Typography variant="caption" color="textSecondary">
                  —
                </Typography>
              );
            const color = AttendanceStatusColor[value as AttendanceStatus] as LabelColor;
            const label = AttendanceStatusLabel[value as AttendanceStatus] ?? String(value);
            return <Label color={color}>{label}</Label>;
          },
        },
        {
          id: 'totalMarks',
          label: 'Total Marks',
          align: 'left',
          minWidth: 120,
          filterType: 'number',
        },
        {
          id: 'obtainedMarks',
          label: 'Obtained Marks',
          align: 'left',
          minWidth: 150,
          filterType: 'number',
          render: (value, row) =>
            value == null ? (
              <Typography variant="subtitle2" color="textSecondary">
                -
              </Typography>
            ) : (
              <Typography variant="caption" gutterBottom>
                {value}
              </Typography>
            ),
        },
        {
          id: 'grade',
          label: 'Grade',
          render: (value, row) =>
            value === '' || value == null ? (
              <Typography variant="subtitle2" color="textSecondary">
                -
              </Typography>
            ) : (
              <Typography variant="caption" gutterBottom>
                {value}
              </Typography>
            ),
        },
        {
          id: 'feedback',
          label: 'Remarks',
          render: (value, row) => (
            <CustomTooltip title={value || '-'} arrow>
              <Typography
                variant="caption"
                fontSize="13px"
                noWrap
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  maxWidth: 0,
                  minWidth: '100%',
                }}
              >
                {value || '-'}
              </Typography>
            </CustomTooltip>
          ),
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: 90,
          sticky: true,
          filterType: 'enum',
          enumOptions: ExamGradeStatusOptions,
          render(value: ExamGradeStatusType, row: any) {
            const color = ExamGradeStatusColor[value as ExamGradeStatusType] as LabelColor;
            return <Label color={color}>{ExamGradeStatusType[value]}</Label>;
          },
        },
        {
          id: 'actions',
          label: 'Action',
          minWidth: 40,
          sticky: true,
          align: 'left',
          isFilter: false,
          isSort: false,
          render(value, row) {
            return actions({ row, isLocked });
          },
        },
      ]}
      data={tableData}
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
