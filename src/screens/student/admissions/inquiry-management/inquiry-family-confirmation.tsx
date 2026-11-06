'use client';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Alert, Button, Skeleton, Typography, DialogActions } from '@mui/material';

import { buildInquiryFamilyReviews } from '../admission-inquiry-parent-review-model';
import {
  AdmissionInquiryParentReview,
  AdmissionInquiryContactMatch,
} from '../admission-inquiry-parent-review';
import {
  useInquiryFamilyConfirmation,
  type InquiryFamilyConfirmationProps,
} from './use-inquiry-family-confirmation';
import {
  inquiryFamilyParentKey,
  inquiryFamilyCandidateKey,
  inquiryFamilyConfirmationVisible,
} from './inquiry-family-confirmation-model';

export function InquiryFamilyConfirmation(props: InquiryFamilyConfirmationProps) {
  const { inquiry, readOnly } = props;
  if (inquiry.siblingFamilyConfirmed) return <Label color="success">Sibling Confirmed</Label>;
  if (!inquiryFamilyConfirmationVisible(inquiry, readOnly)) return null;
  return <InquiryFamilyConfirmationContent key={inquiry.id} {...props} />;
}

function InquiryFamilyConfirmationContent(props: InquiryFamilyConfirmationProps) {
  const { inquiry } = props;
  const state = useInquiryFamilyConfirmation(props);
  const { formik } = state;
  const families = buildInquiryFamilyReviews(state.candidates);
  const selected = families
    .flatMap((family) => family.parents)
    .find(
      (option) =>
        inquiryFamilyCandidateKey(option.match) === formik.values.source &&
        inquiryFamilyParentKey(option.parent) === formik.values.parent
    );
  const relationship = state.selectedParent?.relationship ?? formik.values.relationship;
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
          title="Check Parent Details"
          maxWidth="sm"
          titleInfo="Check the saved parent and children. Add as Sibling links this inquiry to that family without changing the saved parent."
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
                <Typography variant="body2">
                  Inquiry: <strong>{inquiry.applicantName}</strong>
                </Typography>
                {state.loading ? (
                  <Stack spacing={2} role="status" aria-label="Loading Family Matches">
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                  </Stack>
                ) : state.candidates.length ? (
                  <>
                    <AdmissionInquiryContactMatch
                      matches={state.candidates}
                      phone={state.reviewInput?.guardianPhone ?? ''}
                      email={state.reviewInput?.guardianEmail}
                    />
                    <AdmissionInquiryParentReview
                      families={families}
                      selected={selected}
                      disabled={locked}
                      enteredMobile={state.reviewInput?.guardianPhone}
                      relationship={formik.values.relationship}
                      relationshipError={
                        formik.touched.relationship || formik.submitCount
                          ? formik.errors.relationship
                          : undefined
                      }
                      onRelationshipChange={(value) => formik.setFieldValue('relationship', value)}
                      onSelect={(option) =>
                        formik.setValues({
                          source: inquiryFamilyCandidateKey(option.match),
                          parent: inquiryFamilyParentKey(option.parent),
                          relationship: '',
                        })
                      }
                    />
                  </>
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
                    This inquiry changed. Reload matches and select the parent again.
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
              startIcon={<Iconify icon={GlobalIcons.edit} width={18} />}
              disabled={state.saving}
              onClick={state.requestClose}
            >
              Edit Contact Details
            </Button>
            <LoadingButton
              type="submit"
              size="small"
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.assigned} width={18} />}
              loading={state.saving}
              disabled={locked || !selected || !['father', 'mother'].includes(relationship)}
            >
              Add as Sibling
            </LoadingButton>
          </DialogActions>
        </CustomDialog>
      )}
      <ConfirmDialog
        open={state.discardOpen}
        title="Discard Unsaved Changes?"
        icon="warning"
        content="Your unsaved sibling selection will be lost."
        cancelText="Keep Editing"
        onClose={state.keepEditing}
        disableCancel={state.saving}
        action={
          <Button
            type="button"
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} width={18} />}
            disabled={state.saving}
            onClick={state.close}
          >
            Discard Changes
          </Button>
        }
      />
    </>
  );
}
