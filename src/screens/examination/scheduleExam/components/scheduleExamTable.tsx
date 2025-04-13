import React from 'react';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IScheduledExamTableProps } from '../type';

const ScheduledExamTable: React.FC<IScheduledExamTableProps> = ({ data }) => (
  <CustomizableTable
    tableId="schedule-exam-table"
    columns={[
      { id: 'class', label: 'Class', align: 'left', minWidth: 250 },
      { id: 'subjectName', label: 'Subject Name', align: 'left', minWidth: 250 },
      { id: 'examType', label: 'Exam Type', align: 'left', minWidth: 250 },
      { id: 'examName', label: 'Exam Name', align: 'left', minWidth: 250 },
      { id: 'examDate', label: 'Exam Date', align: 'left', minWidth: 250 },
      { id: 'examTime', label: 'Exam Time', align: 'left', minWidth: 250 },
      { id: 'examDuration', label: 'Exam Duration', align: 'left', minWidth: 250 },
      { id: 'totalMarks', label: 'Total Marks', align: 'left', minWidth: 250 },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        minWidth: 250,
        render: (value) => (
          <Label color={value === 'Pending' ? 'warning' : 'success'}>{value}</Label>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              placement="right-top"
              showThreeDots={false}
              showViewIcon
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => {}}
              handleEditClick={() => {}}
              handleViewClick={() => {}}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default ScheduledExamTable;
