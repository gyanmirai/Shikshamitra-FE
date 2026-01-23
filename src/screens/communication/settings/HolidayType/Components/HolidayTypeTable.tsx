import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

import type { IHolidayType, IHolidayTypeTableProps } from '../type';

const HolidayTypeTable: React.FC<IHolidayTypeTableProps> = ({
  data,
  onAddHolidayType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => {
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'holidayType',
        label: 'Name',
        align: 'left',
        render: (value, row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SubjectColorIndicator color={row.color} />
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value || '--'}
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
                onDelete(row as IHolidayType);
              }}
              handleEditClick={() => {
                onEdit(row as IHolidayType);
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
      tableId="holiday-type-data-table"
      noDataText={
        <>
          No holiday type data found.{' '}
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
              onAddHolidayType.onTrue();
              setOpenDialog(true);
              setEditData(null);
            }}
          >
            Add Holiday
          </Typography>
        </>
      }
      columns={columns}
      data={data || []}
    />
  );
};

export default HolidayTypeTable;
