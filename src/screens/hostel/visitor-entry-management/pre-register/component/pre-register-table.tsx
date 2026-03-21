import dayjs from 'dayjs';
import React, { useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, MenuList, MenuItem } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import visitorLogData from 'src/json/hostel/visitor-management/pre-registerData.json';

import type { IPreVisitorLog, IPreRegisterTableProps } from '../pre-register-interface';

const PreRegisterTable: React.FC<IPreRegisterTableProps> = ({ onClick, onMarkIn, onMarkOut }) => {
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {row.status === 'InHostel' ? (
          <MenuItem
            onClick={() => {
              onMarkOut(row as IPreVisitorLog);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-right-bold" sx={{ mr: 1 }} />
            Mark Out
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              onMarkIn(row as IPreVisitorLog);
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
    <Box>
      <CustomizableTable
        tableId="visitor-log-data-table"
        searchFieldProps={{
          placeholder: 'Search by Visitor Name...',
          label: 'Search by Visitor Name...',
        }}
        noDataText={
          <>
            No Pre-Visitor Data Found{' '}
            <Box
              onClick={() => {
                onClick({} as IPreVisitorLog, 'new');
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
              Add Pre-Visitor
            </Box>
          </>
        }
        columns={[
          { id: 'visitorName', label: 'Visitor Name', align: 'left' },
          { id: 'contactNo', label: 'Contact Number', align: 'left' },
          {
            id: 'visitStartDateTime',
            label: 'Visit Start Date',
            align: 'left',
            filterType: 'date',
            render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : null),
          },
          {
            id: 'visitEndDateTime',
            label: 'Visit End Time',
            align: 'left',
            isFilter: false,
            isSort: false,

            render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
          },
          { id: 'reasonForVisit', label: 'Reason for Visit', align: 'left' },
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
                  showViewIcon
                  handleDeleteClick={() => {
                    onClick(row as IPreVisitorLog, 'delete');
                  }}
                  handleEditClick={() => {
                    onClick(row as IPreVisitorLog, 'edit');
                  }}
                  handleViewClick={() => {
                    onClick(row as IPreVisitorLog, 'view');
                  }}
                />
              );
            },
          },
        ]}
        data={visitorLogData}
      />
    </Box>
  );
};

export default PreRegisterTable;
