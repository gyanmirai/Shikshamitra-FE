'use client';

import React from 'react';
import { Box, Avatar } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IStudentChargeData } from '../ChargesManage/Component/type';

interface ICombinedProps {
  data: IStudentChargeData[];
  onViewAllCharges?: (student: IStudentChargeData) => void;
}

const StudentChargeListTable: React.FC<ICombinedProps> = ({ data, onViewAllCharges }) => (
  <CustomizableTable
    tableId="student-charge-table"
    noDataText="No student charge data found"
    columns={[
      {
        id: 'studentName',
        label: 'Student Name',
        align: 'left',
        sticky: true,
        minWidth: 150,
        render: (value, row) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 32, height: 32 }}>{row.studentName[0]}</Avatar>
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
        render: (value, row) => `${row.class}-${row.division}`,
      },
      {
        id: 'charges',
        label: 'Total Charges',
        align: 'left',
        minWidth: 120,
        render: (value, row) => row.charges.length || 0,
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
            handleViewClick={() => onViewAllCharges?.(row as IStudentChargeData)}
          />
        ),
      },
    ]}
    data={data || []}
  />
);

export default StudentChargeListTable;
