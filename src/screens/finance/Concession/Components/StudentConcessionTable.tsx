'use client';

import React, { useCallback } from 'react';

import { Box, Avatar, MenuList, MenuItem, Typography } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IStudentInfo } from '../type';
import type { IViewConcessionRequestProps } from '../../ConcessionAdmin/type';

interface ICombinedProps {
  data: any[];
  onRequestConcession?: (student: IStudentInfo) => void;
  onViewConcession?: (student: IViewConcessionRequestProps) => void;
  onViewAllConcession?: (student: IStudentInfo) => void;
}

const StudentConcessionTable: React.FC<ICombinedProps> = ({
  data,
  onRequestConcession,
  onViewConcession,
  onViewAllConcession,
}) => {
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <>
          <MenuItem
            onClick={() => {
              onViewAllConcession?.(row as IStudentInfo);
              pop.onClose();
            }}
          >
            <Iconify icon={GlobalIcons.eye} />
            View Concession
          </MenuItem>
        </>
      </MenuList>
    ),
    [onViewAllConcession]
  );

  return (
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
              <Avatar src={row.avatarUrl} alt={row.studentName} sx={{ width: 32, height: 32 }} />
              <Typography variant="body2">{row.studentName}</Typography>
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
          label: 'Actions',
          align: 'left',
          isSort: false,
          isFilter: false,
          sticky: true,
          minWidth: 60,
          render: (value, row) => (
            <ThreeDotsActions
              showThreeDots={!!onRequestConcession}
              placement="right-center"
              showViewIcon={!!onViewConcession}
              handleViewClick={() => onViewConcession?.(row as IViewConcessionRequestProps)}
              actions={(prop) => (onRequestConcession ? actions({ ...prop, row }) : <></>)}
            />
          ),
        },
      ]}
      data={data || []}
    />
  );
};

export default StudentConcessionTable;
