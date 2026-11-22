'use client';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Alert, Button, Skeleton, Typography, DialogActions } from '@mui/material';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';

import { AdmissionInquiryFamilyReview } from '../admission-inquiry-family-review';
import { inquiryFamilyConfirmationVisible } from './inquiry-family-confirmation-model';
import {
  useInquiryFamilyConfirmation,
  type InquiryFamilyConfirmationProps,
} from './use-inquiry-family-confirmation';

export function InquiryFamilyConfirmation(props: InquiryFamilyConfirmationProps) {
  const { inquiry, readOnly } = props;
  if (inquiry.hasLinkedSiblings || inquiry.siblingFamilyConfirmed)
    return <Label color="success">Siblings linked</Label>;
  if (!inquiryFamilyConfirmationVisible(inquiry, readOnly)) return null;
  return <InquiryFamilyConfirmationContent key={inquiry.id} {...props} />;
}

function InquiryFamilyConfirmationContent(props: InquiryFamilyConfirmationProps) {
  const state = useInquiryFamilyConfirmation(props);
  const { formik } = state;
  const locked =
    state.loading ||
    state.saving ||
    state.discardOpen ||
    state.needsTargetRefresh ||
    Boolean(state.entryReason) ||
    state.staleTarget;
  const button = (
    <Button
      type="button"
      size="small"
      variant="outlined"
      startIcon={<Iconify icon={GlobalIcons.family} width={18} />}
      disabled={Boolean(state.entryReason)}
      onClick={() => state.load()}
    >
      Confirm Siblings
    </Button>
  );
  return (
    <>
      {state.entryReason ? (
        <CustomTooltip title={state.entryReason} describeChild>
          <Box component="span" tabIndex={0} sx={{ display: 'inline-flex' }}>
            {button}
          </Box>
        </CustomTooltip>
      ) : (
        button
      )}
      {state.open && (
        <CustomDialog
          open
          title="Confirm Siblings"
          maxWidth="xs"
          titleInfo="Review the family before linking."
          titleInfoPlacement="right"
          handleClose={state.requestClose}
          guardUnsavedChanges={false}
          disableClose={state.saving}
          hasUnsavedChanges={formik.dirty}
          formProps={{
            noValidate: true,
            onSubmit: (event) => {
              event.preventDefault();
              event.stopPropagation();
              formik.submitForm();
            },
          }}
        >
          <DialogScrollContent>
            <FormBusyRegion busy={state.saving} label="Confirming Sibling Family…">
              <Stack spacing={2}>
                {state.loading ? (
                  <Stack spacing={2} role="status" aria-label="Loading Family Matches">
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                  </Stack>
                ) : state.candidates.length ? (
                  <AdmissionInquiryFamilyReview
                    families={state.families}
                    selectedFamily={state.selectedFamily}
                    guardianPhone={state.reviewInput?.guardianPhone ?? ''}
                    guardianEmail={state.reviewInput?.guardianEmail ?? undefined}
                    disabled={locked}
                    error={
                      formik.touched.family || formik.submitCount ? formik.errors.family : undefined
                    }
                    onSelect={(familyId) => formik.setFieldValue('family', familyId)}
                  />
                ) : (
                  !state.requestError && (
                    <Typography variant="body2" color="text.secondary">
                      No available family matches were found. Edit the parent contact details or
                      reload matches.
                    </Typography>
                  )
                )}
                {state.staleTarget && (
                  <Alert severity="warning">
                    This inquiry changed. Reload matches and select the family again.
                  </Alert>
                )}
                {state.entryReason && <Alert severity="warning">{state.entryReason}</Alert>}
                {state.requestError && state.requestError !== state.entryReason && (
                  <Alert severity="error">{state.requestError}</Alert>
                )}
                {!state.loading &&
                  (state.requestError || state.staleTarget || !state.candidates.length) && (
                    <Button
                      type="button"
                      size="small"
                      variant="text"
                      startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
                      disabled={state.saving || Boolean(state.entryReason)}
                      onClick={state.reload}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Reload Matches
                    </Button>
                  )}
              </Stack>
            </FormBusyRegion>
          </DialogScrollContent>
          <DialogActions disableSpacing sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              type="button"
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
              disabled={state.saving}
              onClick={state.requestClose}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              size="small"
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.assigned} width={18} />}
              loading={state.saving}
              disabled={locked || !state.selectedFamily?.children.length}
            >
              Confirm siblings
            </LoadingButton>
          </DialogActions>
        </CustomDialog>
      )}
      {state.discardOpen &&
        renderUnsavedConfirmation(state.keepEditing, state.close, {
          busy: state.saving,
          description: 'Your unsaved sibling selection will be lost.',
        })}
    </>
  );
}
