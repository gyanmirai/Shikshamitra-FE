import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionFormSystemFieldMetadata } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import { Stack, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { WorkflowRowActions } from 'src/screens/student/admissions/workflow-list/workflow-row-actions';
import { StudentFieldPalette } from 'src/screens/student/admissions/form-dialog/components/student-field-palette';

const preferenceFields: AdmissionFormSystemFieldMetadata[] = [
  ['Preference.Campus', 'Preferred campus', 0],
  ['Preference.TransportRequired', 'Transport needed', 9],
  ['Preference.PickupArea', 'Preferred pickup area', 0],
].map(([key, displayName, fieldType]) => ({
  key: String(key),
  displayName: String(displayName),
  fieldType: fieldType as AdmissionFormSystemFieldMetadata['fieldType'],
  readOnly: false,
  description: '',
}));

export function LifecycleActionsFixture() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const noop = () => undefined;
  return (
    <>
      <FormSectionCard title="Student Field Categories" icon="mdi:form-select">
        <Stack sx={{ width: 340, maxWidth: 1, height: 400 }} spacing={1}>
          <StudentFieldPalette fields={preferenceFields} onAdd={noop} onAddSection={noop} />
        </Stack>
      </FormSectionCard>
      <FormSectionCard title="Workflow Actions" icon="mdi:source-branch">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: 1 }}>
          <span>Sample admission workflow</span>
          <WorkflowRowActions
            workflow={
              { id: 'sample', name: 'Sample admission workflow', status: 0 } as AdmissionWorkflow
            }
            canPublish
            canEdit
            canDelete
            canClone
            canCreateVersion
            canArchive
            canReopen
            canViewUsage
            onPublish={noop}
            onEdit={noop}
            onDelete={noop}
            onClone={noop}
            onCreateVersion={noop}
            onArchive={noop}
            onReopen={noop}
            onUsage={noop}
          />
        </Stack>
        <Button onClick={() => setOpen(true)}>Preview activation dialog</Button>
      </FormSectionCard>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Activate Admission Offerings?"
        content="5 selected offerings will become active."
        icon="info"
        bodyBusy={busy}
        disableCancel={busy}
        busyLabel="Activating 0 of 5 offerings…"
        action={
          <Button disabled={busy} variant="contained" onClick={() => setBusy(true)}>
            Activate
          </Button>
        }
      />
    </>
  );
}
