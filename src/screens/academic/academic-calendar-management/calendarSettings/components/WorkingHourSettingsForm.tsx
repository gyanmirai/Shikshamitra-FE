'use client';

import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionHeader } from 'src/components/form-section-card/section-header';

import { WorkingHourForm } from './WorkingHourForm';
import { workingHourColumns } from './working-hour-columns';
import { useWorkingHourSettings } from './useWorkingHourSettings';

export default function WorkingHourSettingsForm({ calendarId }: { calendarId: string }) {
  const state = useWorkingHourSettings(calendarId);
  return (
    <Box>
      <FormSectionHeader
        title="Working Hours Configuration"
        icon="mdi:clock-outline"
        descriptionTooltip="Review each class shift or assign working hours to an unassigned class."
        action={
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => state.start(null)}
            disabled={!calendarId}
          >
            Add shift
          </Button>
        }
      />
      {!calendarId ? (
        <Typography color="text.secondary" py={3}>
          Select a calendar to configure working hours
        </Typography>
      ) : (
        <CustomizableTable
          tableTitle="Class Working Hours"
          tableId="working-hours-settings-table"
          isLoading={state.isLoading}
          isPagination={false}
          isSearch={false}
          isFilter={false}
          isShowedDense={false}
          data={state.rows}
          columns={workingHourColumns({
            deleting: state.deleting,
            onEdit: (hour) => state.start(hour),
            onAssign: (row) => state.start(null, row.id),
            onDelete: state.setDeletingHour,
          })}
          noDataText="No classes configured for this medium"
        />
      )}
      <CustomDialog
        open={state.open}
        handleClose={state.close}
        disableClose={state.busy}
        guardUnsavedChanges={false}
        title={state.editing ? 'Edit Working Hour' : 'Add Working Hour'}
        titleInfo="Set the class shift, working times and optional recess."
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            state.formik.submitForm();
          },
        }}
      >
        <WorkingHourForm
          formik={state.formik}
          classes={state.classes}
          editing={Boolean(state.editing)}
          busy={state.busy}
          onClose={state.close}
        />
      </CustomDialog>
      {state.confirmation}
      <ConfirmDialog
        open={Boolean(state.deletingHour)}
        title="Delete Working Hours"
        content="Delete the selected class shift?"
        onClose={() => !state.deleting && state.setDeletingHour(null)}
        action={
          <LoadingButton
            size="small"
            color="error"
            variant="contained"
            loading={state.deleting}
            onClick={state.confirmDelete}
          >
            Delete working hours
          </LoadingButton>
        }
      />
    </Box>
  );
}
