'use client';

import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Stack, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetShiftsQuery,
  useDeleteShiftMutation,
} from 'src/redux/shiftManagement/shift-management-api';
import { InstituteFieldFormattingPopover } from 'src/components/institute-field-formatting/institute-field-formatting-popover';

import { ShiftFormDialog } from './ShiftFormDialog';
import { ShiftDeleteDialog } from './ShiftDeleteDialog';

import type { ShiftRecord } from './use-shift-form';

const ShiftManageMentScreen = () => {
  const open = useBoolean();
  const confirm = useBoolean(false);
  const [editData, setEditData] = useState<ShiftRecord | null>(null);
  const closeShiftForm = () => {
    setEditData(null);
    open.onFalse();
  };
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetShiftsQuery,
    options: { refetchOnMountOrArgChange: false },
  });
  const [deleteShift, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteShiftMutation,
  });

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <ShiftDeleteDialog
        open={confirm.value}
        name={editData?.shiftName}
        busy={isDeleteLoading}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        onDelete={async () => {
          await deleteShift(editData?.id || '').unwrap();
          shikshaMitraToast.success({ message: 'Shift deleted successfully.' });
          confirm.onFalse();
          setEditData(null);
        }}
      />
      <CustomBreadcrumbs
        heading="Shift Management"
        description="Create and manage named shifts with start and end times for the school's daily schedule."
        links={[{ name: 'Institute Setup' }, { name: 'Shift Management' }]}
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <InstituteFieldFormattingPopover scope="shifts" />
            <Button startIcon={<Add />} size="small" variant="contained" onClick={open.onTrue}>
              Shift
            </Button>
          </Stack>
        }
      />
      <CustomizableTable
        noDataText={
          <>
            No shifts have been added yet.{' '}
            <Box
              onClick={() => {
                open.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Shift
            </Box>
          </>
        }
        tableId="shift-management"
        isLoading={isLoading}
        columns={[
          { label: 'Name', id: 'shiftName' },
          { label: 'Start Time', id: 'startTime' },
          { label: 'End Time', id: 'endTime' },
          {
            label: 'Action',
            id: 'action',
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showDeleteIcon
                  showEditIcon
                  handleEditClick={() => {
                    setEditData(row as ShiftRecord);
                    open.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setEditData(row as ShiftRecord);
                    confirm.onTrue();
                  }}
                  showThreeDots={false}
                />
              );
            },
          },
        ]}
        data={data?.items || []}
      />
      {open.value && <ShiftFormDialog onClose={closeShiftForm} editData={editData} />}
    </Box>
  );
};

export default ShiftManageMentScreen;
