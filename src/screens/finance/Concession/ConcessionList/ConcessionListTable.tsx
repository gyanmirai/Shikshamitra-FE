'use client';

import React from 'react';
import { Box, Avatar } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
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
        stickyPosition: 'left',
        id: 'studentName',
        label: 'Name(Gr No.)',
        align: 'left',
        sticky: true,
        minWidth: 150,
        render: (value, row) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={row.avatarUrl} sx={{ width: 32, height: 32 }} />
            {row.studentName} ({row.grNo})
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
        stickyPosition: 'right',
        excludeFromExport: true,
        id: 'actions',
        label: 'Action',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 40,
        render: (value, row) => (
          <AdaptiveThreeDotsActions directActionLimit={2}
            actions={[
              {
                id: 'view',
                label: 'View',
                icon: 'carbon:view-filled',
                onClick: () => onViewAllConcession?.(row as IStudentInfo),
              },
            ]}
            placement="right-center"
          />
        ),
      },
    ]}
    data={data || []}
  />
);

export default StudentConcessionListTable;
