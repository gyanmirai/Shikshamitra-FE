import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetExamMarksQuery } from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';
import {
  ExamGradeStatusType,
  ExamGradeStatusColor,
  ExamGradeStatusOptions,
} from 'src/enums/grade-entry-status';

import type { IExamMarkItem, IGradeEntryTableProps } from '../type';

const GradeEntryTable = ({
  selectedStudents,
  handleSelectStudent,
  actions,
  classId,
  divisionId,
  subjectId,
  examId,
  onAllAssignedChange,
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
    }));
  }, [gradingData]);

  // Notify parent whether all students have marks assigned (status === 1)
  useEffect(() => {
    if (!onAllAssignedChange) return;
    const allAssigned = tableData.length > 0 && tableData.every((item) => item.status === 1);
    onAllAssignedChange(allAssigned);
  }, [tableData, onAllAssignedChange]);

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
            value === '' ? (
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
          label: 'Feedback',
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
            return (
              <ThreeDotsActions
                actions={(prop) => actions({ ...prop, row })}
                placement="right-top"
              />
            );
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
