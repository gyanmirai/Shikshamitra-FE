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
  const { inquiry, readOnly, listReview } = props;
  if (!listReview) {
    if (inquiry.hasLinkedSiblings || inquiry.siblingFamilyConfirmed)
      return <Label color="success">Siblings linked</Label>;
    if (!inquiryFamilyConfirmationVisible(inquiry, readOnly)) return null;
  }
  return <InquiryFamilyConfirmationContent key={inquiry.id} {...props} />;
}

function InquiryFamilyConfirmationContent(props: InquiryFamilyConfirmationProps) {
  const { listReview, readOnly } = props;
  const state = useInquiryFamilyConfirmation(props);
  const { formik } = state;
  const fromList = Boolean(listReview);
  const canAddSibling = !fromList || (!state.linked && !readOnly);
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
      {!fromList &&
        (state.entryReason ? (
          <CustomTooltip title={state.entryReason} describeChild>
            <Box component="span" tabIndex={0} sx={{ display: 'inline-flex' }}>
              {button}
            </Box>
          </CustomTooltip>
        ) : (
          button
        ))}
      {state.open && (
        <CustomDialog
          open
          title={fromList ? 'Check Parent Details' : 'Confirm Siblings'}
          maxWidth="xs"
          titleInfo={
            fromList
              ? 'Review the parent and children in this family.'
              : 'Review the family before linking.'
          }
          titleInfoPlacement="right"
          handleClose={state.requestClose}
          guardUnsavedChanges={false}
          disableClose={state.saving}
          hasUnsavedChanges={state.hasUnsavedSelection}
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
                    disabled={fromList ? state.saving || state.needsTargetRefresh : locked}
                    error={
                      formik.touched.family || formik.submitCount ? formik.errors.family : undefined
                    }
                    onSelect={(familyId) => formik.setFieldValue('family', familyId)}
                    currentChild={fromList ? state.target : undefined}
                    linked={fromList && state.linked}
                  />
                ) : (
                  !state.requestError && (
                    <Typography variant="body2" color="text.secondary">
                      {fromList
                        ? 'No other children are available to review for this inquiry.'
                        : 'No available family matches were found. Edit the parent contact details or reload matches.'}
                    </Typography>
                  )
                )}
                {state.staleTarget && (
                  <Alert severity="warning">
                    This inquiry changed. Reload matches and select the family again.
                  </Alert>
                )}
                {!state.loading && state.entryReason && (
                  <Alert severity="warning">{state.entryReason}</Alert>
                )}
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
                      disabled={state.saving || (!fromList && Boolean(state.entryReason))}
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
              {canAddSibling ? 'Cancel' : 'Close'}
            </Button>
            {canAddSibling && (
              <LoadingButton
                type="submit"
                size="small"
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.assigned} width={18} />}
                loading={state.saving}
                disabled={locked || !state.selectedFamily?.children.length}
              >
                {fromList ? 'Add as Sibling' : 'Confirm siblings'}
              </LoadingButton>
            )}
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
