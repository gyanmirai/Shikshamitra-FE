'use client';

import React, { useMemo } from 'react';
import { Box, Avatar } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IStudentChargeData } from '../ChargesManage/Component/type';

interface ICombinedProps {
  data: IStudentChargeData[];
  isLoading?: boolean;
  onViewAllCharges?: (student: IStudentChargeData) => void;
}

const StudentChargeListTable: React.FC<ICombinedProps> = ({
  data,
  isLoading = false,
  onViewAllCharges,
}) => {
  const tableData = useMemo(
    () =>
      (data || []).map((item: IStudentChargeData) => ({
        ...item,
        studentName: item.studentName || '-',
        grNumber: item.grNumber || '-',
        rollNumber: item.rollNumber ?? '-',
        standardName: item.standardName || '-',
        divisionName: item.divisionName || '-',
        classDivision: `${item.standardName || '-'}-${item.divisionName || '-'}`,
        charges: Array.isArray(item.charges) ? item.charges : [],
      })),
    [data]
  );

  return (
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
              <Box component="span" sx={{ typography: 'caption', fontSize: 13 }}>
                {row.studentName}
              </Box>
            </Box>
          ),
        },
        { id: 'grNumber', label: 'GR No.', align: 'left', isFilter: true, minWidth: 80 },
        {
          id: 'rollNumber',
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
          render: (value, row) => `${row.standardName}-${row.divisionName}`,
        },
        {
          id: 'charges',
          label: 'Total Charges',
          align: 'left',
          minWidth: 160,
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
      isLoading={isLoading}
      data={tableData || []}
    />
  );
};

export default StudentChargeListTable;
