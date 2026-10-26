'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormSectionCard } from 'src/components/form-section-card';
import { Alert, Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useAcademicOrder } from './use-academic-order';
import { AcademicOrderList } from './academic-order-list';
import { academicOrderLabels } from './academic-order-model';

import type { AcademicOrderProps } from './use-academic-order';

export function AcademicOrderDialog(props: AcademicOrderProps) {
  const { parentName, kind } = props;
  const order = useAcademicOrder(props);
  const labels = academicOrderLabels[kind];
  return (
    <>
      <CustomDialog
        open
        title={labels.title}
        titleInfo="Save the display order used in the academic hierarchy and selection lists."
        handleClose={order.close}
        disableClose={order.isSaving}
        guardUnsavedChanges={false}
        hasForm={false}
        maxWidth="sm"
        paperProps={{
          sx: {
            maxHeight: 'calc(100dvh - 32px)',
            '& > #dialog-form': { height: 'auto !important', flex: '0 1 auto' },
          },
        }}
      >
        <DialogScrollContent scrollBarProps={{ sx: { flexGrow: 0 } }}>
          <FormSectionCard
            icon={GlobalIcons.notebook}
            title={parentName}
            descriptionTooltip={`Set the order of ${labels.plural} in this branch.`}
          >
            <Stack spacing={1} aria-busy={order.isSaving}>
              <Typography variant="body2" color="text.secondary">
                Drag the rows or use the move buttons, then save the order.
              </Typography>
              {order.error && <Alert severity="error">{order.error}</Alert>}
              {order.listChanged && (
                <Alert severity="warning">
                  This list changed. Close and reopen it before saving.
                </Alert>
              )}
              <AcademicOrderList
                items={order.draft}
                disabled={order.isSaving}
                onChange={order.setDraft}
              />
            </Stack>
          </FormSectionCard>
        </DialogScrollContent>
        <DialogActions>
          <Button
            type="button"
            size="small"
            variant="outlined"
            disabled={order.isSaving}
            onClick={order.close}
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} aria-hidden />}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="small"
            variant="contained"
            loading={order.isSaving}
            disabled={!order.isDirty || order.listChanged}
            onClick={order.save}
            startIcon={<Iconify icon={GlobalIcons.submit} width={18} aria-hidden />}
          >
            Save order
          </Button>
        </DialogActions>
      </CustomDialog>
      {order.confirmation}
    </>
  );
}
