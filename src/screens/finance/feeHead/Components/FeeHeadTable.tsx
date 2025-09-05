import React from 'react';
import { Box, Typography } from '@mui/material';
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
  onDelete,
  onEdit,
}) => (
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
    columns={[
      {
        id: 'feeHeadName',
        label: 'Fee Head Name',
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
        id: 'action',
        label: 'Actions',
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
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => {
                onDelete(row as IFeeHead);
              }}
              handleEditClick={() => {
                onEdit(row as IFeeHead);
              }}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default FeeHeadTable;
