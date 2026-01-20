import type { IColumn } from 'src/components/customizabaleTable/type';

import React, { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Typography, IconButton } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IFeeHead, IFeeHeadTableProps } from './type';

const FeeHeadTable: React.FC<IFeeHeadTableProps> = ({
  data,
  onAddFeeHead,
  editData,
  open,
  setOpenDialog,
  setEditData,
  onEdit,
  // New props for toggle functionality
  activeDialog,
  selectedEntry,
  setSelectedEntry,
}) => {
  const theme = useTheme();

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'feeHeadName',
        label: 'Name',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'feeCategoryId',
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
        id: 'toggle',
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
                  activeDialog.onTrue();
                  setSelectedEntry(row as IFeeHead);
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
              handleEditClick={() => {
                onEdit(row as IFeeHead);
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <CustomizableTable
      tableId="fee-head-data-table"
      noDataText={
        <>
          Fee Head Data Not Found{' '}
          <Box
            onClick={() => {
              onAddFeeHead.onTrue();
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
