import type { PayslipSettings } from 'src/redux/hr/payslip-api';

import { useFormik } from 'formik';
import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Stack, Alert, Button, Skeleton, Typography } from '@mui/material';
import {
  useGetPayslipSettingsQuery,
  useSavePayslipSettingsMutation,
  defaultSalaryDocumentPresentation,
} from 'src/redux/hr/payslip-api';

import { payslipActionError } from './payslip-action-error';
import PayslipSettingsFields from './payslip-settings-fields';
import PayslipSettingsPreview from './payslip-settings-preview';

export default function PayslipSettingsForm({ canEdit }: { canEdit: boolean }) {
  const query = useGetPayslipSettingsQuery();
  if (query.data)
    return (
      <>
        {query.isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Settings could not be refreshed. Your changes have been kept.
          </Alert>
        )}
        <SettingsForm
          initial={query.data}
          readRequestId={query.requestId}
          canApplyRead={!query.isFetching && !query.isError}
          canEdit={canEdit}
        />
      </>
    );
  if (query.isError)
    return (
      <Alert
        severity="error"
        action={
          <Button size="small" onClick={() => query.refetch()}>
            Retry
          </Button>
        }
      >
        Settings could not be loaded.
      </Alert>
    );
  return (
    <Stack sx={{ flex: 1, minHeight: 0 }} aria-busy="true" aria-label="Loading payslip settings">
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 1.5, sm: 2 },
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(320px, 0.85fr) minmax(0, 1.15fr)',
          },
          alignItems: 'start',
        }}
      >
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={280} />
          <Skeleton variant="rounded" height={160} />
        </Stack>
        <Skeleton variant="rounded" sx={{ aspectRatio: '210 / 297', height: 'auto' }} />
      </Box>
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{ flexShrink: 0, px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}
      >
        <Button disabled size="small">
          Cancel
        </Button>
        <Button disabled size="small">
          Save
        </Button>
      </Stack>
    </Stack>
  );
}

function SettingsForm({
  initial,
  readRequestId,
  canApplyRead,
  canEdit,
}: {
  initial: PayslipSettings;
  readRequestId?: string;
  canApplyRead: boolean;
  canEdit: boolean;
}) {
  const router = useRouter();
  const baseline = useRef(initial);
  const observedInitial = useRef(initial);
  const latestInitial = useRef(initial);
  latestInitial.current = initial;
  const latestReadRequestId = useRef(readRequestId);
  latestReadRequestId.current = readRequestId;
  const ignoredReadRequestId = useRef<string | undefined>(undefined);
  const [save, saving] = useSavePayslipSettingsMutation();
  const [error, setError] = useState<string | null>(null);
  const request = useRef<{ payload: string; key: string } | null>(null);
  const form = useFormik({
    initialValues: initial,
    onSubmit: async (values, helpers) => {
      if (!canEdit || saving.isLoading) return;
      const settings = {
        presentation: values.presentation,
        automaticEmail: values.automaticEmail,
        concurrencyStamp: values.concurrencyStamp,
      };
      const payload = JSON.stringify(settings);
      if (request.current?.payload !== payload)
        request.current = { payload, key: crypto.randomUUID() };
      setError(null);
      try {
        const saved = await save({ ...settings, idempotencyKey: request.current.key }).unwrap();
        baseline.current = saved;
        // A refresh observed before this write was acknowledged cannot supersede it.
        observedInitial.current = latestInitial.current;
        // The same protection applies if that already-started read arrives later.
        ignoredReadRequestId.current = latestReadRequestId.current;
        helpers.resetForm({ values: saved });
        request.current = null;
        shikshaMitraToast.success({ message: 'Payslip and statement settings saved.' });
      } catch (failure) {
        setError(payslipActionError(failure, 'Settings could not be saved. Try again.'));
      }
    },
  });
  const presentation = form.values.presentation ?? defaultSalaryDocumentPresentation;
  const updatePresentation = (key: keyof typeof presentation, value: unknown) =>
    form.setFieldValue('presentation', { ...presentation, [key]: value });
  const { dirty, isSubmitting, resetForm } = form;
  useEffect(() => {
    if (isSubmitting || !canApplyRead || observedInitial.current === initial) return;
    observedInitial.current = initial;
    if (readRequestId && readRequestId === ignoredReadRequestId.current) return;
    baseline.current = initial;
    if (!dirty) resetForm({ values: initial });
  }, [initial, readRequestId, canApplyRead, dirty, isSubmitting, resetForm]);
  const guard = useUnsavedNavigation(form.dirty, {
    push: router.push,
    blockNavigation: saving.isLoading || form.isSubmitting,
  });
  return (
    <>
      <Stack
        component="form"
        sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}
        onSubmit={form.handleSubmit}
        noValidate
      >
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 1.5, sm: 2 } }}>
          <FormBusyRegion
            busy={saving.isLoading || form.isSubmitting}
            label="Saving payslip settings"
          >
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <Box role="status">
                <Typography variant="caption" color="text.secondary">
                  {form.dirty
                    ? 'Unsaved changes | Preview reflects your draft'
                    : 'Saved settings | Changes apply to new documents'}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    lg: 'minmax(320px, 0.85fr) minmax(0, 1.15fr)',
                  },
                  gap: 2,
                  alignItems: 'start',
                }}
              >
                <PayslipSettingsFields
                  initial={initial}
                  presentation={presentation}
                  automaticEmail={form.values.automaticEmail}
                  disabled={!canEdit || saving.isLoading || form.isSubmitting}
                  update={updatePresentation}
                  onEmailChange={(checked) => form.setFieldValue('automaticEmail', checked)}
                />
                <Box sx={{ minWidth: 0, position: { lg: 'sticky' }, top: 0 }}>
                  <PayslipSettingsPreview
                    presentation={presentation}
                    brandingKey={JSON.stringify([
                      initial.schoolName,
                      initial.schoolAddress,
                      initial.presentationVersionId,
                      readRequestId,
                    ])}
                  />
                </Box>
              </Box>
            </Stack>
          </FormBusyRegion>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{
            flexShrink: 0,
            bgcolor: 'background.paper',
            px: { xs: 1.5, sm: 2 },
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            flexWrap: 'wrap',
            rowGap: 1,
          }}
        >
          <Button
            size="small"
            sx={{ mr: 'auto' }}
            disabled={!canEdit || saving.isLoading || form.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            onClick={() => {
              form.setFieldValue('presentation', {
                ...defaultSalaryDocumentPresentation,
                statementColumns: [],
                registerColumns: [],
              });
              form.setFieldValue('automaticEmail', false);
              request.current = null;
              setError(null);
            }}
          >
            Reset defaults
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            disabled={!canEdit || saving.isLoading || form.isSubmitting || !form.dirty}
            onClick={() =>
              guard.requestNavigation(() => {
                form.resetForm({ values: baseline.current });
                request.current = null;
                setError(null);
              })
            }
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            loading={saving.isLoading || form.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            disabled={!canEdit || saving.isLoading || form.isSubmitting || !form.dirty}
          >
            Save
          </Button>
        </Stack>
      </Stack>
      {guard.confirmation}
    </>
  );
}
