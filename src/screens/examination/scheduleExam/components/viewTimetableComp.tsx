import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { Box, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomizableTable from 'src/components/customizabaleTable';

import type { IExamFormValues } from '../type';

interface ViewTimetableCompProps {
  examData: IExamFormValues | null;
}

dayjs.extend(utc);

const ViewTimetableComp: React.FC<ViewTimetableCompProps> = ({ examData }) => {
  const publishExamDialog = useBoolean();
  if (!examData) return null;

  return (
    <CustomizableTable
      tableId="subjects-table"
      isPagination={false}
      isFilter={false}
      isSearch={false}
      isShowedDense={false}
      columns={[
        {
          id: 'subjectName',
          label: 'Subject',
          align: 'left',
          isFilter: true,
          isSort: true,
          render(value, row) {
            return (
              <Box key={value.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 4,
                    height: 18,
                    borderRadius: 1,
                    backgroundColor: row.subjectColor,
                  }}
                />
                <Typography variant="caption">
                  {value} ({row.subjectCode})
                </Typography>
              </Box>
            );
          },
        },
        {
          id: 'examDate',
          label: 'Date',
          align: 'left',
          isFilter: true,
          filterType: 'date',
          isSort: true,
          render: (value) => (
            <Typography variant="caption" gutterBottom>
              {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
            </Typography>
          ),
        },
        {
          id: 'startTime',
          label: 'Start Time',
          align: 'left',
          isFilter: true,
          isSort: true,
          // render: (value) => (
          //   <Typography variant="caption" gutterBottom>
          //     {value ? dayjs(value).local().format('hh:mm A') : '-'}
          //   </Typography>
          // ),
        },
        {
          id: 'endTime',
          label: 'End Time',
          align: 'left',
          isFilter: true,
          isSort: true,
          // render: (value) => (
          //   <Typography fontSize="12px" gutterBottom>
          //     {value ? dayjs(value).format('hh:mm A') : '-'}
          //   </Typography>
          // ),
        },
        {
          id: 'totalMarks',
          label: 'Total Marks',
          align: 'left',
          isFilter: true,
          isSort: true,
        },
        {
          id: 'passingMarks',
          label: 'Passing Marks',
          align: 'left',
          isFilter: true,
          isSort: true,
        },
      ]}
      data={examData.subjects || []}
    />
  );
};

export default ViewTimetableComp;
