import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { FormSectionCard } from 'src/components/form-section-card';

import { SeatingClassroomPreview } from './seating-classroom-preview';
import { useAutomaticSeatingPreview } from '../hooks/use-automatic-seating-preview';

import type { GuidedStepProps } from '../types';

export function AutomaticSeatingPreview({ workspace, workflow }: GuidedStepProps) {
  const { enabled, preview, error, retry } = useAutomaticSeatingPreview(workflow);
  const plan = workflow.selectedPlan;
  if (!enabled || !plan) return null;
  return (
    <FormSectionCard
      icon="mdi:seat"
      title="Automatic seating preview"
      descriptionTooltip="This proposal follows the selected rooms and rules. Seats are read-only. Review and apply the proposal to save it."
    >
      {error ? (
        <Alert severity="error" action={<Button onClick={retry}>Try again</Button>}>
          {error}
        </Alert>
      ) : (
        <>
          {preview && preview.unallocatedStudentIds.length > 0 && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              {preview.unallocatedStudentIds.length} students still need a seat. Add rooms or adjust
              the rules.
            </Alert>
          )}
          <SeatingClassroomPreview
            workspace={workspace}
            plan={plan}
            roomIds={workflow.formik.values.selectedRoomIds}
            preview={preview}
          />
        </>
      )}
    </FormSectionCard>
  );
}
