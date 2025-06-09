import React from 'react';

import { Box, Button } from '@mui/material';

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

const ViewTimetableComp: React.FC<ViewTimetableCompProps> = ({ examData }) => {
  const publishExamDialog = useBoolean();
  if (!examData) return null;

  return (
    <Box>
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
              minWidth: 150,
              isFilter: true,
              isSort: true,
            },
            {
              id: 'examDate',
              label: 'Date',
              align: 'left',
              minWidth: 110,
              isFilter: true,
              isSort: true,
            },
            {
              id: 'startTime',
              label: 'Start Time',
              align: 'left',
              minWidth: 110,
              isFilter: true,
              isSort: true,
            },
            {
              id: 'endTime',
              label: 'End Time',
              align: 'left',
              minWidth: 110,
              isFilter: true,
              isSort: true,
            },
            {
              id: 'totalMarks',
              label: 'Total Marks',
              align: 'center',
              minWidth: 160,
              isFilter: true,
              isSort: true,
            },
            {
              id: 'passingMarks',
              label: 'Passing Marks',
              align: 'center',
              minWidth: 150,
              isFilter: true,
              isSort: true,
            },
          ]}
          data={examData.subjects || []}
        />
      </Scrollbar>

      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button
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
          onClick={() => {
            publishExamDialog.onTrue();
            // Implement publish functionality here
          }}
          variant="contained"
        >
          Publish
        </Button>
      </Box>

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
    </Box>
  );
};

export default ViewTimetableComp;
