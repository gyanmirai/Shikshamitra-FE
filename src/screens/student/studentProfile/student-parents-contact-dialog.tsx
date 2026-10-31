import type { RootState } from 'src/redux/store';
import type { RecordSnapshot } from 'src/redux/student/records/student-record-changes-api';
import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import * as Yup from 'yup';
import { getIn, useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import PhoneInput from 'src/components/phone-input';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, Skeleton, TextField, DialogActions } from '@mui/material';
import {
  useGetStudentRecordSnapshotQuery,
  useCreateStudentRecordChangeMutation,
} from 'src/redux/student/records/student-record-changes-api';

import {
  contactDraft,
  contactLabels,
  hasSavedAdult,
  contactPayload,
  contactRelationships,
} from './student-parents-contact-model';

import type { ContactRelationship, ParentsContactDraft } from './student-parents-contact-model';

function useCanManageContacts(details: StudentRecordDetails) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const family = details.structuredSections.find((section) => section.section === 'family');
  return (
    details.recordsAccess === 'Full' &&
    family?.canEdit === true &&
    !family.isMasked &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.View') &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.Add')
  );
}

export function StudentParentsContactDialog({
  studentId,
  details,
  onClose,
  onSubmitted,
}: {
  studentId: string;
  details: StudentRecordDetails;
  onClose: () => void;
  onSubmitted: (message: string) => void;
}) {
  const canManage = useCanManageContacts(details);
  const snapshot = useGetStudentRecordSnapshotQuery(
    { studentId, section: 'family' },
    { skip: !canManage, refetchOnMountOrArgChange: true }
  );
  const [session, setSession] = useState(0);
  const [lastSnapshot, setLastSnapshot] = useState<RecordSnapshot | null>(null);
  useEffect(() => {
    if (snapshot.currentData && !snapshot.isFetching && !snapshot.isError)
      setLastSnapshot(snapshot.currentData);
  }, [snapshot.currentData, snapshot.isFetching, snapshot.isError]);
  const status = snapshot.error && 'status' in snapshot.error ? snapshot.error.status : undefined;
  const denied = !canManage || status === 401 || status === 403;
  const reportedError = useRef<unknown>(undefined);
  useEffect(() => {
    if (!snapshot.isError) {
      reportedError.current = undefined;
      return;
    }
    if (denied || reportedError.current === snapshot.error) return;
    reportedError.current = snapshot.error;
    shikshaMitraToast.error({
      message: lastSnapshot
        ? 'Current contacts could not be refreshed. Your draft has been kept. Close and reopen Manage contacts to load current details.'
        : 'Contacts could not be loaded. Open Manage contacts again to try.',
    });
    if (!lastSnapshot) onClose();
  }, [snapshot.isError, snapshot.error, denied, lastSnapshot, onClose]);
  if (!denied && lastSnapshot)
    return (
      <ParentsContactForm
        key={`${studentId}-${session}`}
        studentId={studentId}
        details={details}
        snapshot={lastSnapshot}
        readError={snapshot.isError}
        onClose={onClose}
        onSubmitted={onSubmitted}
        onReload={async () => {
          const current = await snapshot.refetch().unwrap();
          setLastSnapshot(current);
          setSession((value) => value + 1);
        }}
      />
    );
  if (!denied && snapshot.isError) return null;
  return (
    <CustomDialog
      open
      title="Manage Contacts"
      titleInfo="Update saved parents and the main school contact through Records Changes & Approvals."
      handleClose={onClose}
      hasForm={false}
      guardUnsavedChanges={false}
    >
      <DialogScrollContent>
        {denied ? (
          <Alert severity="info">
            Parents and contacts are not available with your current access.
          </Alert>
        ) : (
          <Stack aria-label="Loading current contacts" spacing={1}>
            <Skeleton height={50} />
            <Skeleton height={100} />
          </Stack>
        )}
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

function ParentsContactForm({
  studentId,
  details,
  snapshot: loadedSnapshot,
  onClose,
  onSubmitted,
  onReload,
  readError,
}: {
  studentId: string;
  details: StudentRecordDetails;
  snapshot: RecordSnapshot;
  onClose: () => void;
  onSubmitted: (message: string) => void;
  onReload: () => Promise<void>;
  readError: boolean;
}) {
  const [snapshot] = useState(loadedSnapshot);
  const [clientKey] = useState(() => crypto.randomUUID());
  const [mainContactChosen, setMainContactChosen] = useState(
    Boolean(snapshot.data.mainContactRelationship)
  );
  const [stale, setStale] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [pendingGuardian, setPendingGuardian] = useState(false);
  const [submit, request] = useCreateStudentRecordChangeMutation();
  const canManage = useCanManageContacts(details);
  const router = useRouter();
  const formElement = useRef<HTMLFormElement | null>(null);
  const initial = contactDraft(snapshot.data);
  const validationSchema = Yup.object({
    reason: Yup.string()
      .trim()
      .min(3, 'Explain the requested change.')
      .max(2000)
      .required('Enter a reason.'),
    mainContactRelationship: Yup.string()
      .required('Choose the main school contact.')
      .test('saved-contact', 'Choose an available contact.', (value, context) =>
        Boolean(value && context.parent[value]?.enabled)
      ),
    guardianRelationship: Yup.string()
      .trim()
      .max(128)
      .test(
        'guardian-relationship',
        'Enter the guardian relationship.',
        (value, context) =>
          !context.parent.guardian.enabled ||
          hasSavedAdult(snapshot.data, 'guardian') ||
          Boolean(value)
      ),
    ...Object.fromEntries(
      contactRelationships.map((relationship) => [
        relationship,
        Yup.object({
          enabled: Yup.boolean(),
          fullName: Yup.string()
            .trim()
            .max(256)
            .when('enabled', {
              is: true,
              then: (schema) =>
                hasSavedAdult(snapshot.data, relationship)
                  ? schema
                  : schema.required('Enter the contact name.'),
            }),
          email: Yup.string()
            .trim()
            .when('enabled', {
              is: true,
              then: (schema) => schema.email('Enter a valid email.').max(256),
            }),
          contactNo: Yup.string().test(
            'phone',
            'Enter a valid 10-digit mobile number.',
            (value, context) => {
              if (!context.parent.enabled || !value || value === initial[relationship].contactNo)
                return true;
              return /^(?:91)?\d{10}$/.test(value.replace(/\D/g, ''));
            }
          ),
        }),
      ])
    ),
  });
  const form = useFormik<ParentsContactDraft>({
    initialValues: initial,
    validationSchema,
    onSubmit: async (values) => {
      if (
        !canManage ||
        readError ||
        request.isLoading ||
        stale ||
        loadedSnapshot.snapshot !== snapshot.snapshot
      )
        return;
      if (
        values.mainContactRelationship === 'guardian' &&
        initial.mainContactRelationship !== 'guardian' &&
        !values.guardianResponsibilityConfirmed
      ) {
        setPendingGuardian(true);
        return;
      }
      try {
        const change = await submit({
          studentId,
          section: 'family',
          clientKey,
          reason: values.reason.trim(),
          expectedSnapshot: snapshot.snapshot,
          payload: contactPayload(snapshot.data, values),
        }).unwrap();
        const message =
          change.status === 'Applied'
            ? 'Parents and contact details updated.'
            : 'Contact change submitted for review.';
        shikshaMitraToast.success({ message });
        form.resetForm({ values });
        onSubmitted(message);
      } catch (error) {
        const code = (error as { data?: { error?: { code?: string } } })?.data?.error?.code;
        if (code?.includes('StaleSnapshot')) {
          setStale(true);
        } else
          shikshaMitraToast.error({
            message:
              'The contact change could not be submitted. Your draft has been kept. Review the details and submit again.',
          });
      }
    },
  });
  const busy = form.isSubmitting || request.isLoading || reloading;
  useEffect(() => {
    if (!canManage || readError || stale || loadedSnapshot.snapshot !== snapshot.snapshot)
      setPendingGuardian(false);
  }, [canManage, readError, stale, loadedSnapshot.snapshot, snapshot.snapshot]);
  const guard = useUnsavedNavigation(form.dirty, {
    push: router.push,
    blockNavigation: busy,
    renderConfirmation: (keep, discard) => (
      <ConfirmDialog
        open
        title="Discard Unsaved Changes?"
        content="Your unsaved contact changes will be discarded."
        icon="warning"
        onClose={keep}
        cancelText="Keep editing"
        action={
          <Button
            color="error"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={discard}
          >
            Discard changes
          </Button>
        }
      />
    ),
  });
  const close = () => guard.requestNavigation(onClose);
  const fieldError = (path: string): string | undefined =>
    getIn(form.touched, path) || form.submitCount > 0 ? getIn(form.errors, path) : undefined;
  useEffect(() => {
    if (form.submitCount > 0 && !form.isSubmitting && !form.isValid)
      formElement.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [form.submitCount, form.isSubmitting, form.isValid]);
  const defaultMainContact = (enabled: ContactRelationship[]): ContactRelationship | '' => {
    const parents = enabled.filter((item) => item !== 'guardian');
    return parents.length === 1
      ? parents[0]
      : parents.length === 0 && enabled.includes('guardian')
        ? 'guardian'
        : '';
  };
  const add = (relationship: ContactRelationship) => {
    form.setFieldValue(`${relationship}.enabled`, true);
    if (!mainContactChosen) {
      const enabled = contactRelationships.filter(
        (item) => item === relationship || form.values[item].enabled
      );
      form.setFieldValue('mainContactRelationship', defaultMainContact(enabled));
    }
  };
  const removeNewContact = (relationship: ContactRelationship) => {
    const remaining = contactRelationships.filter(
      (item) => item !== relationship && form.values[item].enabled
    );
    if (form.values.mainContactRelationship === relationship) setMainContactChosen(false);
    form.setValues({
      ...form.values,
      guardianResponsibilityConfirmed: false,
      [relationship]: initial[relationship],
      guardianRelationship:
        relationship === 'guardian'
          ? initial.guardianRelationship
          : form.values.guardianRelationship,
      mainContactRelationship:
        !mainContactChosen || form.values.mainContactRelationship === relationship
          ? defaultMainContact(remaining)
          : form.values.mainContactRelationship,
    });
  };
  return (
    <>
      <CustomDialog
        open
        title="Manage Contacts"
        titleInfo="Changes follow school approval rules. Choosing the main school contact does not grant app access."
        handleClose={close}
        guardUnsavedChanges={false}
        disableClose={busy}
        hasForm={false}
        maxWidth="sm"
      >
        <Box
          component="form"
          ref={formElement}
          onSubmit={form.handleSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}
        >
          <DialogScrollContent>
            <Stack spacing={2}>
              {!canManage && (
                <Alert severity="info">
                  Your access to change contacts is no longer available.
                </Alert>
              )}
              {(stale || loadedSnapshot.snapshot !== snapshot.snapshot) && (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      size="small"
                      disabled={busy}
                      onClick={() =>
                        guard.requestNavigation(async () => {
                          setReloading(true);
                          try {
                            await onReload();
                          } catch {
                            setReloading(false);
                          }
                        })
                      }
                    >
                      Reload current contacts
                    </Button>
                  }
                >
                  These contacts changed while you were editing. Reload current contacts and review
                  before submitting.
                </Alert>
              )}
              <Box
                component="fieldset"
                disabled={busy || !canManage}
                sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
              >
                <Stack spacing={2}>
                  {contactRelationships.map((relationship) =>
                    form.values[relationship].enabled ? (
                      <FormSectionCard
                        key={relationship}
                        icon={GlobalIcons.family}
                        title={
                          relationship === 'guardian'
                            ? 'Other Guardian'
                            : contactLabels[relationship]
                        }
                        descriptionTooltip={`Saved ${contactLabels[relationship].toLowerCase()} name and contact details. App access is managed separately.`}
                        action={
                          !initial[relationship].enabled ? (
                            <Button
                              type="button"
                              size="small"
                              color="inherit"
                              startIcon={<Iconify icon={GlobalIcons.cancel} />}
                              onClick={() => removeNewContact(relationship)}
                            >
                              Remove {contactLabels[relationship].toLowerCase()}
                            </Button>
                          ) : undefined
                        }
                      >
                        <ShakingTextField error={Boolean(fieldError(`${relationship}.fullName`))}>
                          <TextField
                            {...form.getFieldProps(`${relationship}.fullName`)}
                            label={`${contactLabels[relationship]} name`}
                            required={!hasSavedAdult(snapshot.data, relationship)}
                            fullWidth
                            size="small"
                            error={Boolean(fieldError(`${relationship}.fullName`))}
                            helperText={fieldError(`${relationship}.fullName`)}
                          />
                        </ShakingTextField>
                        {relationship === 'guardian' && (
                          <ShakingTextField error={Boolean(fieldError('guardianRelationship'))}>
                            <TextField
                              {...form.getFieldProps('guardianRelationship')}
                              label="Relationship to student"
                              required={!hasSavedAdult(snapshot.data, 'guardian')}
                              fullWidth
                              size="small"
                              error={Boolean(fieldError('guardianRelationship'))}
                              helperText={fieldError('guardianRelationship')}
                            />
                          </ShakingTextField>
                        )}
                        <PhoneInput
                          name={`${relationship}.contactNo`}
                          label={`${contactLabels[relationship]} mobile`}
                          value={form.values[relationship].contactNo}
                          onChange={(value) =>
                            form.setFieldValue(`${relationship}.contactNo`, value ?? '')
                          }
                          onBlur={form.handleBlur}
                          error={Boolean(fieldError(`${relationship}.contactNo`))}
                          helperText={fieldError(`${relationship}.contactNo`)}
                        />
                        <TextField
                          {...form.getFieldProps(`${relationship}.email`)}
                          label={`${contactLabels[relationship]} email`}
                          type="email"
                          fullWidth
                          size="small"
                          error={Boolean(fieldError(`${relationship}.email`))}
                          helperText={fieldError(`${relationship}.email`)}
                        />
                      </FormSectionCard>
                    ) : null
                  )}
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {contactRelationships
                      .filter((relationship) => !form.values[relationship].enabled)
                      .map((relationship) => (
                        <Button
                          key={relationship}
                          type="button"
                          size="small"
                          color="inherit"
                          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                          onClick={() => add(relationship)}
                        >
                          {relationship === 'guardian'
                            ? 'Add other guardian'
                            : `Add ${relationship}`}
                        </Button>
                      ))}
                  </Stack>
                  <FormSectionCard
                    icon={GlobalIcons.family}
                    title="Main School Contact"
                    descriptionTooltip="Choose the adult the school should contact. App access requires its separate review and confirmation."
                  >
                    <ShakingTextField error={Boolean(fieldError('mainContactRelationship'))}>
                      <CustomSelect
                        name="mainContactRelationship"
                        label="Main school contact"
                        disabled={busy || !canManage}
                        required
                        fullWidth
                        size="small"
                        value={form.values.mainContactRelationship}
                        onChange={(value) => {
                          if (
                            value === 'guardian' &&
                            initial.mainContactRelationship !== 'guardian'
                          ) {
                            setPendingGuardian(true);
                            return;
                          }
                          setMainContactChosen(true);
                          form.setFieldValue('mainContactRelationship', value);
                          form.setFieldValue('guardianResponsibilityConfirmed', false, false);
                        }}
                        onBlur={form.handleBlur}
                        options={contactRelationships
                          .filter((relationship) => form.values[relationship].enabled)
                          .map((relationship) => ({
                            value: relationship,
                            label: `${contactLabels[relationship]}${form.values[relationship].fullName ? ` — ${form.values[relationship].fullName}` : ''}`,
                          }))}
                        error={Boolean(fieldError('mainContactRelationship'))}
                        helperText={fieldError('mainContactRelationship')}
                      />
                    </ShakingTextField>
                    <ShakingTextField error={Boolean(fieldError('reason'))}>
                      <TextField
                        {...form.getFieldProps('reason')}
                        label="Reason for change"
                        required
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        error={Boolean(fieldError('reason'))}
                        helperText={fieldError('reason')}
                      />
                    </ShakingTextField>
                  </FormSectionCard>
                </Stack>
              </Box>
            </Stack>
          </DialogScrollContent>
          <DialogActions>
            <Button
              type="button"
              size="small"
              color="inherit"
              variant="outlined"
              disabled={busy}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              color="inherit"
              variant="contained"
              disabled={
                !canManage ||
                readError ||
                stale ||
                loadedSnapshot.snapshot !== snapshot.snapshot ||
                !form.dirty
              }
              loading={busy}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </Button>
          </DialogActions>
        </Box>
      </CustomDialog>
      {guard.confirmation}
      <ConfirmDialog
        open={pendingGuardian}
        title="Confirm Guardian Responsibility"
        icon="warning"
        content="Confirm that neither parent is handling school-contact responsibility and this guardian will be the primary contact."
        cancelText="Cancel"
        disableBackdropClick
        disableCancel={busy}
        disableEscapeKeyDown={busy}
        onClose={() => {
          if (!busy) setPendingGuardian(false);
        }}
        action={
          <Button
            type="button"
            size="small"
            variant="contained"
            disabled={busy}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={() => {
              if (
                busy ||
                !canManage ||
                readError ||
                stale ||
                loadedSnapshot.snapshot !== snapshot.snapshot
              )
                return;
              setMainContactChosen(true);
              form.setValues((current) => ({
                ...current,
                mainContactRelationship: 'guardian',
                guardianResponsibilityConfirmed: true,
              }));
              setPendingGuardian(false);
            }}
          >
            Confirm guardian
          </Button>
        }
      />
    </>
  );
}
