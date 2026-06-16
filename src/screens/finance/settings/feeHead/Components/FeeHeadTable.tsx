import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IFeeHead, IFeeHeadTableProps } from './type';

const FeeHeadTable: React.FC<IFeeHeadTableProps> = ({
  data,
  isLoading,
  onAddFeeHead,
  setEditData,
  onEdit,
  onDelete,
  totalCount,
  onServerPagination,
  onServerSearch,
}) => {
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
              disableDeleteIcon={row?.isUsedInDownstream}
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
      serverSidePagination
      serverSideSearch
      totalCount={totalCount}
      onServerPagination={onServerPagination}
      onServerSearch={onServerSearch}
    />
  );
};

export default FeeHeadTable;
