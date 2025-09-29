'use client';

import React from 'react';
import { Box, Avatar } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IStudentInfo } from '../type';

interface ICombinedProps {
  data: any[];
  onViewAllConcession?: (student: IStudentInfo) => void;
}

const StudentConcessionListTable: React.FC<ICombinedProps> = ({ data, onViewAllConcession }) => (
  <CustomizableTable
    tableId="student-concession-table"
    noDataText="No student data found"
    columns={[
      {
        id: 'studentName',
        label: 'Student Name',
        align: 'left',
        sticky: true,
        minWidth: 150,
        render: (value, row) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={row.avatarUrl} sx={{ width: 32, height: 32 }} />
            {row.studentName}
          </Box>
        ),
      },
      { id: 'grNo', label: 'GR No.', align: 'left', isFilter: true, minWidth: 80 },
      {
        id: 'rollNo',
        label: 'Roll No.',
        align: 'left',
        isFilter: true,
        filterType: 'number',
        minWidth: 90,
      },
      {
        id: 'classDivision',
        label: 'Class/Division',
        align: 'left',
        minWidth: 120,
      },
      {
        id: 'parentName',
        label: 'Parent Name',
        align: 'left',
        minWidth: 150,
      },
      {
        id: 'email',
        label: 'Email',
        align: 'left',
      },
      {
        id: 'contactNo',
        label: 'Contact No.',
        align: 'left',
        minWidth: 150,
      },
      {
        id: 'actions',
        label: 'Action',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 40,
        render: (value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            placement="right-center"
            showViewIcon
            handleViewClick={() => onViewAllConcession?.(row as IStudentInfo)}
          />
        ),
      },
    ]}
    data={data || []}
  />
);

export default StudentConcessionListTable;
