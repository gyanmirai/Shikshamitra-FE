import React from 'react';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IImportanceLevel, IImportanceLevelTableProps } from '../type';

const ImportanceLevelTable: React.FC<IImportanceLevelTableProps> = ({
  data,
  onAddImportanceLevel,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="importance-level-data-table"
    noDataText={
      <>
        Importance Level Data Not Found{' '}
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
            onAddImportanceLevel.onTrue();
            setOpenDialog(true);
            setEditData(null);
          }}
        >
          Add Importance Level
        </Typography>
      </>
    }
    columns={[
      {
        id: 'levelName',
        label: 'Level Name',
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
        render: (value) => (
          <Typography variant="caption" fontSize="13px" sx={{ color: 'text.secondary' }}>
            {value || '--'}
          </Typography>
        ),
      },
      {
        id: 'createdBy',
        label: 'Created By',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'createdDate',
        label: 'Created Date',
        align: 'left',
        filterType: 'date',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
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
                onDelete(row as IImportanceLevel);
              }}
              handleEditClick={() => {
                onEdit(row as IImportanceLevel);
              }}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default ImportanceLevelTable;
