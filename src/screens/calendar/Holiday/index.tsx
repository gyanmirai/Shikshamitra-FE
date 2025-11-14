'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetHolidaysQuery } from 'src/redux/communication/holiday/holidayDataApi';

import HolidayForm from './Components/HolidayForm';
import HolidayTable from './Components/HolidayTable';

import type { IHoliday } from './Components/type';

const HolidayManagement = (props: TabComponentType) => {
  const [open, setOpen] = useState(false);

  const { data: holidayData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHolidaysQuery,
  });

  const [editingHoliday, setEditingHoliday] = useState<IHoliday | null>(null);
  const [viewHoliday, setViewHoliday] = useState<IHoliday | null>(null);
  const view_dialog = useBoolean();
  const [deleteHoliday, setDeleteHoliday] = useState('');
  const confirm_dialog = useBoolean();
  const publish_modal = useBoolean();
  const [publishingHoliday, setPublishingHoliday] = useState<IHoliday | null>(null);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const handleCloseDialog = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditingHoliday(null);
        setOpen(false);
        publish_modal.onFalse();
        setPublishingHoliday(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      resetState();
    } else if (!isChanges) {
      resetState();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {open ? (
        <CustomBreadcrumbs
          heading={editingHoliday ? 'Update Holiday' : 'Add Holiday'}
          description={`${editingHoliday ? 'Update' : 'Create'} holidays with details such as holiday name, type, and date range.`}
          links={[
            { name: 'Calendar', href: '/calendar/dashboard' },
            { name: 'Holidays' },
            { name: editingHoliday ? 'Update Holiday' : 'Add Holiday' },
          ]}
          sx={{ px: 1, mb: 1 }}
          isBack
          onBack={() => handleCloseDialog(null, false)}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Holidays"
          description="View and manage all holidays. Add new holidays, update existing ones, or remove them as needed."
          links={[{ name: 'Calendar', href: '/calendar/dashboard' }, { name: 'Holidays' }]}
          sx={{ mb: 2 }}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Holiday
            </Button>
          }
        />
      )}

      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <HolidayForm
            initialValues={editingHoliday}
            isEdit={!!editingHoliday}
            onClose={handleCloseDialog}
          />
        </Card>
      ) : (
        <HolidayTable
          setOpen={setOpen}
          data={holidayData}
          onEdit={(row) => {
            setOpen(true);
            setEditingHoliday(row);
          }}
          onDelete={(id) => {
            confirm_dialog.onTrue();
            setDeleteHoliday(id);
          }}
          onPublish={(row) => {
            publish_modal.onTrue();
            setPublishingHoliday(row);
          }}
        />
      )}

      <ConfirmDialog
        open={confirm_dialog.value}
        onClose={() => {
          setDeleteHoliday('');
          confirm_dialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete{' '}
            <strong>&apos;{editingHoliday?.holidayName}&apos;</strong> Holiday?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={() => {}} size="small">
            Yes
          </Button>
        }
      />

      <ConfirmDialog
        open={publish_modal.value}
        onClose={() => {
          publish_modal.onFalse();
          setPublishingHoliday(null);
        }}
        title="Publish"
        content={
          <>
            Are you sure you want to publish{' '}
            <strong>&apos;{publishingHoliday?.holidayName}&apos;</strong> Holiday?
          </>
        }
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              publish_modal.onFalse();
              shikshaMitraToast.success({
                message: `Holiday "${publishingHoliday?.holidayName}" published successfully.`,
              });
            }}
            size="small"
          >
            Publish
          </Button>
        }
      />
    </Box>
  );
};

export default HolidayManagement;
