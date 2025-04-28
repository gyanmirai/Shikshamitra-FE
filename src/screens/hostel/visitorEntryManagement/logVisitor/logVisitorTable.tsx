'use client';

import type { LabelColor } from 'src/components/label';

import React, { useCallback } from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import visitorLogData from 'src/json/hostel/visitorManagement/visitorLogData.json';
import {
  VisitorStatusType,
  VisitorStatusColors,
  VisitorStatusOptions,
} from 'src/enums/visitor-status-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IVisitorData, IVisitorDataTableProps } from './type';

const VisitorLogTable: React.FC<IVisitorDataTableProps> = ({
  openDialog,
  setOpenDialog,
  editData,
  setEditData,
  onDelete,
  data,
  onEdit,
  onAddVisitor,
  onMarkIn,
  onMarkOut,
}) => {
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {row.status === 'InHostel' ? (
          <MenuItem
            onClick={() => {
              onMarkOut(row as IVisitorData);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-right-bold" sx={{ mr: 1 }} />
            Mark Out
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              onMarkIn(row as IVisitorData);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-left-bold" sx={{ mr: 1 }} />
            Mark In
          </MenuItem>
        )}
      </MenuList>
    ),
    [onMarkIn, onMarkOut]
  );

  return (
    <CustomizableTable
      tableId="visitor-log-data-table"
      searchFieldProps={{
        placeholder: 'Search by Visitor Name...',
        label: 'Search by Visitor Name...',
      }}
      noDataText={
        <>
          No Visitor Data Found{' '}
          <Box
            onClick={() => {
              setOpenDialog(true);
              setEditData(null);
            }}
            color="primary.main"
            fontWeight={600}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                textDecoration: 'underline',
              },
            }}
          >
            Log Visitor
          </Box>
        </>
      }
      columns={[
        { id: 'visitorName', label: 'Visitor Name', align: 'left' },
        { id: 'idProof', label: 'ID Proof', align: 'left' },
        { id: 'aadharNumber', label: 'Aadhar Number', align: 'left' },
        { id: 'contactNo', label: 'Contact Number', align: 'left' },
        { id: 'visingWhome', label: 'Visiting Whom', align: 'left' },
        { id: 'entryTime', label: 'Entry Time', align: 'left' },
        { id: 'exitTime', label: 'Exit Time', align: 'left' },
        { id: 'reasonForVisit', label: 'Reason for Visit', align: 'left' },
        {
          id: 'status',
          label: 'Status',
          filterType: 'enum',
          enumOptions: VisitorStatusOptions,
          minWidth: '130px',
          align: 'left',
          render(value, row) {
            const color = VisitorStatusColors[value as VisitorStatusType] as LabelColor;
            return <Label color={color}>{VisitorStatusType[value]}</Label>;
          },
        },
        {
          id: 'action',
          label: 'Actions',
          minWidth: 80,
          isSort: false,
          sticky: true,
          isFilter: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                actions={(prop) => actions({ ...prop, row })}
                placement="right-top"
                showDeleteIcon
                showEditIcon
                handleDeleteClick={() => {
                  onDelete(row as IVisitorData);
                }}
                handleEditClick={() => {
                  onEdit(row as IVisitorData);
                }}
                handleViewClick={() => {}}
              />
            );
          },
        },
      ]}
      data={visitorLogData}
    />
  );
};

export default VisitorLogTable;
