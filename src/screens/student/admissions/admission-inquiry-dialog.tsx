'use client';

import type { ReactNode } from 'react';
import type { AdmissionInquirySource } from 'src/redux/student/admissions/admission-inquiries-api';

import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Alert,
  Stack,
  Drawer,
  Button,
  Switch,
  Divider,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import AdmissionRuntimeField from './admission-runtime-field';
import { AdmissionDialogTitle } from './admission-dialog-title';
import { admissionInquirySourceOptions } from './admission-inquiry-model';
import { useAdmissionInquiryDialog } from './use-admission-inquiry-dialog';
import { AdmissionInquiryDuplicateMatches } from './admission-inquiry-duplicate-matches';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdmissionInquiryDialog({ open, ...props }: Props) {
  if (!open) return null;
  return <AdmissionInquiryDrawerContent {...props} />;
}

function AdmissionInquiryDrawerContent({ onClose }: Omit<Props, 'open'>) {
  const router = useRouter();
  const controller = useAdmissionInquiryDialog(onClose);
  const { formik } = controller;
  const fieldErrors = formik.errors.fields as Record<string, string> | undefined;
  const touchedFields = formik.touched.fields as Record<string, boolean> | undefined;
  const validationMessages = collectValidationMessages(formik.errors);
  const hierarchySelected = Boolean(
    formik.values.boardId && formik.values.mediumId && formik.values.standardId
  );

  const changeHierarchy = (field: 'boardId' | 'mediumId' | 'standardId', value: string) => {
    formik.setFieldValue(field, value);
    formik.setFieldValue('offeringId', '');
    formik.setFieldValue('fields', {});
    if (field === 'boardId') {
      formik.setFieldValue('mediumId', '');
      formik.setFieldValue('standardId', '');
    }
    if (field === 'mediumId') formik.setFieldValue('standardId', '');
  };

  return (
    <Drawer
      anchor="right"
      open
      onClose={controller.busy ? undefined : onClose}
      PaperProps={{
        component: 'form',
        onSubmit: formik.handleSubmit,
        sx: {
          width: { xs: 1, sm: 680 },
          maxWidth: 1,
          height: '100dvh',
          display: 'flex',
          overflow: 'hidden',
        },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id="new-inquiry-title" variant="h6" component="div">
            <AdmissionDialogTitle
              title="New inquiry"
              helpText="Capture the family’s admission interest first. The admission cycle is selected automatically from the offering."
              helpLabel="New inquiry information"
            />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select the academic context, then record applicant and guardian details.
          </Typography>
        </Box>
        <IconButton aria-label="Close new inquiry" disabled={controller.busy} onClick={onClose}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      {controller.offeringsLoading && <LinearProgress />}

      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
        {controller.offeringsError && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<Iconify icon="mdi:refresh" />}
                onClick={controller.retryOfferings}
              >
                Retry
              </Button>
            }
          >
            Open admission offerings could not be loaded.
          </Alert>
        )}
        {!controller.offeringsLoading &&
          !controller.offeringsError &&
          controller.boards.length === 0 && (
            <Alert severity="warning">
              No open, ready admission offering is available. Configure and activate an offering in
              Admission Setup before creating an inquiry.
            </Alert>
          )}

        <InquiryFormSection
          title="Admission interest"
          description="The offering determines the admission cycle automatically."
        >
          <ShakingTextField error={Boolean(formik.touched.boardId && formik.errors.boardId)}>
            <TextField
              select
              fullWidth
              required
              size="small"
              label="Board"
              name="boardId"
              value={formik.values.boardId}
              disabled={controller.offeringsLoading || controller.offeringsError}
              error={Boolean(formik.touched.boardId && formik.errors.boardId)}
              helperText={formik.touched.boardId && formik.errors.boardId}
              onBlur={formik.handleBlur}
              onChange={(event) => changeHierarchy('boardId', event.target.value)}
            >
              {controller.boards.map((board) => (
                <MenuItem key={board.id} value={board.id}>
                  {board.name}
                </MenuItem>
              ))}
            </TextField>
          </ShakingTextField>

          <ShakingTextField error={Boolean(formik.touched.mediumId && formik.errors.mediumId)}>
            <TextField
              select
              fullWidth
              required
              size="small"
              label="Medium"
              name="mediumId"
              value={formik.values.mediumId}
              disabled={!formik.values.boardId || controller.offeringsLoading}
              error={Boolean(formik.touched.mediumId && formik.errors.mediumId)}
              helperText={formik.touched.mediumId && formik.errors.mediumId}
              onBlur={formik.handleBlur}
              onChange={(event) => changeHierarchy('mediumId', event.target.value)}
            >
              {controller.mediums.map((medium) => (
                <MenuItem key={medium.id} value={medium.id}>
                  {medium.name}
                </MenuItem>
              ))}
            </TextField>
          </ShakingTextField>

          <ShakingTextField error={Boolean(formik.touched.standardId && formik.errors.standardId)}>
            <TextField
              select
              fullWidth
              required
              size="small"
              label="Class"
              name="standardId"
              value={formik.values.standardId}
              disabled={!formik.values.mediumId || controller.offeringsLoading}
              error={Boolean(formik.touched.standardId && formik.errors.standardId)}
              helperText={formik.touched.standardId && formik.errors.standardId}
              onBlur={formik.handleBlur}
              onChange={(event) => changeHierarchy('standardId', event.target.value)}
            >
              {controller.standards.map((standard) => (
                <MenuItem key={standard.id} value={standard.id}>
                  {standard.name}
                </MenuItem>
              ))}
            </TextField>
          </ShakingTextField>

          {hierarchySelected && (
            <ShakingTextField
              error={Boolean(formik.touched.offeringId && formik.errors.offeringId)}
            >
              <TextField
                select
                fullWidth
                required
                size="small"
                label="Offering"
                name="offeringId"
                value={formik.values.offeringId}
                disabled={controller.offerings.length === 0}
                error={Boolean(formik.touched.offeringId && formik.errors.offeringId)}
                helperText={
                  controller.offerings.length === 0
                    ? 'No open offering matches the selected board, medium, and class.'
                    : formik.touched.offeringId && formik.errors.offeringId
                }
                onBlur={formik.handleBlur}
                onChange={(event) => {
                  formik.setFieldValue('offeringId', event.target.value);
                  formik.setFieldValue('fields', {});
                }}
              >
                {controller.offerings.map((offering) => (
                  <MenuItem key={offering.id} value={offering.id}>
                    {[
                      offering.name || offering.code,
                      offering.code,
                      offering.campusName,
                      offering.admissionCycleName,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </MenuItem>
                ))}
              </TextField>
            </ShakingTextField>
          )}
          {controller.classCapacity && formik.values.offeringId && (
            <Alert severity={controller.classCapacity.isFull ? 'warning' : 'info'}>
              {controller.classCapacity.capacity == null
                ? 'Admission room capacity is not set. Division seats are checked during onboarding. You can continue this inquiry.'
                : `${controller.classCapacity.remainingSeats} of ${controller.classCapacity.capacity} admission room seats available.`}
              {controller.classCapacity.isFull &&
                ' Admission room capacity is full; you can still continue.'}
            </Alert>
          )}
        </InquiryFormSection>

        {controller.sections.map((section) => (
          <InquiryFormSection key={section.id} title={section.name}>
            {section.fields.map((field) => (
              <AdmissionRuntimeField
                key={field.code}
                field={field}
                value={formik.values.fields[field.code] ?? ''}
                disabled={controller.formLoading || field.readOnly}
                error={
                  formik.submitCount > 0 || touchedFields?.[field.code]
                    ? fieldErrors?.[field.code]
                    : undefined
                }
                formValues={formik.values.fields}
                onBlur={() =>
                  formik.setTouched({
                    ...formik.touched,
                    fields: { ...touchedFields, [field.code]: true },
                  })
                }
                onChange={(value) =>
                  formik.setValues((current) => ({
                    ...current,
                    fields: { ...current.fields, [field.code]: value },
                  }))
                }
              />
            ))}
          </InquiryFormSection>
        ))}

        <InquiryFormSection title="Inquiry details">
          <ShakingTextField error={Boolean(formik.touched.source && formik.errors.source)}>
            <TextField
              select
              fullWidth
              required
              size="small"
              name="source"
              label="Source"
              value={formik.values.source}
              disabled={controller.workflowLoading}
              error={Boolean(formik.touched.source && formik.errors.source)}
              helperText={formik.touched.source && formik.errors.source}
              onBlur={formik.handleBlur}
              onChange={(event) =>
                formik.setFieldValue('source', Number(event.target.value) as AdmissionInquirySource)
              }
            >
              {admissionInquirySourceOptions.map((label, index) =>
                controller.allowedSources.includes(index) ? (
                  <MenuItem key={label} value={index}>
                    {label}
                  </MenuItem>
                ) : null
              )}
            </TextField>
          </ShakingTextField>
          {controller.canAutoAcknowledge && (
            <FormControlLabel
              label="Send acknowledgement automatically after saving"
              control={
                <Switch
                  checked={formik.values.sendAcknowledgement}
                  onChange={(_, checked) => formik.setFieldValue('sendAcknowledgement', checked)}
                />
              }
            />
          )}
        </InquiryFormSection>

        <AdmissionInquiryDuplicateMatches
          matches={controller.matches}
          guardianPhone={controller.currentGuardianPhone}
          busy={controller.busy}
          onUseExisting={controller.useExistingFamily}
          onOpenExisting={(inquiryId) => {
            onClose();
            router.push(`${studentPaths.enrollment.inquiries}?inquiryId=${inquiryId}`);
          }}
          onCreateSeparate={controller.createSeparateFamily}
          overrideReason={controller.duplicateOverrideReason}
          onOverrideReasonChange={controller.setDuplicateOverrideReason}
        />
        {controller.requestError && <Alert severity="error">{controller.requestError}</Alert>}
        {formik.submitCount > 0 && validationMessages.length > 0 && (
          <Alert severity="error">
            {validationMessages.map((message) => (
              <div key={message}>{message}</div>
            ))}
          </Alert>
        )}
      </Stack>

      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Button
          size="small"
          variant="outlined"
          disabled={controller.busy}
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          disabled={
            controller.busy ||
            controller.formLoading ||
            controller.workflowLoading ||
            controller.offeringsLoading ||
            controller.offeringsError
          }
          loading={controller.busy}
          startIcon={<Iconify icon="mdi:account-plus-outline" />}
        >
          Create inquiry
        </LoadingButton>
      </Stack>
    </Drawer>
  );
}

function InquiryFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Box component="section" sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 2 }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="subtitle2">{title}</Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {children}
      </Stack>
    </Box>
  );
}

function collectValidationMessages(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return [...new Set(Object.values(value).flatMap(collectValidationMessages))];
}
