import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IZoneArea, IZoneAreaTableProps } from './type';

const ZoneAreaTable: React.FC<IZoneAreaTableProps> = ({
  onAddZoneArea,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  data: zoneAreaData,
  isLoading: zoneAreaLoading,
}) => {
  // Transform API response to match table format
  const transformedData = React.useMemo(() => {
    if (!zoneAreaData) return [];
    const data = Array.isArray(zoneAreaData) ? zoneAreaData : zoneAreaData?.data;
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => ({
      ...item,
      zoneName: item.name || item.zoneName,
    }));
  }, [zoneAreaData]);

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'zoneName',
        label: 'Name',
        align: 'left',
        minWidth: 180,
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
              handleDeleteClick={() => {
                onDelete(row as IZoneArea);
              }}
              handleEditClick={() => {
                onEdit(row as IZoneArea);
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
      tableId="zone-area-data-table"
      isLoading={zoneAreaLoading}
      noDataText={
        <>
          Zone/Area Data Not Found{' '}
          <Box
            onClick={() => {
              onAddZoneArea.onTrue();
              setOpenDialog(true);
              setEditData(null);
            }}
            color="primary.main"
            fontWeight={600}
            role="button"
            tabIndex={0}
            aria-label="Add Zone/Area"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onAddZoneArea.onTrue();
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
            Add Zone/Area
          </Box>
        </>
      }
      columns={columns}
      data={transformedData}
    />
  );
};

export default ZoneAreaTable;
