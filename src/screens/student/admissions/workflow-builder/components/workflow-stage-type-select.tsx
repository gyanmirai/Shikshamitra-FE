import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useState } from 'react';
import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import {
  isApplicationStageType,
  normalizeStageConfiguration,
} from '../workflow-stage-configuration';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  readOnly: boolean;
};

export function WorkflowStageTypeSelect({ formik, metadata, stageTypes, readOnly }: Props) {
  const [pending, setPending] = useState<AdmissionWorkflowStageTypeMetadata | null>(null);
  const applyType = (next: AdmissionWorkflowStageTypeMetadata) => {
    if (readOnly) return;
    formik.setValues(
      normalizeStageConfiguration({
        ...formik.values,
        stageType: next.type,
        name:
          !formik.values.name.trim() || formik.values.name === metadata?.displayName
            ? next.displayName
            : formik.values.name,
        description:
          !formik.values.description?.trim() || formik.values.description === metadata?.description
            ? next.description
            : formik.values.description,
        configurationJson: undefined,
        isEntryStage: next.canBeEntryStage && formik.values.isEntryStage,
      })
    );
    setPending(null);
  };

  return (
    <>
      <CustomSelect
        fullWidth
        size="small"
        label="Stage type *"
        disabled={readOnly}
        value={formik.values.stageType}
        options={stageTypes
          .filter(
            (item) =>
              (isApplicationStageType(item.type) &&
                item.isRuntimeReady &&
                item.isSelectable !== false) ||
              item.type === formik.values.stageType
          )
          .map((item) => ({ value: item.type, label: item.displayName }))}
        onChange={(value) => {
          const next = stageTypes.find((item) => item.type === Number(value));
          if (!next || readOnly || next.type === formik.values.stageType) return;
          if (formik.values.configurationJson?.trim()) setPending(next);
          else applyType(next);
        }}
      />
      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        icon="warning"
        title="Change stage type?"
        content={`Changing to ${pending?.displayName ?? 'another type'} clears this stage's process settings and attached form. Your custom name and instructions stay. Review connected next steps and any stages that depend on this one before publishing.`}
        action={
          <Button
            variant="contained"
            color="warning"
            startIcon={<Iconify icon="mdi:swap-horizontal" />}
            onClick={() => pending && applyType(pending)}
          >
            Change type
          </Button>
        }
      />
    </>
  );
}
