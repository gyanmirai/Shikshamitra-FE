import React from 'react';

import { Box, Chip, Stack, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IExamFormValues } from '../type';

interface ViewTimetableCompProps {
  examData: IExamFormValues | null;
}

const ViewTimetableComp: React.FC<ViewTimetableCompProps> = ({ examData }) => {
  if (!examData) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600}>
          Exam Type : {examData.examType}
        </Typography>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Box display="flex">
            <Typography variant="body2" mb={0.5}>
              Classes :{' '}
              <Chip label={examData.className} size="small" color="primary" variant="outlined" />
            </Typography>
          </Box>

          {examData.divisions && (
            <Box display="flex">
              <Typography variant="body2" mb={0.5}>
                {' '}
                Divisions :{' '}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {Array.isArray(examData.divisions) ? (
                  examData.divisions.map((division, index) => (
                    <Chip
                      key={index}
                      label={division}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Chip
                    label={examData.divisions}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </Stack>

      <Scrollbar sx={{ p: 2 }}>
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
              render: (value) => new Date(value).toLocaleDateString(),
            },
            {
              id: 'examTime',
              label: 'Time',
              align: 'left',
              minWidth: 110,
              isFilter: true,
              isSort: true,
              render: (value) =>
                new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            {
              id: 'examDuration',
              label: 'Duration',
              align: 'left',
              minWidth: 90,
              isFilter: false,
              isSort: true,
              render: (value) => {
                const date = new Date(value);
                return `${date.getUTCHours().toString().padStart(2, '0')}:${date
                  .getUTCMinutes()
                  .toString()
                  .padStart(2, '0')}`;
              },
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
            {
              id: 'invigilationTeacher',
              label: 'Invigilator',
              align: 'left',
              minWidth: 150,
              isFilter: true,
              isSort: true,
            },
            {
              id: 'teacher',
              label: 'Subject Teacher',
              align: 'left',
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
          startIcon={<Iconify icon="mdi:download" />}
          onClick={() => {
            // Implement print or download functionality here
          }}
          variant="outlined"
        >
          Print Timetable
        </Button>
        <Button
          startIcon={<Iconify icon="mdi:publish" />}
          onClick={() => {
            // Implement publish functionality here
          }}
          variant="contained"
        >
          Publish
        </Button>
      </Box>
    </Box>
  );
};

export default ViewTimetableComp;
