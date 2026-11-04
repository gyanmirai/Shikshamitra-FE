'use client';

import { useRef, useEffect } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Alert, Button, Skeleton, Typography, DialogActions } from '@mui/material';

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
  const contentRef = useRef<HTMLDivElement>(null);
  const lastFocusedSubmit = useRef(0);
  useEffect(() => {
    if (!formik.submitCount) {
      lastFocusedSubmit.current = 0;
      return;
    }
    if (
      formik.isValidating ||
      lastFocusedSubmit.current === formik.submitCount ||
      !Object.keys(formik.errors).length
    )
      return;
    const invalid = contentRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]:not([aria-hidden="true"]):not(:disabled):not([aria-disabled="true"])'
    );
    if (!invalid) return;
    lastFocusedSubmit.current = formik.submitCount;
    invalid.focus();
    invalid.scrollIntoView?.({ block: 'nearest' });
  }, [formik.submitCount, formik.isValidating, formik.errors]);
  const fieldError = (name: keyof typeof formik.values) =>
    formik.touched[name] || formik.submitCount > 0 ? formik.errors[name] : undefined;
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
          title="Confirm Sibling Family"
          titleInfo="Choose an Existing Child and the Saved Father or Mother. Matching Contact Details Are Suggestions; Staff Must Confirm the Family."
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
            <Box ref={contentRef}>
              <FormBusyRegion busy={state.saving} label="Confirming Sibling Family…">
                <FormSectionCard
                  title="Sibling Family"
                  icon={GlobalIcons.family}
                  descriptionTooltip="This Confirms Only This Inquiry. Saved Parent Details and Existing Sibling Access Stay Unchanged."
                >
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    For {inquiry.applicantName} · {inquiry.inquiryNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available common parent details will fill the registration form. Missing details
                    remain normal fields.
                  </Typography>
                  {state.loading ? (
                    <Stack spacing={2} role="status" aria-label="Loading Family Matches">
                      <Skeleton variant="rounded" height={56} />
                      <Skeleton variant="rounded" height={56} />
                    </Stack>
                  ) : state.candidates.length ? (
                    <Stack spacing={2}>
                      <ShakingTextField error={Boolean(fieldError('source'))}>
                        <CustomSelect
                          required
                          fullWidth
                          size="small"
                          name="familySource"
                          label="Existing Child"
                          value={formik.values.source}
                          disabled={locked}
                          options={state.candidates.map((candidate) => ({
                            value: inquiryFamilyCandidateKey(candidate),
                            label: `${candidate.applicantName}${candidate.existingInquiryNumber ? ` · ${candidate.existingInquiryNumber}` : ''}`,
                          }))}
                          onBlur={() => formik.setFieldTouched('source', true)}
                          onChange={(value) =>
                            formik.setValues({
                              source: String(value),
                              parent: '',
                              relationship: '',
                            })
                          }
                          error={Boolean(fieldError('source'))}
                          helperText={fieldError('source')}
                        />
                      </ShakingTextField>
                      <ShakingTextField error={Boolean(fieldError('parent'))}>
                        <CustomSelect
                          required
                          fullWidth
                          size="small"
                          name="savedFamilyParent"
                          label="Saved Parent"
                          value={formik.values.parent}
                          disabled={locked || !state.selectedSource}
                          options={(state.selectedSource?.parents ?? []).map((parent) => ({
                            value: inquiryFamilyParentKey(parent),
                            label: `${parent.relationship === 'father' ? 'Father' : parent.relationship === 'mother' ? 'Mother' : 'Parent'} · ${parent.name}`,
                          }))}
                          onBlur={() => formik.setFieldTouched('parent', true)}
                          onChange={(value) =>
                            formik.setValues((current) => ({
                              ...current,
                              parent: String(value),
                              relationship: '',
                            }))
                          }
                          error={Boolean(fieldError('parent'))}
                          helperText={fieldError('parent')}
                        />
                      </ShakingTextField>
                      {state.selectedParent && !state.selectedParent.relationship && (
                        <ShakingTextField error={Boolean(fieldError('relationship'))}>
                          <CustomSelect
                            required
                            fullWidth
                            size="small"
                            name="savedParentRelationship"
                            label="Relationship"
                            value={formik.values.relationship}
                            disabled={locked}
                            options={[
                              { value: 'father', label: 'Father' },
                              { value: 'mother', label: 'Mother' },
                            ]}
                            onBlur={() => formik.setFieldTouched('relationship', true)}
                            onChange={(value) =>
                              formik.setFieldValue('relationship', String(value))
                            }
                            error={Boolean(fieldError('relationship'))}
                            helperText={fieldError('relationship')}
                          />
                        </ShakingTextField>
                      )}
                    </Stack>
                  ) : (
                    !state.requestError && (
                      <Typography variant="body2" color="text.secondary">
                        No available family matches were found for this inquiry. Continue manual
                        entry or reload matches after the source details are saved.
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
                  {!state.loading && (
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
                </FormSectionCard>
              </FormBusyRegion>
            </Box>
          </DialogScrollContent>
          <DialogActions>
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
              startIcon={<Iconify icon={GlobalIcons.assigned} width={18} />}
              loading={state.saving}
              disabled={locked || !state.candidates.length}
            >
              Confirm Family
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
