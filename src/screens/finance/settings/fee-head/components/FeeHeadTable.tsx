import type { IColumn } from 'src/components/customizable-table/types';

import React, { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, IconButton, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';

import type { IFeeHead, IFeeHeadTableProps } from './type';

const FeeHeadTable: React.FC<IFeeHeadTableProps> = ({
  data,
  isLoading,
  onAddFeeHead,
  setEditData,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const theme = useTheme();
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'feeCategoryName',
        label: 'Fee Category',
        align: 'left',
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        render: (value) => (
          <Typography
            variant="caption"
            fontSize="13px"
            sx={{
              maxWidth: 300,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'isActive',
        label: 'Active',
        isFilter: false,
        isSort: false,
        render(value, row) {
          const statusColor =
            value === true ? theme.palette.success.main : theme.palette.text.secondary;
          return (
            <CustomTooltip
              title={value === true ? 'Active' : 'InActive'}
              arrow
              placement="left"
              PopperProps={{
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 0],
                    },
                  },
                ],
              }}
            >
              <IconButton
                onClick={() => {
                  onToggle(row as IFeeHead);
                }}
                sx={{
                  p: 0.6,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s ease-in-out, background-color 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    backgroundColor: 'rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Iconify
                  icon={GlobalIcons.tick}
                  sx={{
                    width: 20,
                    height: 20,
                    color: statusColor,
                  }}
                />
              </IconButton>
            </CustomTooltip>
          );
        },
      },
      {
        id: 'action',
        label: 'Action',
        minWidth: 60,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showEditIcon
              showDeleteIcon
              handleEditClick={() => {
                onEdit(row as IFeeHead);
              }}
              handleDeleteClick={() => {
                onDelete(row as IFeeHead);
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onEdit]
  );

  return (
    <CustomizableTable
      tableId="fee-head-data-table"
      isLoading={isLoading}
      noDataText={
        <>
          Fee Head Data Not Found{' '}
          <Box
            onClick={() => {
              onAddFeeHead.onTrue();
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
            Add Fee Head
          </Box>
        </>
      }
      columns={columns}
      data={data || []}
    />
  );
};

export default FeeHeadTable;
