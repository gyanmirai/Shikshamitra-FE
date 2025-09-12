'use client';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Typography, IconButton } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  FeeStructureLockStatusType,
  FeeStructureLockStatusOptions,
} from 'src/enums/finance-fee-structure-status';

import type { IFeeStructure, IFeeStructureTableProps } from '../type';

const FeeStructureTable: React.FC<IFeeStructureTableProps> = ({
  data,
  addFeeStructure,
  editData,
  setEditData,
  onDelete,
  onEdit,
  onToggle,
  onView,
}) => {
  const theme = useTheme();
  console.log('data====', data);

  return (
    <CustomizableTable
      tableId="fee-structure-table"
      noDataText={
        <>
          No Fee Structure data found
          <Box
            onClick={() => {
              addFeeStructure.onTrue();
              setEditData(null);
            }}
            color="primary.main"
            fontWeight={600}
            sx={{
              '&:hover': { cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' },
            }}
          >
            Fee Structure
          </Box>
        </>
      }
      columns={[
        { id: 'feeStructureName', label: 'Name', align: 'left' },
        {
          id: 'board',
          label: 'Board/Medium',
          align: 'left',
          render: (value, row) => (
            <Typography variant="caption" fontSize="13px">
              {value}/{row.medium}
            </Typography>
          ),
        },
        { id: 'receiptBook', label: 'Receipt Book', align: 'left' },
        { id: 'paymentTerm', label: 'Payment Term', align: 'left' },
        { id: 'totalClass', label: 'Total Class', align: 'left' },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: 40,
          isFilter: false,
          sticky: true,
          isSort: false,
          filterType: 'enum',
          enumOptions: FeeStructureLockStatusOptions,
          render(value, row) {
            const statusColor =
              value === FeeStructureLockStatusType.Locked
                ? theme.palette.grey[500]
                : theme.vars.palette.success.main;

            return (
              <CustomTooltip
                title={value === 0 ? 'Unlock' : 'Lock'}
                arrow
                placement="left"
                PopperProps={{
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 0], // Try 0 or adjust closer
                      },
                    },
                  ],
                }}
              >
                <IconButton
                  onClick={() => {
                    onToggle?.(row as IFeeStructure);
                  }}
                  sx={{
                    p: 0.6, // some padding for a more clickable area
                    borderRadius: '50%',
                    backgroundColor: statusColor, // light background to indicate clickability
                    transition: 'transform 0.2s ease-in-out, background-color 0.2s',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.1)', backgroundColor: statusColor },
                  }}
                >
                  <Iconify
                    icon={
                      value === FeeStructureLockStatusType.Locked
                        ? 'mdi:lock-open-outline'
                        : 'mdi:lock-outline'
                    }
                    sx={{ width: 20, height: 20, color: '#fff' }}
                  />
                </IconButton>
              </CustomTooltip>
            );
          },
        },
        {
          id: 'action',
          label: 'Action',
          align: 'left',
          isSort: false,
          isFilter: false,
          sticky: true,
          minWidth: 50,
          render: (value, row) => (
            <ThreeDotsActions
              showThreeDots={false}
              showEditIcon
              showViewIcon
              handleViewClick={() => {
                onView?.(row as IFeeStructure);
              }}
              handleEditClick={() => {
                // TODO: Imp lement edit functionality
                onEdit?.(row as IFeeStructure);
              }}
            />
          ),
        },
      ]}
      data={data || []}
    />
  );
};

export default FeeStructureTable;
