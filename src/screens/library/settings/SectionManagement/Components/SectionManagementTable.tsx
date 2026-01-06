import type { IColumn } from 'src/components/customizabaleTable/type';

import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetSectionManagementQuery } from 'src/redux/library/settingApi';

import type { ISection, ISectionTableProps } from './type';

const SectionManagementTable: React.FC<ISectionTableProps> = ({
  onAddSection,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  onView,
}) => {
  const { data: sectionData, isLoading: sectionsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSectionManagementQuery,
  });

  const columns: IColumn[] = [
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
  ];

  return (
    <CustomizableTable
      tableId="section-management-data-table"
      isLoading={sectionsLoading}
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
      data={sectionData || []}
    />
  );
};

export default SectionManagementTable;
