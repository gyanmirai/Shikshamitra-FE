import React from 'react';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IBookCategory, IBookCategoryTableProps } from './type';

const CategoryTable: React.FC<IBookCategoryTableProps> = ({
  data,
  onAddBookCategory,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  open,
}) => (
  <CustomizableTable
    tableId="category-data-table"
    noDataText={
      <>
        Category Data Not Found{' '}
        <Typography
          component="span"
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              textDecoration: 'underline',
            },
          }}
          onClick={() => {
            onAddBookCategory.onTrue();
            setOpenDialog(true);
            setEditData(null);
          }}
        >
          Add Category
        </Typography>
      </>
    }
    columns={[
      {
        id: 'categoryName',
        label: 'Name',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
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
                onDelete(row as IBookCategory);
              }}
              handleEditClick={() => {
                onEdit(row as IBookCategory);
              }}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default CategoryTable;
