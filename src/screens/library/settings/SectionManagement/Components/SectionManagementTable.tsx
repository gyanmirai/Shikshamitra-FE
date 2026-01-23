import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { ISection, ISectionTableProps } from './type';

const SectionManagementTable: React.FC<ISectionTableProps> = ({
  onAddSection,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  onView,
  data,
  isLoading,
}) => {
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'sectionName',
        label: 'Section Name',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'numberOfColumns',
        label: 'No. of Shelf',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 50,
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
              showViewIcon
              handleDeleteClick={() => {
                onDelete(row as ISection);
              }}
              handleEditClick={() => {
                onEdit(row as ISection);
              }}
              handleViewClick={() => {
                onView(row as ISection);
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
      tableId="section-management-data-table"
      isLoading={isLoading}
      noDataText={
        <>
          Section Data Not Found{' '}
          <Box
            onClick={() => {
              onAddSection.onTrue();
              setOpenDialog(true);
              setEditData(null);
            }}
            color="primary.main"
            fontWeight={600}
            role="button"
            tabIndex={0}
            aria-label="Add Section"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onAddSection.onTrue();
                setOpenDialog(true);
                setEditData(null);
              }
            }}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                textDecoration: 'underline',
              },
            }}
          >
            Add Section
          </Box>
        </>
      }
      columns={columns}
      data={data || []}
    />
  );
};

export default SectionManagementTable;
