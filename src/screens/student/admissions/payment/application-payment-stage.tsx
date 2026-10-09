import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import AdmissionFeeSelectionPanel, {
  useFeeSelectionEditorState,
} from '../fee-selection/admission-fee-selection-panel';

import type { AdmissionFeeSelectionEditorState } from '../fee-selection/admission-fee-selection-editor';

type Props = {
  applicationId: string;
  stage: AdmissionApplicationStage;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: () => void;
  onFeeSelectionStateChange?: (state: AdmissionFeeSelectionEditorState) => void;
  compact?: boolean;
  readOnly?: boolean;
};

export function ApplicationPaymentStage({
  applicationId,
  stage,
  canAdvance,
  advancing,
  onComplete,
  onFeeSelectionStateChange,
  compact = false,
  readOnly = false,
}: Props) {
  const feeEditor = useFeeSelectionEditorState(onFeeSelectionStateChange);
  return (
    <AdmissionFeeSelectionPanel
      key={stage.id}
      applicationId={applicationId}
      outlined
      compact={compact}
      readOnly={readOnly}
      canContinue={canAdvance && !feeEditor.blocked}
      completionStageId={stage.id}
      continuing={advancing}
      onContinue={onComplete}
      onEditorStateChange={feeEditor.update}
    />
  );
}
