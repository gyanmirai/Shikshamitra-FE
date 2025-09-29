'use client';

import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useCallback } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Avatar, MenuList, MenuItem, Typography } from '@mui/material';
import {
  ConcessionStatusType,
  ConcessionStatusOptions,
  ConcessionStatusTypeColors,
} from 'src/enums/concession-status-type';

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
        <MenuItem
          onClick={() => {
            onViewAllConcession?.(row as IStudentInfo);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.eye} />
          View Concession
        </MenuItem>
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
          id: 'concession.concessionType',
          label: 'Concession Type',
          align: 'left',
          minWidth: '180px',
        },
        {
          id: 'requestDate',
          label: 'Request Date',
          align: 'left',
          minWidth: 150,
          filterType: 'date',
          render: (value) => (
            <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY')}</Typography>
          ),
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
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: 120,
          sticky: true,
          filterType: 'enum',
          enumOptions: ConcessionStatusOptions,
          render: (value) => {
            if (value === undefined || value === null) return '-';
            const color = ConcessionStatusTypeColors[value as ConcessionStatusType] as LabelColor;
            return <Label color={color}>{ConcessionStatusType[value]}</Label>;
          },
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
