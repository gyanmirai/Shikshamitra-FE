'use client';

import type { RootState } from 'src/redux/store';
import type { EsiComponentTreatment } from 'src/redux/hr/statutory-scheme-api';
import type { EsiConfigurationSettings } from 'src/redux/hr/esi-configuration-api';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { hrPermissions } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetEsiComponentTreatmentsQuery } from 'src/redux/hr/statutory-scheme-api';
import {
  useGetEsiConfigurationQuery,
  useSaveEsiConfigurationMutation,
} from 'src/redux/hr/esi-configuration-api';
import {
  Alert,
  Stack,
  Button,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { configurationValues, configurationPayload } from './esi-configuration-form';

export const esiTreatmentLabels: Record<EsiComponentTreatment['treatment'], string> = {
  Unclassified: 'Needs review',
  Included: 'Included in ESIC wages',
  SpecifiedExclusion: 'Specified statutory exclusion',
  OtherExclusion: 'Other statutory exclusion',
  InKind: 'Benefit in kind',
};

type Props = {
  component?: { id: string; name: string };
  initialMonth?: string;
  initialComponentId?: string;
  onSaved?: () => void;
  onClose: () => void;
};

export function EarningEsiTreatmentDialog({
  component,
  initialMonth,
  initialComponentId,
  onSaved,
  onClose,
}: Props) {
  const query = useGetEsiConfigurationQuery();
  if (query.data?.current)
    return (
      <TreatmentForm
        {...{ component, initialMonth, initialComponentId, onSaved, onClose }}
        settings={query.data}
      />
    );
  return (
    <CustomDialog
      open
      title={component ? `ESIC treatment - ${component.name}` : 'ESIC wage treatment'}
      handleClose={onClose}
      hasForm={false}
      maxWidth="sm"
    >
      <DialogScrollContent>
        {query.isError || query.data ? (
          <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
            ESIC settings could not be loaded.
          </Alert>
        ) : (
          <Skeleton height={120} aria-label="Loading ESIC treatment" />
        )}
      </DialogScrollContent>
    </CustomDialog>
  );
}

function TreatmentForm({
  component,
  initialMonth,
  initialComponentId,
  onSaved,
  onClose,
  settings,
}: Props & { settings: EsiConfigurationSettings }) {
  // Keep the reviewed version while edits or a background refetch are in progress.
  const [reviewedSettings] = useState(settings);
  const [month, setMonth] = useState(
    initialMonth && /^\d{4}-(0[1-9]|1[0-2])$/.test(initialMonth)
      ? initialMonth
      : settings.suggestedEffectiveMonth
  );
  const [componentId, setComponentId] = useState(component?.id ?? initialComponentId ?? '');
  const [treatment, setTreatment] = useState<EsiComponentTreatment['treatment'] | null>(null);
  const [error, setError] = useState('');
  const request = useRef<{ signature: string; key: string } | null>(null);
  const saving = useRef(false);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const actions = hrPermissions.payroll.settings.statutorySchemeActions;
  const canEdit =
    settings.hasSchoolWideScope &&
    [actions.edit, actions.activate, actions.configureCalculation].every((permission) =>
      hasGrantedPermission(permissions, permission)
    );
  const validMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
  const query = useGetEsiComponentTreatmentsQuery(`${month}-01`, { skip: !validMonth });
  const current = query.currentData?.find((item) => item.componentId === componentId);
  const [save, state] = useSaveEsiConfigurationMutation();
  const dirty = treatment !== null && treatment !== current?.treatment;
  const submit = async () => {
    if (
      !canEdit ||
      !current ||
      !dirty ||
      !validMonth ||
      saving.current ||
      state.isLoading ||
      query.isFetching ||
      query.isError
    )
      return;
    saving.current = true;
    const payload = configurationPayload(
      configurationValues({ ...reviewedSettings, suggestedEffectiveMonth: month })
    );
    payload.treatments = [{ componentId: current.componentId, treatment: treatment! }];
    const signature = JSON.stringify(payload);
    if (request.current?.signature !== signature)
      request.current = { signature, key: crypto.randomUUID() };
    setError('');
    try {
      await save({ ...payload, idempotencyKey: request.current.key }).unwrap();
      shikshaMitraToast.success({ message: `ESIC treatment saved for ${current.componentName}.` });
      onSaved?.();
      onClose();
    } catch (cause) {
      setError(
        parseApiProblemDetail(cause).errorCode === 'ESI_PREVIEW_STALE'
          ? 'ESIC settings changed. Close and reopen this dialog to review the latest version.'
          : 'ESIC treatment could not be saved. Your changes are preserved. Try again.'
      );
    } finally {
      saving.current = false;
    }
  };
  return (
    <CustomDialog
      open
      title={component ? `ESIC treatment - ${component.name}` : 'ESIC wage treatment'}
      maxWidth="sm"
      hasForm={false}
      handleClose={onClose}
      disableClose={state.isLoading}
      hasUnsavedChanges={dirty}
    >
      <DialogScrollContent onSubmit={submit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {!canEdit && (
            <HrNotice role="alert" severity="info">
              School-wide HR scope and ESIC editing access are required.
            </HrNotice>
          )}
          <TextField
            label="Changes effective from"
            type="month"
            size="small"
            fullWidth
            value={month}
            disabled={!canEdit || state.isLoading}
            error={!validMonth}
            helperText={!validMonth ? 'Choose an effective month.' : undefined}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(event) => {
              setMonth(event.target.value);
              setTreatment(null);
              setError('');
            }}
          />
          {!component && query.currentData && (
            <TextField
              select
              label="Earning"
              size="small"
              fullWidth
              value={componentId}
              disabled={state.isLoading || query.isFetching}
              onChange={(event) => {
                setComponentId(event.target.value);
                setTreatment(null);
                setError('');
              }}
            >
              {query.currentData.map((item) => (
                <MenuItem key={item.componentId} value={item.componentId}>
                  {item.componentName} · {esiTreatmentLabels[item.treatment]}
                </MenuItem>
              ))}
            </TextField>
          )}
          {query.isError ? (
            <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
              ESIC treatment could not be loaded.
            </Alert>
          ) : query.isFetching ? (
            <Skeleton height={48} />
          ) : current ? (
            <TextField
              select
              label="ESIC wage treatment"
              size="small"
              fullWidth
              value={treatment ?? current.treatment}
              disabled={!canEdit || state.isLoading}
              onChange={(event) =>
                setTreatment(event.target.value as EsiComponentTreatment['treatment'])
              }
            >
              {Object.entries(esiTreatmentLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            validMonth &&
            componentId && (
              <Alert severity="warning">This earning is unavailable for the selected month.</Alert>
            )
          )}
          <Typography variant="body2" color="text.secondary">
            Classify the nature of this earning. ESIC rules determine the final wage amount.
            Earnings needing review must be classified before payroll can be locked.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Locked payroll and issued payslips stay unchanged.
          </Typography>
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button onClick={onClose} disabled={state.isLoading}>
          Cancel
        </Button>
        {canEdit && (
          <Button
            variant="contained"
            onClick={submit}
            disabled={
              !dirty ||
              !validMonth ||
              !current ||
              query.isFetching ||
              query.isError ||
              state.isLoading
            }
          >
            {state.isLoading ? 'Saving…' : 'Save treatment'}
          </Button>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
