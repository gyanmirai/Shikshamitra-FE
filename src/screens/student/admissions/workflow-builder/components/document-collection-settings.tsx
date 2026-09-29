import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { Stack, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

export function DocumentCollectionSettings({
  policy,
  stages,
  disabled,
  onChange,
}: {
  policy: AdmissionDocumentPolicy;
  stages: AdmissionWorkflowStage[];
  disabled: boolean;
  onChange: (change: Partial<AdmissionDocumentPolicy>) => void;
}) {
  const forms = stages.filter((stage) => stage.stageType === 1);
  const missing =
    policy.collectionFormStageCode &&
    !forms.some((stage) => stage.code === policy.collectionFormStageCode);
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">When to collect documents</Typography>
      <CustomSelect
        size="small"
        fullWidth
        label="Start collecting"
        disabled={disabled}
        value={policy.collectionFormStageCode ?? '__verification'}
        options={[
          { value: '__verification', label: 'During document verification' },
          ...forms.map((stage) => ({ value: stage.code, label: `During ${stage.name}` })),
          ...(missing
            ? [
                {
                  value: policy.collectionFormStageCode!,
                  label: 'Selected Form stage is unavailable',
                },
              ]
            : []),
        ]}
        onChange={(value) =>
          onChange({ collectionFormStageCode: value === '__verification' ? null : String(value) })
        }
        error={Boolean(missing)}
        helperText={
          missing
            ? 'Choose an available Form stage before publishing.'
            : 'Uploads collected during the selected form are reused here. Verification and waivers happen in this document stage.'
        }
      />
    </Stack>
  );
}
