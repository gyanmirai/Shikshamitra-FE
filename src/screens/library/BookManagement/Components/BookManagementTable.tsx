import React from 'react';
import { Box } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IBookTableProps } from './type';

const BookManagementTable: React.FC<IBookTableProps> = ({ data, onView, onEdit, onDelete }) => (
  <Box>
    <CustomizableTable
      tableId="book-table"
      noDataText="No Books Found"
      columns={[
        { id: 'title', label: 'Title', align: 'left' },
        { id: 'isbn', label: 'ISBN', align: 'left' },
        { id: 'author', label: 'Author', align: 'left' },
        { id: 'publisher', label: 'Publisher', align: 'left' },
        { id: 'subject', label: 'Subject', align: 'left' },
        { id: 'category', label: 'Category', align: 'left' },
        { id: 'language', label: 'Language', align: 'left' },
        { id: 'createdOn', label: 'Created On', align: 'left' },
        {
          id: 'action',
          label: 'Actions',
          minWidth: 80,
          align: 'left',
          isSort: false,
          sticky: true,
          isFilter: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                placement="right-top"
                showDeleteIcon
                showEditIcon
                showViewIcon
                showThreeDots={false}
                handleViewClick={() => onView?.(row as any)}
                handleDeleteClick={() => onDelete?.(row as any)}
                handleEditClick={() => onEdit?.(row as any)}
              />
            );
          },
        },
      ]}
      data={data || []}
    />
  </Box>
);

export default BookManagementTable;
