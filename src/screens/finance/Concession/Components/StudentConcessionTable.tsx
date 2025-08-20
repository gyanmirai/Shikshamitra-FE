'use client';

import type { LabelColor } from 'src/components/label';

import React, { useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Avatar, MenuList, MenuItem, Typography } from '@mui/material';

import {
  ConcessionStatusType,
  ConcessionStatusOptions,
  ConcessionStatusTypeColors,
} from 'src/enums/concession-status-type';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IStudentInfo } from '../type';
import type { IViewConcessionRequestProps } from '../../ConcessionAdmin/type';

interface ICombinedProps {
  data: any[];
  onRequestConcession?: (student: IStudentInfo) => void;
  onViewConcession?: (student: IViewConcessionRequestProps) => void;
}

const StudentConcessionTable: React.FC<ICombinedProps> = ({
  data,
  onRequestConcession,
  onViewConcession,
}) => {
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {onRequestConcession && (
          <MenuItem
            onClick={() => {
              onRequestConcession(row as IStudentInfo);
              pop.onClose();
            }}
          >
            <Add />
            Request Concession
          </MenuItem>
        )}
      </MenuList>
    ),
    [onRequestConcession]
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
          minWidth: 150,
          render: (value, row) => (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar src={row.avatarUrl} alt={row.studentName} sx={{ width: 32, height: 32 }} />
              <Typography variant="body2">{row.studentName}</Typography>
            </Box>
          ),
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
        },
        {
          id: 'boardMedium',
          label: 'Board/Medium',
          align: 'left',
          minWidth: 120,
        },
        {
          id: 'classDivision',
          label: 'Class/Division',
          align: 'left',
          minWidth: 120,
        },
        {
          id: 'rollNo',
          label: 'Roll No.',
          align: 'left',
        },
        {
          id: 'grNo',
          label: 'GR No.',
          align: 'left',
        },
        {
          id: 'sibling',
          label: 'Sibling',
          align: 'left',
          render: (value) => value || '-',
        },
        {
          id: 'concessionType',
          label: 'Concession Type',
          align: 'left',
          minWidth: 150,
        },
        {
          id: 'reason',
          label: 'Reason of Concession Request',
          align: 'left',
          minWidth: 220,
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: 120,
          filterType: 'enum',
          enumOptions: ConcessionStatusOptions,
          sticky: true,
          render: (value) => {
            if (!value) return '-';
            const color = ConcessionStatusTypeColors[value as ConcessionStatusType] as LabelColor;
            return <Label color={color}>{ConcessionStatusType[value]}</Label>;
          },
        },
        {
          id: 'actions',
          label: 'Actions',
          align: 'left',
          isSort: false,
          isFilter: false,
          sticky: true,
          minWidth: 100,
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
