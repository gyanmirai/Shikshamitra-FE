import type { ButtonProps } from '@mui/material/Button';
import type { AdmissionApplicationForm } from 'src/redux/student/admissions/admission-applications-api';

import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { readAdmissionFormValue } from '../admission-visibility-rules';
import { AdmissionApplicationPrintDialog } from './admission-application-print-dialog';

function PrintDecisionActions({
  disabled,
  loading,
  size = 'small',
  canSave,
  onUseSaved,
  onSave,
}: {
  disabled?: boolean;
  loading?: boolean;
  size?: ButtonProps['size'];
  canSave: boolean;
  onUseSaved: () => void;
  onSave: () => void;
}) {
  return (
    <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
      <Button
        type="button"
        size={size}
        variant="outlined"
        disabled={disabled || loading}
        onClick={onUseSaved}
        startIcon={<Iconify icon={GlobalIcons.printer} />}
      >
        Use saved details
      </Button>
      {canSave && (
        <Button
          type="button"
          size={size}
          variant="contained"
          disabled={disabled || loading}
          onClick={onSave}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Save and preview
        </Button>
      )}
    </Stack>
  );
}

export function hasUnsavedAdmissionPrintValues(
  form: AdmissionApplicationForm,
  values: Record<string, string>
) {
  const saved = Object.fromEntries(
    form.values.map((item) => [item.fieldCode, readAdmissionFormValue(item.valueJson)])
  );
  return Object.entries(values).some(([code, value]) => (saved[code] ?? '') !== value);
}

export function AdmissionRuntimePrintActions({
  applicationId,
  form,
  values,
  busy,
  currentStepId,
  onSave,
  canSave = true,
}: {
  applicationId: string;
  form: AdmissionApplicationForm;
  values: Record<string, string>;
  busy: boolean;
  currentStepId?: string | null;
  onSave: () => Promise<boolean>;
  canSave?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const saveInFlight = useRef(false);
  const showPreview = () => {
    setConfirm(false);
    setOpen(true);
  };
  const saveAndPreview = async () => {
    if (saveInFlight.current) return;
    saveInFlight.current = true;
    setSaving(true);
    setSaveFailed(false);
    try {
      if (await onSave()) showPreview();
      else setSaveFailed(true);
    } catch {
      setSaveFailed(true);
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  };
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        disabled={busy || saving}
        startIcon={<Iconify icon={GlobalIcons.printer} />}
        onClick={() => {
          setSaveFailed(false);
          if (hasUnsavedAdmissionPrintValues(form, values)) setConfirm(true);
          else showPreview();
        }}
      >
        Print
      </Button>
      <ConfirmDialog
        open={confirm}
        icon="info"
        title="Print Saved Details?"
        content={
          <Stack spacing={1}>
            <span>
              This form has unsaved changes. Save them before previewing, or print the last saved
              details.
            </span>
            {saveFailed && (
              <Alert severity="error">
                Changes could not be saved. Try again or use the saved details.
              </Alert>
            )}
          </Stack>
        }
        onClose={() => {
          setSaveFailed(false);
          setConfirm(false);
        }}
        bodyBusy={saving}
        action={
          <PrintDecisionActions
            disabled={saving}
            canSave={canSave}
            onUseSaved={showPreview}
            onSave={saveAndPreview}
          />
        }
      />
      {open && (
        <AdmissionApplicationPrintDialog
          applicationId={applicationId}
          initialMode="filled"
          currentStepId={currentStepId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
