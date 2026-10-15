import { LoadingButton } from '@mui/lab';
import { Alert, Stack, Button, Typography, DialogActions } from '@mui/material';

import { Iconify } from '../iconify';
import { useBoardForm } from './use-board-form';
import { ConfirmDialog } from '../confirm-dialog';
import { BoardNameField } from './board-name-field';
import { BoardDateFields } from './board-date-fields';
import { DialogScrollContent } from '../customDialog';
import { AcademicFormActionIcon } from './academic-form-action-icon';

import type { BoardFormProps } from './board-form-model';

export const BoardForm = (props: BoardFormProps) => {
  const { formik, confirm, yearStart, yearEnd, onSubmit, saving } = useBoardForm(props);
  const { editData, academicYear, academicYearId, boards, handleClose } = props;
  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={editData ? 'Update' : 'Create'}
        content={`Are you sure you want to ${editData ? 'update' : 'create'} this education board?`}
        action={
          <LoadingButton
            variant="contained"
            loading={saving}
            onClick={onSubmit}
            startIcon={<AcademicFormActionIcon action="confirm" />}
          >
            Confirm
          </LoadingButton>
        }
      />
      <DialogScrollContent>
        <Stack spacing={2.5}>
          {(yearStart || yearEnd) && (
            <Alert
              severity="info"
              variant="outlined"
              icon={<Iconify icon="solar:calendar-bold-duotone" width={18} />}
            >
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                Academic Year:{' '}
                {academicYear?.name || `${yearStart?.format('YYYY')}-${yearEnd?.format('YYYY')}`}
              </Typography>
              {yearStart && yearEnd && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
                  Allowed date range:{' '}
                  <b>
                    {yearStart.format('DD MMM YYYY')} to {yearEnd.format('DD MMM YYYY')}
                  </b>
                  . Board dates must fall within this range.
                </Typography>
              )}
            </Alert>
          )}
          <BoardNameField
            value={formik.values.board}
            onChange={(value) => formik.setFieldValue('board', value)}
            customName={formik.values.customName}
            onCustomNameChange={(value) => formik.setFieldValue('customName', value)}
            customNameError={formik.touched.customName ? formik.errors.customName : undefined}
            boards={boards}
            academicYearId={String(academicYearId)}
            editingBoardId={editData?.id}
            error={formik.touched.board && Boolean(formik.errors.board)}
            helperText={formik.touched.board ? formik.errors.board : undefined}
          />
          <BoardDateFields formik={formik} yearStart={yearStart} yearEnd={yearEnd} />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          onClick={handleClose}
          disabled={saving}
          startIcon={<AcademicFormActionIcon action="cancel" />}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={saving}
          variant="contained"
          size="small"
          type="submit"
          startIcon={<AcademicFormActionIcon action="submit" />}
          onClick={() => formik.submitForm()}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
