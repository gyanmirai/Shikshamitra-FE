import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { Box, Card, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
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
    <Card sx={{ p: 2, boxShadow: '3px', width: '100%' }}>
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.download} />}
          onClick={() => {
            // Implement print or download functionality here
          }}
          variant="outlined"
        >
          Print Timetable
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.publish} />}
          size="small"
          onClick={() => {
            publishExamDialog.onTrue();
            // Implement publish functionality here
          }}
          variant="contained"
        >
          Publish
        </Button>
      </Box>
      <Scrollbar>
        <CustomizableTable
          tableId="subjects-table"
          isPagination={false}
          isFilter={false}
          isSearch={false}
          isShowedDense={false}
          columns={[
            {
              id: 'subjectName',
              label: 'Subject Name',
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
      </Scrollbar>

      <ConfirmDialog
        open={publishExamDialog.value}
        onClose={() => {
          publishExamDialog.onFalse();
          // setSelectedAssignment(null);
        }}
        title="Publish"
        content="Are you sure want to Publish Exam Timetable ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {}}
          >
            Publish
          </Button>
        }
      />
    </Card>
  );
};

export default ViewTimetableComp;
